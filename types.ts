
export enum TaskVisibility {
  GLOBAL = 'Global',
  GROUP = 'Grupo',
  SECTOR = 'Setor',
  PRIVATE = 'Privado'
}

export enum NotificationTarget {
  NONE = 'Nenhuma',
  INDIVIDUAL = 'Individual',
  GROUP = 'Grupo',
  GLOBAL = 'Global'
}

export interface Sector {
  id: string;
  name: string;
  initials: string;
  active: boolean;
  color?: string;
}

export enum UserRole {
  ADMIN = 'Administrador',
  PCP = 'PCP',
  PRODUCTION = 'Produção',
  QUALITY = 'Qualidade'
}

export interface GroupPermissions {
  id: string;
  name: string;
  description?: string;
  canCreate: boolean;
  canViewAll: boolean;
  canUpdateStatus: boolean;
  canComment: boolean;
  canAttach: boolean;
  canFinish: boolean;
  canViewDashboards: boolean;
  isSystem?: boolean;
}

export enum TaskType {
  ROUTINE = 'Rotina de Trabalho',
  QUALITY_TEST = 'Teste de Qualidade',
  PRODUCTION_PRIORITY = 'Prioridade de Produção',
  SAMPLE_CUT = 'Corte de Amostra',
  MACHINING_REQUEST = 'Solicitação de Usinagem',
  SHIPPING_PRIORITY = 'Prioridade de Expedição',
  OPERATIONAL_INCIDENT = 'Ocorrência Operacional'
}

export enum TaskPriority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta',
  CRITICAL = 'Crítica'
}

export enum TaskStatus {
  OPEN = 'Aberto',
  IN_PROGRESS = 'Em andamento',
  WAITING = 'Aguardando',
  COMPLETED = 'Concluído',
  CANCELED = 'Cancelado'
}

export enum StepStatus {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em andamento',
  COMPLETED = 'Concluída'
}

export interface TaskStep {
  id: string;
  title: string;
  description?: string;
  responsibleGroupId: string;
  responsibleUserId?: string;
  deadline?: string;
  status: StepStatus;
  order: number;
  completedAt?: string;
  completedBy?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  sectorId: string;
  groupIds: string[];
  active: boolean;
  avatar?: string;
  isOnline: boolean;
  lastAccess: string;
}

export interface TaskHistory {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details: string;
  comment?: string;
  type: 'system' | 'manual' | 'step';
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  date: string;
}

export interface QualityMetrics {
  hardnessWebster?: number;
  layerThickness?: number;
  lengthTolerance?: boolean;
  visualInspection?: 'Aprovado' | 'Reprovado';
}

export interface Task {
  id: string;
  type: TaskType;
  requestingSector: string;
  responsibleSector: string;
  priority: TaskPriority;
  description: string;
  productProfile: string;
  opNumber?: string;
  quantity?: number;
  openDate: string; // Data de abertura no sistema
  createdAt: string; // Data real de criação (ISO)
  createdBy: string; // Nome do criador
  startedAt?: string; // Início da execução
  completedAt?: string; // Fim da execução
  deadline: string;
  responsibleId?: string;
  executorGroupId: string;
  requestorId: string;
  followerIds: string[];
  status: TaskStatus;
  visibility: TaskVisibility;
  visibleGroupIds?: string[];
  visibleUserIds?: string[];
  visibleSectorIds?: string[];
  history: TaskHistory[];
  attachments: Attachment[];
  steps: TaskStep[];
  notificationTarget?: NotificationTarget;
  qualityMetrics?: QualityMetrics;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  date: string;
  read: boolean;
  taskId?: string;
}

export interface Machine {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'down' | 'maintenance';
  lastOEE: number;
  currentOP?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
}
