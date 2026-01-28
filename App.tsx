
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import TaskModal from './components/TaskModal';
import UserManagement from './components/UserManagement';
import UserModal from './components/UserModal';
import SettingsPage from './components/SettingsPage';
import NotificationsCenter from './components/NotificationsCenter';
import { Task, User, GroupPermissions, AppNotification, Sector } from './types';
import { MOCK_TASKS, MOCK_USERS, DEFAULT_GROUPS } from './constants';
import { Search, Bell, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dynamic Configuration State
  const [sectors, setSectors] = useState<Sector[]>([
    { id: 's-1', name: 'Administrador', initials: 'ADM', active: true },
    { id: 's-2', name: 'PCP', initials: 'PCP', active: true },
    { id: 's-3', name: 'Produção (Extrusão)', initials: 'PROD', active: true },
    { id: 's-4', name: 'Qualidade', initials: 'QUAL', active: true },
    { id: 's-5', name: 'Usinagem', initials: 'USIN', active: true },
    { id: 's-6', name: 'Expedição', initials: 'EXP', active: true },
  ]);

  const [groups, setGroups] = useState<GroupPermissions[]>(DEFAULT_GROUPS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS.map(u => ({ 
    ...u, 
    sectorId: sectors.find(s => s.name.includes(u.sector))?.id || sectors[0].id 
  })));
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS as any);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: 'n1', title: 'Atividade Atrasada', message: 'A OP-5582 está com o prazo vencido.', type: 'alert', date: new Date().toISOString(), read: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser] = useState<User>(users[0]);

  // Sector Handlers
  const handleAddSector = (sector: Sector) => setSectors(prev => [...prev, { ...sector, id: `s-${Date.now()}` }]);
  const handleUpdateSector = (sector: Sector) => setSectors(prev => prev.map(s => s.id === sector.id ? sector : s));
  const handleDeleteSector = (id: string) => setSectors(prev => prev.filter(s => s.id !== id));

  // Group/Profile Handlers
  const handleAddGroup = (group: GroupPermissions) => setGroups(prev => [...prev, { ...group, id: `g-${Date.now()}` }]);
  const handleUpdateGroup = (group: GroupPermissions) => setGroups(prev => prev.map(g => g.id === group.id ? group : g));
  const handleDeleteGroup = (id: string) => setGroups(prev => prev.filter(g => g.id !== id));

  const visibleTasks = useMemo(() => {
    return tasks.filter(task => {
      const term = searchTerm.toLowerCase();
      return (task.description || '').toLowerCase().includes(term) ||
             (task.productProfile || '').toLowerCase().includes(term) ||
             (task.opNumber || '').toLowerCase().includes(term);
    });
  }, [tasks, searchTerm]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar por OP, produto ou descrição..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('notifications')} className="p-2.5 text-slate-400 hover:text-blue-600 rounded-2xl relative transition-all">
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />}
            </button>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online</p>
              </div>
              <img src={currentUser.avatar} className="w-10 h-10 rounded-2xl shadow-md border-2 border-white" alt="Profile" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          {activeTab === 'dashboard' && <Dashboard tasks={visibleTasks} />}
          
          {activeTab === 'kanban' && (
            <TaskBoard 
              tasks={visibleTasks} 
              onTaskClick={(task) => { setSelectedTask(task); setIsModalOpen(true); }} 
              onAddTask={() => { setSelectedTask(undefined); setIsModalOpen(true); }} 
            />
          )}

          {activeTab === 'users' && (
            <UserManagement 
              users={users} 
              groups={groups} 
              sectors={sectors}
              onUpdateUser={(u) => setUsers(prev => prev.map(old => old.id === u.id ? u : old))}
              onAddUser={() => { setEditingUser(undefined); setIsUserModalOpen(true); }}
              onEditUser={(u) => { setEditingUser(u); setIsUserModalOpen(true); }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage 
              groups={groups} 
              sectors={sectors}
              onUpdatePermissions={(gid, perms) => setGroups(prev => prev.map(g => g.id === gid ? {...g, ...perms} : g))}
              onAddGroup={handleAddGroup}
              onUpdateGroup={handleUpdateGroup}
              onDeleteGroup={handleDeleteGroup}
              onAddSector={handleAddSector}
              onUpdateSector={handleUpdateSector}
              onDeleteSector={handleDeleteSector}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsCenter 
              notifications={notifications}
              onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))}
              onClearAll={() => setNotifications([])}
            />
          )}
        </div>
      </main>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={selectedTask} 
        onSave={(t) => setTasks(prev => selectedTask ? prev.map(old => old.id === t.id ? t : old) : [t, ...prev])}
        availableUsers={users}
        availableGroups={groups}
      />

      <UserModal
        isOpen={isUserModalOpen}
        user={editingUser}
        groups={groups}
        sectors={sectors}
        onClose={() => { setIsUserModalOpen(false); setEditingUser(undefined); }}
        onSave={(u) => {
          if (editingUser) {
            setUsers(prev => prev.map(old => old.id === u.id ? u : old));
          } else {
            setUsers(prev => [...prev, { ...u, id: `u-${Date.now()}` }]);
          }
          setIsUserModalOpen(false);
        }}
      />
    </div>
  );
};

export default App;
