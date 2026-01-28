
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, UserPlus, Mail, Shield, Briefcase, Info, Camera, Image as ImageIcon } from 'lucide-react';
import { User, GroupPermissions, Sector } from '../types';

interface UserModalProps {
  user?: Partial<User>;
  groups: GroupPermissions[];
  sectors: Sector[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, groups, sectors, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    sectorId: sectors[0]?.id || '',
    groupIds: [],
    active: true,
    avatar: 'https://i.pravatar.cc/150?u=new'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        name: '',
        email: '',
        sectorId: sectors[0]?.id || '',
        groupIds: [],
        active: true,
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
      });
    }
  }, [user, isOpen, sectors]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as User);
  };

  const handleGroupToggle = (groupId: string) => {
    const currentGroups = formData.groupIds || [];
    if (currentGroups.includes(groupId)) {
      setFormData({ ...formData, groupIds: currentGroups.filter(id => id !== groupId) });
    } else {
      setFormData({ ...formData, groupIds: [...currentGroups, groupId] });
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {user?.id ? 'Editar Usuário' : 'Novo Usuário Industrial'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 bg-slate-50/20">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={handleImageClick}>
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-xl group-hover:opacity-75 transition-all">
                <img src={formData.avatar} className="w-full h-full object-cover" alt="User" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clique para alterar imagem</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Completo *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all shadow-sm"
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail Corporativo *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-12 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all shadow-sm"
                  placeholder="joao@tecnoperfil.com.br"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Setor Industrial *</label>
                <select
                  required
                  value={formData.sectorId}
                  onChange={(e) => setFormData({ ...formData, sectorId: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none bg-white shadow-sm"
                >
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                <div className="flex items-center gap-3 h-[50px] bg-white px-4 rounded-2xl border border-slate-100 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={`w-11 h-6 rounded-full relative transition-all ${formData.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${formData.active ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-[10px] font-black text-slate-500 uppercase">{formData.active ? 'Ativo' : 'Inativo'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" /> Grupos de Acesso (Perfis)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {groups.map(group => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => handleGroupToggle(group.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                      formData.groupIds?.includes(group.id)
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      formData.groupIds?.includes(group.id) ? 'bg-white border-white' : 'border-slate-300'
                    }`}>
                      {formData.groupIds?.includes(group.id) && <div className="w-2 h-2 bg-blue-600 rounded-sm" />}
                    </div>
                    {group.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
              O usuário receberá os privilégios vinculados aos perfis selecionados. Perfis de "Administrador" ou "PCP" possuem visualização global de todas as OPs.
            </p>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold transition-all">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95">
            <Save className="w-4 h-4" />
            {user?.id ? 'Salvar Alterações' : 'Criar Usuário'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
