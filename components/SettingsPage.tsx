
import React, { useState } from 'react';
import { GroupPermissions, Sector } from '../types';
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
  Info
} from 'lucide-react';

interface SettingsPageProps {
  groups: GroupPermissions[];
  sectors: Sector[];
  onUpdatePermissions: (groupId: string, perms: Partial<GroupPermissions>) => void;
  onAddGroup: (group: GroupPermissions) => void;
  onUpdateGroup: (group: GroupPermissions) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddSector: (sector: Sector) => void;
  onUpdateSector: (sector: Sector) => void;
  onDeleteSector: (sectorId: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  groups, sectors, 
  onUpdatePermissions, onAddGroup, onUpdateGroup, onDeleteGroup,
  onAddSector, onUpdateSector, onDeleteSector
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'permissions' | 'industrial' | 'system'>('permissions');
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupPermissions | null>(null);

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h2>
          <p className="text-slate-500">Gerencie diretrizes de segurança, setores e parâmetros operacionais</p>
        </div>
      </div>

      {/* Tabs Internas */}
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
          <Factory className="w-4 h-4" /> Setores Industriais
        </button>
        <button
          onClick={() => setActiveSubTab('system')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeSubTab === 'system' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Database className="w-4 h-4" /> Parâmetros & API
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">Setores Operacionais</h3>
                <p className="text-xs text-slate-500">Estrutura organizacional da TecnoPerfil</p>
              </div>
              <button 
                onClick={() => { setEditingSector(null); setIsSectorModalOpen(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                <Plus className="w-4 h-4" /> Novo Setor
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectors.map(sector => (
                <div key={sector.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-blue-600 shadow-inner">
                      {sector.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{sector.name}</h4>
                      <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${sector.active ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {sector.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {sector.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => { setEditingSector(sector); setIsSectorModalOpen(true); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteSector(sector.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" /> Gatilhos de Notificação
              </h3>
              <div className="space-y-6">
                <ToggleItem 
                  title="Alertas de Atraso" 
                  desc="Notificar PCP quando OPs excederem 24h de atraso" 
                  active={true}
                />
                <ToggleItem 
                  title="Confirmação de Qualidade" 
                  desc="Avisar Produção quando teste for Aprovado" 
                  active={false}
                />
                <ToggleItem 
                  title="Resumo Semanal" 
                  desc="Enviar PDF consolidado para gerência toda sexta" 
                  active={true}
                />
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                <Database className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-800">Integração com ERP</h3>
              <p className="text-sm text-slate-500 mt-2 mb-6 max-w-xs">
                Sincronize automaticamente suas OPs com o banco de dados principal da TecnoPerfil via Webhooks.
              </p>
              <button className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200">
                Gerar Token de API
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modais Customizados */}
      {isSectorModalOpen && (
        <SectorModal 
          sector={editingSector} 
          onClose={() => setIsSectorModalOpen(false)} 
          onSave={(s) => {
            editingSector ? onUpdateSector(s) : onAddSector(s);
            setIsSectorModalOpen(false);
          }} 
        />
      )}

      {isGroupModalOpen && (
        <GroupModal 
          group={editingGroup} 
          onClose={() => setIsGroupModalOpen(false)} 
          onSave={(g) => {
            editingGroup ? onUpdateGroup(g) : onAddGroup(g);
            setIsGroupModalOpen(false);
          }} 
        />
      )}
    </div>
  );
};

// Componentes Auxiliares (Modais Internos)
const SectorModal = ({ sector, onClose, onSave }: any) => {
  const [data, setData] = useState<Partial<Sector>>(sector || { name: '', initials: '', active: true });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
        <h3 className="text-xl font-bold text-slate-800">{sector ? 'Editar Setor' : 'Novo Setor'}</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Setor</label>
            <input 
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-blue-500" 
              placeholder="Ex: Engenharia de Processos"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sigla / Initials</label>
            <input 
              value={data.initials} 
              maxLength={4}
              onChange={e => setData({...data, initials: e.target.value.toUpperCase()})}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold" 
              placeholder="ENG"
            />
          </div>
          <div className="flex items-center gap-3 py-2">
            <button
              onClick={() => setData({...data, active: !data.active})}
              className={`w-10 h-6 rounded-full relative transition-all ${data.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${data.active ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <span className="text-xs font-bold text-slate-600">Setor Ativo para Novas OPs</span>
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">Cancelar</button>
          <button onClick={() => onSave(data)} className="flex-1 py-3 font-bold bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">Salvar Setor</button>
        </div>
      </div>
    </div>
  );
};

const GroupModal = ({ group, onClose, onSave }: any) => {
  const [data, setData] = useState<Partial<GroupPermissions>>(group || { name: '', canCreate: false, canViewAll: false, canUpdateStatus: false, canComment: true, canAttach: true, canFinish: false, canViewDashboards: false });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
        <h3 className="text-xl font-bold text-slate-800">{group ? 'Editar Perfil' : 'Novo Perfil de Acesso'}</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Perfil</label>
            <input 
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-blue-500" 
              placeholder="Ex: Inspetor de Linha"
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl flex gap-3">
             <Info className="w-5 h-5 text-blue-400 shrink-0" />
             <p className="text-[10px] text-blue-700 leading-relaxed">
               As permissões específicas deste perfil devem ser ajustadas na Matriz de Acessos após a criação.
             </p>
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">Cancelar</button>
          <button onClick={() => onSave(data)} className="flex-1 py-3 font-bold bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">Confirmar Perfil</button>
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
