
import { User, Task, GroupPermissions, TaskVisibility, TaskStatus } from '../types';

export const canViewTask = (user: User, task: Task, groups: GroupPermissions[]): boolean => {
  if (!user.active) return false;
  
  // Admins e PCP com canViewAll podem ver tudo (Regra de Master Admin)
  const userPermissions = groups.filter(g => user.groupIds.includes(g.id));
  if (userPermissions.some(p => p.canViewAll)) return true;

  // Visibilidade Global
  if (task.visibility === TaskVisibility.GLOBAL) return true;

  // Criador ou Responsável Individual sempre veem
  if (task.requestorId === user.id || task.responsibleId === user.id) return true;

  // Se o usuário pertence ao grupo executor da atividade
  if (user.groupIds.includes(task.executorGroupId)) return true;

  // Se usuário está na lista de acompanhadores (Followers)
  if (task.followerIds && task.followerIds.includes(user.id)) return true;

  // Visibilidade por Setor (NOVO)
  if (task.visibility === TaskVisibility.SECTOR && task.visibleSectorIds) {
    if (task.visibleSectorIds.includes(user.sectorId)) return true;
  }

  // Visibilidade por Grupo/Perfil
  if (task.visibility === TaskVisibility.GROUP && task.visibleGroupIds) {
    if (user.groupIds.some(gid => task.visibleGroupIds?.includes(gid))) return true;
  }

  // Visibilidade Privada (Apenas IDs de usuário específicos)
  if (task.visibility === TaskVisibility.PRIVATE && task.visibleUserIds) {
    if (task.visibleUserIds.includes(user.id)) return true;
  }

  return false;
};

export const canUpdateTaskStatus = (user: User, task: Task, groups: GroupPermissions[], nextStatus: TaskStatus): boolean => {
  const userPermissions = groups.filter(g => user.groupIds.includes(g.id));
  const canUpdate = userPermissions.some(p => p.canUpdateStatus);
  const isAdmin = userPermissions.some(p => p.id === 'g-admin' || p.id === 'g-pcp');

  if (!canUpdate && !isAdmin) return false;

  // Regra: Somente grupo executor ou responsável individual pode mover para "Em andamento"
  if (nextStatus === TaskStatus.IN_PROGRESS) {
    return user.groupIds.includes(task.executorGroupId) || user.id === task.responsibleId || isAdmin;
  }

  // Regra: Somente responsável (individual ou executor) ou admin pode finalizar
  if (nextStatus === TaskStatus.COMPLETED) {
    const canFinish = userPermissions.some(p => p.canFinish);
    return (user.id === task.responsibleId || user.groupIds.includes(task.executorGroupId) || isAdmin) && canFinish;
  }

  return true;
};
