
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import TaskModal from './components/TaskModal';
import UserManagement from './components/UserManagement';
import UserModal from './components/UserModal';
import SettingsPage from './components/SettingsPage';
import NotificationsCenter from './components/NotificationsCenter';
import InventoryPage from './components/InventoryPage';
import LoginPage from './components/LoginPage';
import ConfirmationModal from './components/ConfirmationModal';
import { Task, User, GroupPermissions, AppNotification, Sector, InventoryItem, Machine } from './types';
import { DEFAULT_GROUPS, MOCK_TASKS } from './constants';
import { apiService } from './services/api';
import { Search, Bell, Loader2, Database, Wifi, WifiOff, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('offline');
  
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [groups, setGroups] = useState<GroupPermissions[]>(DEFAULT_GROUPS);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 'i1', name: 'Tarugos Al 6063 (Billets)', unit: 'KG', currentStock: 12500, minStock: 5000, maxStock: 25000 },
    { id: 'i2', name: 'Sucata Interna (Refugo)', unit: 'KG', currentStock: 850, minStock: 0, maxStock: 2000 },
    { id: 'i3', name: 'Embalagem Plástica (Bobina)', unit: 'UN', currentStock: 12, minStock: 20, maxStock: 100 },
  ]);

  const [machines, setMachines] = useState<Machine[]>([
    { id: 'm1', name: 'Extrusora 01 (6")', status: 'running', lastOEE: 88, currentOP: 'OP-5582' },
    { id: 'm2', name: 'Extrusora 02 (7")', status: 'idle', lastOEE: 72 },
    { id: 'm3', name: 'Usinagem CNC', status: 'running', lastOEE: 92, currentOP: 'OP-5610' },
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const initApp = async () => {
      try {
        const savedSession = localStorage.getItem('tp_session_v1');
        if (savedSession) {
          const user = JSON.parse(savedSession);
          setCurrentUser(user);
        }

        const [fetchedTasks, fetchedUsers, fetchedSectors] = await Promise.all([
          apiService.getTasks(),
          apiService.getUsers(),
          apiService.getSectors()
        ]);

        if (fetchedTasks.length > 0 || fetchedUsers.length > 0 || fetchedSectors.length > 0) {
          setTasks(fetchedTasks);
          setUsers(fetchedUsers);
          setSectors(fetchedSectors);
          setDbStatus('online');
        } else {
          setTasks(MOCK_TASKS);
          setDbStatus('offline');
        }
      } catch (error) {
        setDbStatus('offline');
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const handleSaveTask = async (task: Task) => {
    try {
      const saved = await apiService.saveTask(task);
      setTasks(prev => {
        const index = prev.findIndex(t => t.id === saved.id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = saved;
          return updated;
        }
        return [saved, ...prev];
      });
    } catch (e) {
      console.error("Save Task Error:", e);
    }
  };

  const handleSaveUser = async (user: User) => {
    try {
      const saved = await apiService.saveUser(user);
      setUsers(prev => {
        const index = prev.findIndex(u => u.id === saved.id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = saved;
          return updated;
        }
        return [...prev, saved];
      });
    } catch (e) {
      console.error("Save User Error:", e);
    }
    setIsUserModalOpen(false);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    if (currentUser) {
      await apiService.logout(currentUser);
    }
    localStorage.removeItem('tp_session_v1');
    setCurrentUser(null);
    setIsLogoutConfirmOpen(false);
  };

  const visibleTasks = useMemo(() => {
    return tasks.filter(task => {
      const term = searchTerm.toLowerCase();
      return (task.description || '').toLowerCase().includes(term) ||
             (task.productProfile || '').toLowerCase().includes(term) ||
             (task.opNumber || '').toLowerCase().includes(term) ||
             (task.id || '').toLowerCase().includes(term);
    });
  }, [tasks, searchTerm]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Database className="w-6 h-6 text-blue-300" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-white font-black uppercase tracking-[0.3em] text-sm">TecnoPerfil Alumínio</p>
          <p className="text-slate-500 text-xs mt-2 animate-pulse font-medium tracking-widest">Sincronizando Ecossistema Industrial...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsLogoutConfirmOpen(true)} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0 shadow-sm">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                dbStatus === 'online' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
              }`}>
                {dbStatus === 'online' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {dbStatus === 'online' ? 'Cloud Sync On' : 'Local Dev Mode'}
              </div>
            </div>
            
            <div className="relative max-w-md w-full hidden lg:block">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="text" 
                placeholder="Pesquisar por OP, Perfil ou Descrição Industrial..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-bold focus:ring-4 focus:ring-blue-50/50 outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('notifications')} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl relative transition-all group">
              <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {notifications.some(n => !n.read) && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 tracking-tight">{currentUser.name}</p>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">Usuário Autenticado</p>
              </div>
              <div className="relative group">
                <img 
                  src={currentUser.avatar} 
                  className="w-11 h-11 rounded-2xl shadow-lg border-2 border-white object-cover group-hover:scale-105 transition-transform cursor-pointer" 
                  alt="Profile" 
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth bg-slate-50/50">
          {activeTab === 'dashboard' && <Dashboard tasks={visibleTasks} inventoryProp={inventory} machinesProp={machines} />}
          {activeTab === 'kanban' && <TaskBoard tasks={visibleTasks} onTaskClick={(t) => { setSelectedTask(t); setIsModalOpen(true); }} onAddTask={() => { setSelectedTask(undefined); setIsModalOpen(true); }} />}
          {activeTab === 'inventory' && <InventoryPage inventory={inventory} onUpdateInventory={setInventory} />}
          {activeTab === 'users' && <UserManagement users={users} groups={groups} sectors={sectors} onUpdateUser={handleSaveUser} onAddUser={() => { setEditingUser(undefined); setIsUserModalOpen(true); }} onEditUser={(u) => { setEditingUser(u); setIsUserModalOpen(true); }} />}
          {activeTab === 'settings' && <SettingsPage groups={groups} sectors={sectors} machines={machines} onUpdatePermissions={(gid, perms) => setGroups(prev => prev.map(g => g.id === gid ? {...g, ...perms} : g))} onAddGroup={(g) => setGroups(prev => [...prev, g])} onUpdateGroup={(g) => setGroups(prev => prev.map(old => old.id === g.id ? g : old))} onDeleteGroup={(id) => setGroups(prev => prev.filter(g => g.id !== id))} onAddSector={(s) => setSectors(prev => [...prev, s])} onUpdateSector={(s) => setSectors(prev => prev.map(old => old.id === s.id ? s : old))} onDeleteSector={(id) => setSectors(prev => prev.filter(s => s.id !== id))} onAddMachine={(m) => setMachines(prev => [...prev, m])} onUpdateMachine={(m) => setMachines(prev => prev.map(old => old.id === m.id ? m : old))} onDeleteMachine={(id) => setMachines(prev => prev.filter(m => m.id !== id))} />}
          {activeTab === 'notifications' && <NotificationsCenter notifications={notifications} onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))} onClearAll={() => setNotifications([])} />}
        </div>
      </main>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={selectedTask} 
        onSave={handleSaveTask} 
        availableUsers={users} 
        availableGroups={groups} 
        sectors={sectors} 
        currentUser={currentUser || undefined}
      />
      <UserModal isOpen={isUserModalOpen} user={editingUser} groups={groups} sectors={sectors} onClose={() => { setIsUserModalOpen(false); setEditingUser(undefined); }} onSave={handleSaveUser} />
      
      <ConfirmationModal 
        isOpen={isLogoutConfirmOpen}
        title="Encerrar Sessão?"
        message="Você precisará de suas credenciais industriais para acessar o ecossistema Tecnoperfil novamente."
        confirmLabel="Sim, Sair agora"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        type="danger"
      />
    </div>
  );
};

export default App;
