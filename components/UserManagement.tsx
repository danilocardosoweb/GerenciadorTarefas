
import React from 'react';
import { User, GroupPermissions, Sector } from '../types';
import { UserPlus, Edit2, Trash2, Shield, Mail, Briefcase, CheckCircle, XCircle } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  groups: GroupPermissions[];
  sectors: Sector[];
  onUpdateUser: (user: User) => void;
  onAddUser: () => void;
  onEditUser: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, groups, sectors, onUpdateUser, onAddUser, onEditUser }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Pessoas</h2>
          <p className="text-slate-500">Controle de acesso e alocação setorial TecnoPerfil</p>
        </div>
        <button 
          onClick={onAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-blue-100"
        >
          <UserPlus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <th className="px-8 py-5">Identidade</th>
              <th className="px-8 py-5">Alocação / Setor</th>
              <th className="px-8 py-5">Perfis de Acesso</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => {
              const sector = sectors.find(s => s.id === user.sectorId);
              return (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform" alt="" />
                        {user.active && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl w-fit border border-slate-200">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">{sector?.name || 'Não alocado'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {user.groupIds.map(gid => {
                        const group = groups.find(g => g.id === gid);
                        return (
                          <span key={gid} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-blue-100 flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5" /> {group?.name}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {user.active ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onEditUser(user)}
                        className="p-2.5 hover:bg-blue-50 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm bg-white border border-slate-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onUpdateUser({...user, active: !user.active})}
                        className="p-2.5 hover:bg-rose-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-all shadow-sm bg-white border border-slate-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
