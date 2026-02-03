
import React, { useState } from 'react';
import { 
  Package, Plus, Search, ArrowUpCircle, ArrowDownCircle, 
  AlertTriangle, CheckCircle2, Trash2, Edit2, Save, X,
  Filter, TrendingUp, Info, AlertCircle
} from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryPageProps {
  inventory: InventoryItem[];
  onUpdateInventory: (items: InventoryItem[]) => void;
}

const InventoryPage: React.FC<InventoryPageProps> = ({ inventory, onUpdateInventory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '', unit: 'KG', currentStock: 0, minStock: 100, maxStock: 1000
  });

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    if (!newItem.name) return;
    const item: InventoryItem = {
      id: `i-${Date.now()}`,
      name: newItem.name,
      unit: newItem.unit || 'KG',
      currentStock: newItem.currentStock || 0,
      minStock: newItem.minStock || 0,
      maxStock: newItem.maxStock || (newItem.minStock ? newItem.minStock * 5 : 1000)
    };
    onUpdateInventory([...inventory, item]);
    setIsAddingNew(false);
    setNewItem({ name: '', unit: 'KG', currentStock: 0, minStock: 100, maxStock: 1000 });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const updated = inventory.map(i => i.id === editingItem.id ? editingItem : i);
    onUpdateInventory(updated);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este material do inventário?')) {
      onUpdateInventory(inventory.filter(i => i.id !== id));
    }
  };

  const handleUpdateStock = (id: string, delta: number) => {
    const updated = inventory.map(item => {
      if (item.id === id) {
        return { ...item, currentStock: Math.max(0, item.currentStock + delta) };
      }
      return item;
    });
    onUpdateInventory(updated);
  };

  const getStatusInfo = (item: InventoryItem) => {
    const min = item.minStock;
    const max = item.maxStock || min * 5;
    const safety = min * 1.3; // 30% acima do mínimo
    const current = item.currentStock;

    if (current < min) return { label: 'CRÍTICO', color: 'text-rose-500', bar: 'bg-rose-500', bg: 'bg-rose-50', icon: AlertTriangle };
    if (current < safety) return { label: 'ATENÇÃO', color: 'text-amber-500', bar: 'bg-amber-500', bg: 'bg-amber-50', icon: Info };
    if (current > max) return { label: 'EXCESSO', color: 'text-purple-500', bar: 'bg-purple-500', bg: 'bg-purple-50', icon: AlertCircle };
    return { label: 'SEGURO', color: 'text-emerald-500', bar: 'bg-blue-500', bg: 'bg-emerald-50', icon: CheckCircle2 };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Almoxarifado Industrial</h2>
          <p className="text-slate-500 font-medium mt-1">Gestão de Insumos, Matérias-primas e Parâmetros Técnicos</p>
        </div>
        <button 
          onClick={() => setIsAddingNew(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Novo Material
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Itens</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{inventory.length}</p>
        </div>
        <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100 shadow-sm">
          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Abaixo do Mínimo</p>
          <p className="text-3xl font-black text-rose-600 mt-1">
            {inventory.filter(i => i.currentStock < i.minStock).length}
          </p>
        </div>
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-[32px] text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Logístico</p>
            <p className="text-xl font-bold mt-1">Fluxo <span className="text-emerald-400">Otimizado</span></p>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-[24px] border border-slate-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="Buscar material por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
        <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-500 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isAddingNew && (
          <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-[32px] p-6 animate-in zoom-in-95">
            <h4 className="font-black text-[10px] text-blue-600 uppercase tracking-widest mb-6 text-center">Cadastro de Novo Insumo</h4>
            <div className="space-y-4">
              <input 
                autoFocus
                placeholder="Ex: Cantoneira 1/2" 
                className="w-full bg-white px-4 py-3 rounded-xl border border-blue-100 text-sm font-bold outline-none"
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="number" 
                  placeholder="Saldo" 
                  className="w-full bg-white px-4 py-3 rounded-xl border border-blue-100 text-sm font-bold outline-none"
                  value={newItem.currentStock || ''}
                  onChange={e => setNewItem({...newItem, currentStock: Number(e.target.value)})}
                />
                <select 
                  className="w-full bg-white px-4 py-3 rounded-xl border border-blue-100 text-sm font-bold outline-none"
                  value={newItem.unit}
                  onChange={e => setNewItem({...newItem, unit: e.target.value})}
                >
                  <option value="KG">KG</option>
                  <option value="UN">UN</option>
                  <option value="MT">MT</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsAddingNew(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-slate-400">Descartar</button>
                <button onClick={handleAddItem} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-100">Criar Material</button>
              </div>
            </div>
          </div>
        )}

        {filteredItems.map(item => {
          const status = getStatusInfo(item);
          const max = item.maxStock || item.minStock * 5;
          const progress = Math.min(100, (item.currentStock / max) * 100);
          const StatusIcon = status.icon;

          return (
            <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative flex flex-col justify-between h-full">
              {item.currentStock < item.minStock && <div className="absolute top-0 right-0 p-3 bg-rose-500 text-white rounded-bl-2xl animate-pulse"><AlertTriangle className="w-4 h-4" /></div>}
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight leading-tight">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Unidade: {item.unit}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingItem(item)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estoque Físico</p>
                  <p className={`text-4xl font-black ${status.color}`}>
                    {item.currentStock.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleUpdateStock(item.id, -10)}
                    className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                  >
                    <ArrowDownCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleUpdateStock(item.id, 10)}
                    className="p-3 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"
                  >
                    <ArrowUpCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nível Crítico: {item.minStock}</span>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${status.bg} ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div 
                    className={`h-full transition-all duration-1000 ${status.bar}`} 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase">
                  <span>Zero</span>
                  <span>Capacidade: {max} {item.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE EDIÇÃO DE PARÂMETROS */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Parâmetros Técnicos</h3>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição do Material</label>
                <input 
                  value={editingItem.name}
                  onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saldo Atual</label>
                  <input 
                    type="number"
                    value={editingItem.currentStock}
                    onChange={e => setEditingItem({...editingItem, currentStock: Number(e.target.value)})}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 font-black text-blue-600 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unidade</label>
                  <select 
                    value={editingItem.unit}
                    onChange={e => setEditingItem({...editingItem, unit: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 font-bold outline-none"
                  >
                    <option value="KG">KG</option>
                    <option value="UN">UN</option>
                    <option value="MT">MT</option>
                  </select>
                </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-[32px] space-y-6 shadow-xl">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível Crítico (Mínimo)</label>
                  <input 
                    type="number"
                    value={editingItem.minStock}
                    onChange={e => setEditingItem({...editingItem, minStock: Number(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3.5 font-black text-rose-400 outline-none focus:border-rose-500"
                  />
                  <p className="text-[9px] text-slate-500 italic">Gera alerta vermelho no dashboard.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacidade Máxima</label>
                  <input 
                    type="number"
                    value={editingItem.maxStock || ''}
                    placeholder="Ex: 5000"
                    onChange={e => setEditingItem({...editingItem, maxStock: Number(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3.5 font-black text-blue-400 outline-none focus:border-blue-500"
                  />
                  <p className="text-[9px] text-slate-500 italic">Define o limite físico do almoxarifado.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Aplicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente simples para ícone Settings não importado
const Settings = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2 2 2 0 0 1-2 2 2 2 0 0 0-2 2 2 2 0 0 1-2 2 2 2 0 0 0-2 2v.44a2 2 0 0 0 2 2 2 2 0 0 1 2 2 2 2 0 0 0 2 2 2 2 0 0 1 2 2 2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 0 2-2v-.44a2 2 0 0 0-2-2 2 2 0 0 1-2-2 2 2 0 0 0-2-2 2 2 0 0 1-2-2 2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default InventoryPage;
