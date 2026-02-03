
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  AlertTriangle, Zap, Sparkles, History,
  Activity, Layers, BarChart3, PlayCircle, StopCircle, 
  Hammer, Package, Box, Loader2, X, Edit3, Save, Plus, Trash2, ArrowRight
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Machine, InventoryItem } from '../types';
import { getBottleneckAnalysis } from '../services/geminiService';

interface DashboardProps {
  tasks: Task[];
  inventoryProp: InventoryItem[];
  machinesProp: Machine[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, inventoryProp, machinesProp }) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const kpis = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      urgent: tasks.filter(t => t.priority === TaskPriority.CRITICAL || t.priority === TaskPriority.HIGH).length,
      delayed: tasks.filter(t => new Date(t.deadline) < new Date() && t.status !== TaskStatus.COMPLETED).length,
    };
  }, [tasks]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(TaskStatus).forEach(s => counts[s] = 0);
    tasks.forEach(t => counts[t.status]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const COLORS = ['#3b82f6', '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#a855f7'];

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const result = await getBottleneckAnalysis(tasks);
      setAiAnalysis(result);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAiAnalysis("Falha ao gerar análise preditiva de produção.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Painel Industrial 4.0</h2>
          <p className="text-slate-500 font-medium mt-1">Sincronização em tempo real Chão de Fábrica & PCP</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAiAnalysis}
            disabled={loadingAi}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl transition-all shadow-xl shadow-slate-200 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 group overflow-hidden relative disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loadingAi ? 'Analisando Produção...' : 'Prever Gargalos (IA)'}
            </span>
          </button>
        </div>
      </div>

      {aiAnalysis && (
        <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-2xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <Sparkles className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <Activity className="w-5 h-5 text-white" />
             </div>
             <h3 className="text-xl font-black tracking-tight">Análise Preditiva de Gargalos</h3>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-blue-50 font-medium leading-relaxed whitespace-pre-line">
              {aiAnalysis}
            </p>
          </div>
          <button onClick={() => setAiAnalysis(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Seção de Máquinas - Agora Flexível para ocupar todo o espaço */}
        <div className="lg:col-span-3 flex flex-wrap gap-6">
          {machinesProp.map(machine => (
            <div key={machine.id} className="flex-1 min-w-[280px] bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${
                  machine.status === 'running' ? 'bg-emerald-50 text-emerald-500' :
                  machine.status === 'idle' ? 'bg-amber-50 text-amber-500' :
                  machine.status === 'maintenance' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'
                }`}>
                  {machine.status === 'running' ? <PlayCircle className="w-6 h-6" /> :
                   machine.status === 'maintenance' ? <Hammer className="w-6 h-6" /> : <StopCircle className="w-6 h-6" />}
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">OEE ATUAL</p>
                  <p className="text-2xl font-black text-slate-900">{machine.lastOEE}%</p>
                </div>
              </div>
              <h4 className="font-bold text-slate-800 text-base mb-1 truncate">{machine.name}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">
                {machine.currentOP ? `OP ATIVA: ${machine.currentOP}` : 'SEM CARGA ATIVA'}
              </p>
              <div className="mt-5 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${
                  machine.lastOEE > 80 ? 'bg-emerald-500' : machine.lastOEE > 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`} style={{ width: `${machine.lastOEE}%` }} />
              </div>
            </div>
          ))}
          {machinesProp.length === 0 && (
            <div className="w-full py-16 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
               <Layers className="w-10 h-10 text-slate-200 mb-4" />
               <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">Aguardando Cadastro de Equipamentos</p>
            </div>
          )}
        </div>
        
        {/* Insumos Críticos Card - Mantém sua posição lateral em telas grandes */}
        <div className="lg:col-span-1 bg-slate-900 rounded-[32px] p-6 text-white shadow-2xl flex flex-col group relative overflow-hidden min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              <h3 className="text-xs font-black uppercase tracking-widest">Insumos Críticos</h3>
            </div>
          </div>
          <div className="space-y-6 flex-1">
            {inventoryProp.map(item => (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400 max-w-[140px] truncate">{item.name}</span>
                  <span className={item.currentStock < item.minStock ? 'text-rose-400 animate-pulse' : 'text-blue-400'}>
                    {item.currentStock} {item.unit}
                  </span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${item.currentStock < item.minStock ? 'bg-rose-500' : 'bg-blue-500'}`} 
                       style={{ width: `${Math.min(100, (item.currentStock / (item.minStock > 0 ? item.minStock * 2 : 10000)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
             <p className="text-[9px] text-slate-500 italic">Atualizado em tempo real pelo Almoxarifado.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Atividades Globais" value={kpis.total} icon={Layers} color="blue" />
        <KpiCard title="Eficiência Setorial" value={kpis.inProgress} icon={Activity} color="indigo" />
        <KpiCard title="Gargalos Identificados" value={kpis.urgent} icon={AlertTriangle} color="rose" />
        <KpiCard title="SLA de Entrega" value={kpis.delayed} icon={History} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl group">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                 <BarChart3 className="w-6 h-6 text-blue-600" /> Balanço de Status
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Carga Industrial x Capacidade</p>
            </div>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <Tooltip cursor={{fill: '#f8fafc', radius: 12}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px' }} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={45}>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Box className="w-6 h-6 text-emerald-600" /> Volume por Setor
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ocupação Logística e Produtiva</p>
            </div>
          </div>
          <div className="h-[340px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={80} outerRadius={120} paddingAngle={10} dataKey="value" stroke="none">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px' }} />
                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" formatter={(value) => <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard: React.FC<{ title: string; value: number; icon: any; color: string }> = ({ title, value, icon: Icon, color }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600 shadow-blue-200 text-white',
    rose: 'bg-rose-600 shadow-rose-100 text-white',
    amber: 'bg-amber-500 shadow-amber-100 text-white',
    indigo: 'bg-indigo-600 shadow-indigo-200 text-white',
  };

  return (
    <div className="p-8 rounded-[40px] border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group bg-white">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl relative z-10 transition-transform group-hover:scale-110">
        <div className={`absolute inset-0 rounded-2xl ${colorMap[color]}`} />
        <Icon className="w-7 h-7 relative z-10" />
      </div>
      <div className="relative z-10">
        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
        <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
