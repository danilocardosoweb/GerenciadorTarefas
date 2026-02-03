
import React, { useState } from 'react';
import { GroupPermissions, Sector, Machine } from '../types';
import { 
  Shield, 
  Settings as SettingsIcon, 
  Database, 
  Bell, 
  Factory,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Info,
  PlayCircle,
  StopCircle,
  Hammer,
  Activity,
  Save,
  X
} from 'lucide-react';

interface SettingsPageProps {
  groups: GroupPermissions[];
  sectors: Sector[];
  machines: Machine[];
  onUpdatePermissions: (groupId: string, perms: Partial<GroupPermissions>) => void;
  onAddGroup: (group: GroupPermissions) => void;
  onUpdateGroup: (group: GroupPermissions) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddSector: (sector: Sector) => void;
  onUpdateSector: (sector: Sector) => void;
  onDeleteSector: (sectorId: string) => void;
  onAddMachine: (machine: Machine) => void;
  onUpdateMachine: (machine: Machine) => void;
  onDeleteMachine: (machineId: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  groups, sectors, machines,
  onUpdatePermissions, onAddGroup, onUpdateGroup, onDeleteGroup,
  onAddSector, onUpdateSector, onDeleteSector,
  onAddMachine, onUpdateMachine, onDeleteMachine
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'permissions' | 'industrial' | 'system'>('permissions');
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupPermissions | null>(null);
  
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  const permissionKeys: (keyof GroupPermissions)[] = [
    'canCreate', 'canViewAll', 'canUpdateStatus', 'canComment', 'canAttach', 'canFinish', 'canViewDashboards'
  ];

  const labels: Record<string, string> = {
    canCreate: 'Criar Tarefas',
    canViewAll: 'Visualizar Tudo',
    canUpdateStatus: 'Alterar Status',
    canComment: 'Comentar',
    canAttach: 'Anexar',
    canFinish: 'Finalizar',
    canViewDashboards: 'Dashboards'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h2>
          <p className="text-slate-500">Gerencie diretrizes de segurança, equipamentos e parâmetros operacionais</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-200/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveSubTab('permissions')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeSubTab === 'permissions' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" /> Matriz de Acessos
        </button>
        <button
          onClick={() => setActiveSubTab('industrial')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeSubTab === 'industrial' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Factory className="w-4 h-4" /> Planta Industrial
        </button>
        <button
          onClick={() => setActiveSubTab('system')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeSubTab === 'system' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Database className="w-4 h-4" /> Parâmetros de API
        </button>
      </div>

      <div className="mt-6">
        {activeSubTab === 'permissions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">Perfis de Acesso</h3>
                <p className="text-xs text-slate-500">Defina os papéis e responsabilidades</p>
              </div>
              <button 
                onClick={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                <Plus className="w-4 h-4" /> Novo Perfil
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] min-w-[240px]">Permissão Industrial</th>
                    {groups.map(group => (
                      <th key={group.id} className="px-6 py-6 text-center min-w-[140px]">
                        <div className="flex flex-col items-center gap-1 group">
                          <span className="text-xs font-black text-slate-700 uppercase">{group.name}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingGroup(group); setIsGroupModalOpen(true); }} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit2 className="w-3 h-3" /></button>
                            {!group.isSystem && <button onClick={() => onDeleteGroup(group.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><Trash2 className="w-3 h-3" /></button>}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {permissionKeys.map(key => (
                    <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700 text-sm flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-blue-500" />
                        {labels[key as string]}
                      </td>
                      {groups.map(group => (
                        <td key={group.id} className="px-6 py-4 text-center">
                          <button
                            onClick={() => onUpdatePermissions(group.id, { [key]: !group[key] })}
                            className={`w-11 h-6 rounded-full transition-all relative ${group[key] ? 'bg-blue-600' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${group[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'industrial' && (
          <div className="space-y-12">
            {/* Seção de Máquinas - NOVO */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">Equipamentos & Linhas</h3>
                  <p className="text-xs text-slate-500">Gestão de máquinas visíveis no Dashboard</p>
                </div>
                <button 
                  onClick={() => { setEditingMachine(null); setIsMachineModalOpen(true); }}
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200"
                >
                  <Plus className="w-4 h-4" /> Cadastrar Máquina
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {machines.map(machine => (
                  <div key={machine.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-2xl ${
                        machine.status === 'running' ? 'bg-emerald-50 text-emerald-500' :
                        machine.status === 'idle' ? 'bg-amber-50 text-amber-500' :
                        machine.status === 'maintenance' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'
                      }`}>
                        {machine.status === 'running' ? <PlayCircle className="w-6 h-6" /> :
                         machine.status === 'maintenance' ? <Hammer className="w-6 h-6" /> : <StopCircle className="w-6 h-6" />}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingMachine(machine); setIsMachineModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => onDeleteMachine(machine.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-black text-slate-800 text-sm uppercase">{machine.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status: {machine.status === 'running' ? 'Produzindo' : machine.status === 'maintenance' ? 'Manutenção' : 'Ociosa'}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">OEE: {machine.lastOEE}%</span>
                       <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{machine.currentOP || 'Sem OP'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seção de Setores */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">Setores Operacionais</h3>
                  <p className="text-xs text-slate-500">Estrutura organizacional da TecnoPerfil</p>
                </div>
                <button 
                  onClick={() => { setEditingSector(null); setIsSectorModalOpen(true); }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  <Plus className="w-4 h-4" /> Novo Setor
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sectors.map(sector => (
                  <div key={sector.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center font-black text-blue-600 shadow-inner">
                        {sector.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{sector.name}</h4>
                        <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${sector.active ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {sector.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => { setEditingSector(sector); setIsSectorModalOpen(true); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onDeleteSector(sector.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" /> Alertas Inteligentes
              </h3>
              <div className="space-y-6">
                <ToggleItem title="Gargalos por IA" desc="Permitir que a Gemini analise atrasos automaticamente" active={true} />
                <ToggleItem title="Estoque Crítico" desc="Notificar quando insumo atingir 10% do mínimo" active={true} />
                <ToggleItem title="OEE Baixo" desc="Alertar supervisão se OEE cair abaixo de 70%" active={false} />
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col justify-center items-center text-center">
              <Database className="w-12 h-12 text-blue-500 mb-6" />
              <h3 className="font-black text-xl tracking-tight">Exportação Manual</h3>
              <p className="text-sm text-slate-400 mt-2 mb-8 max-w-xs">
                Como não há ERP integrado, você pode baixar o consolidado semanal em Excel para seus registros fiscais.
              </p>
              <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-50 transition-all">
                Exportar Relatório Mensal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE MÁQUINA - NOVO */}
      {isMachineModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{editingMachine ? 'Editar Equipamento' : 'Novo Equipamento'}</h3>
              </div>
              <button onClick={() => setIsMachineModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome da Máquina</label>
                <input 
                  value={editingMachine?.name || ''} 
                  onChange={e => setEditingMachine(prev => prev ? {...prev, name: e.target.value} : { id: `m-${Date.now()}`, name: e.target.value, status: 'idle', lastOEE: 0 })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-blue-100" 
                  placeholder="Ex: Extrusora de 7 Pol"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Atual</label>
                <select 
                  value={editingMachine?.status || 'idle'}
                  onChange={e => setEditingMachine(prev => prev ? {...prev, status: e.target.value as any} : null)}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold outline-none"
                >
                  <option value="running">Em Produção (Rodando)</option>
                  <option value="idle">Disponível (Parada)</option>
                  <option value="maintenance">Manutenção (Preventiva/Corretiva)</option>
                  <option value="down">Falha Crítica (Gargalo)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OEE Estimado (%)</label>
                    <input 
                      type="number"
                      value={editingMachine?.lastOEE || 0} 
                      onChange={e => setEditingMachine(prev => prev ? {...prev, lastOEE: Number(e.target.value)} : null)}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold outline-none" 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OP em Processo</label>
                    <input 
                      value={editingMachine?.currentOP || ''} 
                      onChange={e => setEditingMachine(prev => prev ? {...prev, currentOP: e.target.value} : null)}
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold outline-none" 
                      placeholder="Ex: OP-5582"
                    />
                 </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={() => setIsMachineModalOpen(false)} className="flex-1 py-4 font-black text-[10px] uppercase text-slate-400">Cancelar</button>
                <button 
                  onClick={() => {
                    if (editingMachine) {
                      editingMachine.id.startsWith('m-') ? onAddMachine(editingMachine) : onUpdateMachine(editingMachine);
                      setIsMachineModalOpen(false);
                    }
                  }}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100"
                >
                  <Save className="w-4 h-4 inline mr-2" /> Sincronizar Máquina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modais Setor/Grupo (Mantidos) */}
      {/* Fix: replaced 'sector' with 'editingSector' and 'group' with 'editingGroup' in onSave callbacks to resolve undefined variable errors */}
      {isSectorModalOpen && (
        <SectorModal 
          sector={editingSector} 
          onClose={() => setIsSectorModalOpen(false)} 
          onSave={(s: Sector) => { editingSector ? onUpdateSector(s) : onAddSector(s); setIsSectorModalOpen(false); }} 
        />
      )}
      {isGroupModalOpen && (
        <GroupModal 
          group={editingGroup} 
          onClose={() => setIsGroupModalOpen(false)} 
          onSave={(g: GroupPermissions) => { editingGroup ? onUpdateGroup(g) : onAddGroup(g); setIsGroupModalOpen(false); }} 
        />
      )}
    </div>
  );
};

const SectorModal = ({ sector, onClose, onSave }: any) => {
  const [data, setData] = useState<Partial<Sector>>(sector || { name: '', initials: '', active: true });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
        <h3 className="text-xl font-bold text-slate-800">{sector ? 'Editar Setor' : 'Novo Setor'}</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Setor</label>
            <input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-blue-500" placeholder="Ex: Engenharia" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sigla</label>
            <input value={data.initials} maxLength={4} onChange={e => setData({...data, initials: e.target.value.toUpperCase()})} className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold" />
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-500">Cancelar</button>
          <button onClick={() => onSave(data)} className="flex-1 py-3 font-bold bg-blue-600 text-white rounded-2xl">Salvar</button>
        </div>
      </div>
    </div>
  );
};

const GroupModal = ({ group, onClose, onSave }: any) => {
  const [data, setData] = useState<Partial<GroupPermissions>>(group || { name: '', canCreate: false });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
        <h3 className="text-xl font-bold text-slate-800">{group ? 'Editar Perfil' : 'Novo Perfil'}</h3>
        <input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-blue-500" />
        <div className="flex gap-2 pt-4">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-500">Cancelar</button>
          <button onClick={() => onSave(data)} className="flex-1 py-3 font-bold bg-blue-600 text-white rounded-2xl">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

const ToggleItem = ({ title, desc, active }: any) => {
  const [isOn, setIsOn] = useState(active);
  return (
    <div className="flex items-center justify-between group">
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-[11px] text-slate-400">{desc}</p>
      </div>
      <button 
        onClick={() => setIsOn(!isOn)}
        className={`w-10 h-6 rounded-full relative transition-all shrink-0 ${isOn ? 'bg-blue-600' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isOn ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );
};

export default SettingsPage;
