
import { Task, User, Sector, GroupPermissions, TaskStatus, TaskPriority, TaskType, TaskVisibility, StepStatus } from '../types';
import { supabase } from './supabaseClient';

/**
 * Utilitários de mapeamento entre DB (snake_case) e UI (camelCase)
 */
const mapTaskFromDB = (dbTask: any): Task => ({
  id: dbTask.id,
  type: dbTask.type as TaskType,
  requestingSector: dbTask.requesting_sector,
  responsibleSector: dbTask.responsible_sector,
  priority: dbTask.priority as TaskPriority,
  description: dbTask.description,
  productProfile: dbTask.product_profile,
  opNumber: dbTask.op_number,
  quantity: dbTask.quantity,
  openDate: dbTask.open_date,
  // Added missing createdAt and createdBy fields from DB to satisfy Task interface
  createdAt: dbTask.created_at,
  createdBy: dbTask.created_by,
  deadline: dbTask.deadline,
  responsibleId: dbTask.responsible_id,
  executorGroupId: dbTask.executor_group_id,
  requestorId: dbTask.requestor_id,
  status: dbTask.status as TaskStatus,
  visibility: dbTask.visibility as TaskVisibility,
  followerIds: dbTask.task_followers?.map((f: any) => f.user_id) || [],
  steps: (dbTask.task_steps || []).map((s: any) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    responsibleGroupId: s.responsible_group_id,
    responsibleUserId: s.responsible_user_id,
    deadline: s.deadline,
    status: s.status as StepStatus,
    order: s.order_index,
    completedAt: s.completed_at,
    completedBy: s.completed_by
  })).sort((a: any, b: any) => a.order - b.order),
  history: (dbTask.task_history || []).map((h: any) => ({
    id: h.id,
    userId: h.user_id,
    userName: h.user_name,
    action: h.action,
    timestamp: h.timestamp,
    details: h.details,
    comment: h.comment,
    type: h.type
  })),
  attachments: (dbTask.task_attachments || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    url: a.url,
    uploadedBy: a.uploaded_by,
    date: a.created_at
  }))
});

const handleApiError = (error: any, context: string) => {
  console.error(`[Supabase Error - ${context}]:`, error);
  if (error.message?.includes('fetch') || error.message?.includes('NetworkError')) {
    return 'Falha na conexão com o banco de dados. Verifique sua internet ou se o domínio da Vercel está autorizado no painel do Supabase (CORS).';
  }
  return error.message || 'Erro inesperado na base de dados.';
};

export const apiService = {
  getSectors: async (): Promise<Sector[]> => {
    try {
      const { data, error } = await supabase.from('sectors').select('*').order('name');
      if (error) throw error;
      return data || [];
    } catch (e) {
      handleApiError(e, 'getSectors');
      return [];
    }
  },

  getTasks: async (): Promise<Task[]> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_steps (*),
          task_history (*),
          task_attachments (*),
          task_followers (user_id)
        `)
        .order('open_date', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapTaskFromDB);
    } catch (e) {
      handleApiError(e, 'getTasks');
      return [];
    }
  },

  saveTask: async (task: Task): Promise<Task> => {
    const dbTask = {
      id: task.id,
      type: task.type,
      requesting_sector: task.requestingSector,
      responsible_sector: task.responsibleSector,
      priority: task.priority,
      description: task.description,
      product_profile: task.productProfile,
      op_number: task.opNumber,
      quantity: task.quantity,
      open_date: task.openDate,
      // Added missing created_at and created_by fields for persistence
      created_at: task.createdAt,
      created_by: task.createdBy,
      deadline: task.deadline,
      responsible_id: task.responsibleId,
      executor_group_id: task.executorGroupId,
      requestor_id: task.requestorId,
      status: task.status,
      visibility: task.visibility
    };

    const { data, error } = await supabase.from('tasks').upsert(dbTask).select().single();
    if (error) throw error;
    return mapTaskFromDB(data);
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase.from('users').select('*').order('name');
      if (error) throw error;
      return (data || []).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        sectorId: u.sector_id,
        active: u.active ?? true,
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`,
        isOnline: u.is_online ?? false,
        lastAccess: u.last_access || new Date().toISOString(),
        groupIds: []
      }));
    } catch (e) {
      handleApiError(e, 'getUsers');
      return [];
    }
  },

  saveUser: async (user: User, password?: string): Promise<User> => {
    const dbUser: any = {
      id: user.id,
      name: user.name,
      email: user.email,
      sector_id: user.sectorId,
      active: user.active,
      avatar: user.avatar,
      is_online: user.isOnline,
      last_access: user.lastAccess
    };
    if (password) dbUser.password = password;
    const { error } = await supabase.from('users').upsert(dbUser);
    if (error) throw error;
    return user;
  },

  login: async (email: string, pass: string): Promise<{user: User | null, error?: string}> => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('password', pass)
        .maybeSingle();

      if (error) {
        return { user: null, error: handleApiError(error, 'login') };
      }

      if (!data) {
        return { user: null, error: 'Usuário não encontrado ou senha industrial incorreta.' };
      }

      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        sectorId: data.sector_id,
        active: data.active !== false,
        avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}`,
        isOnline: true,
        lastAccess: new Date().toISOString(),
        groupIds: [] 
      };

      if (!user.active) {
        return { user: null, error: 'Seu acesso foi desativado pelo administrador.' };
      }
      
      localStorage.setItem('tp_session_v1', JSON.stringify(user));
      return { user };
    } catch (err: any) {
      return { user: null, error: handleApiError(err, 'critical_login') };
    }
  },

  logout: async (user: User) => {
    localStorage.removeItem('tp_session_v1');
  }
};
