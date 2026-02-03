
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Save, FileText, Info, History, Paperclip, 
  Plus, ChevronRight, Play, Check, RotateCcw, Trash2, 
  Upload, File, Image as ImageIcon,
  FileSpreadsheet, Download, Eye, Factory, Beaker,
  Printer, Shield, Users, Lock, CheckCircle2,
  GripVertical, Clock, CheckCircle, Timer, Calendar,
  RotateCw, AlertTriangle, FileUp, Send, Briefcase
} from 'lucide-react';
import { 
  Task, TaskType, TaskPriority, TaskStatus, User, GroupPermissions, TaskStep, 
  StepStatus, TaskHistory, Attachment, Sector, TaskVisibility
} from '../types';
import ConfirmationModal from './ConfirmationModal';

interface TaskModalProps {
  task?: Partial<Task>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  availableUsers: User[];
  availableGroups: GroupPermissions[];
  sectors: Sector[];
  currentUser?: User;
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onSave, 
  availableUsers, 
  availableGroups,
  sectors,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'workflow' | 'quality' | 'access' | 'history' | 'attachments'>('info');
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [isAddingStep, setIsAddingStep] = useState(false);
  
  // Estados para o novo formulário de etapa
  const [newStepData, setNewStepData] = useState<Partial<TaskStep>>({
    title: '',
    responsibleGroupId: '',
    deadline: '',
    description: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = currentUser?.groupIds.includes('g-admin');

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'info' | 'success';
    confirmLabel: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info',
    confirmLabel: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (task?.id) {
        setFormData(task);
      } else {
        setFormData({
          id: `T-${Date.now().toString().slice(-4)}`,
          type: TaskType.ROUTINE,
          requestingSector: currentUser?.sectorId || 'PCP',
          responsibleSector: sectors[0]?.name || 'Produção',
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.OPEN,
          visibility: TaskVisibility.GLOBAL,
          openDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: currentUser?.name || 'Administrador',
          deadline: new Date().toISOString().split('T')[0],
          followerIds: [],
          history: [],
          attachments: [],
          steps: [],
          description: '',
          productProfile: '',
          opNumber: '',
          visibleGroupIds: [],
          visibleUserIds: [],
          visibleSectorIds: [],
          executorGroupId: availableGroups[0]?.id || '',
          qualityMetrics: { hardnessWebster: 0, layerThickness: 0, lengthTolerance: true, visualInspection: 'Aprovado' }
        });
      }
      setActiveTab('info');
      setIsAddingStep(false);
      setNewStepData({
        title: '',
        responsibleGroupId: availableGroups[0]?.id || '',
        deadline: new Date().toISOString().split('T')[0],
        description: ''
      });
    }
  }, [task, isOpen, sectors, availableGroups, currentUser]);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'info' | 'success', label: string) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      },
      type,
      confirmLabel: label
    });
  };

  const handleUpdateTaskStatus = (newStatus: TaskStatus) => {
    const updates: Partial<Task> = { status: newStatus };
    if (newStatus === TaskStatus.IN_PROGRESS && !formData.startedAt) updates.startedAt = new Date().toISOString();
    if (newStatus === TaskStatus.COMPLETED) updates.completedAt = new Date().toISOString();
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleReopenTask = () => {
    triggerConfirm(
      "Reabrir Atividade?",
      "Deseja realmente reabrir esta atividade? O status voltará para 'Em andamento' e o registro de conclusão será removido.",
      () => {
        setFormData(prev => ({
          ...prev,
          status: TaskStatus.IN_PROGRESS,
          completedAt: undefined,
          history: [{
            id: `h-${Date.now()}`,
            userId: currentUser?.id || 'admin',
            userName: currentUser?.name || 'Administrador',
            action: "Atividade REABERTA",
            timestamp: new Date().toISOString(),
            details: `A atividade foi reaberta pelo administrador ${currentUser?.name} para novas ações industriais.`,
            type: 'manual'
          } as TaskHistory, ...(prev.history || [])]
        }));
      },
      'danger',
      "Sim, Reabrir"
    );
  };

  const handleUpdateStepStatus = (stepId: string, newStatus: StepStatus) => {
    if (newStatus === StepStatus.COMPLETED) {
      triggerConfirm(
        "Concluir Etapa?",
        "Deseja registrar a conclusão desta fase? Seu nome será vinculado a este registro.",
        () => {
          const updatedSteps = formData.steps?.map(step => {
            if (step.id === stepId) {
              return { 
                ...step, 
                status: StepStatus.COMPLETED, 
                completedAt: new Date().toISOString(),
                completedBy: currentUser?.name 
              };
            }
            return step;
          });
          setFormData({ ...formData, steps: updatedSteps });
        },
        'success',
        "Concluir"
      );
    } else {
      const updatedSteps = formData.steps?.map(step => {
        if (step.id === stepId) return { ...step, status: newStatus, completedAt: undefined, completedBy: undefined };
        return step;
      });
      setFormData({ ...formData, steps: updatedSteps });
    }
  };

  const handleAddStep = () => {
    if (!newStepData.title?.trim()) return;
    
    const newStep: TaskStep = {
      id: `s-${Date.now()}`,
      title: newStepData.title,
      description: newStepData.description,
      responsibleGroupId: newStepData.responsibleGroupId || 'g-prod',
      deadline: newStepData.deadline,
      status: StepStatus.PENDING,
      order: (formData.steps?.length || 0) + 1,
    };

    setFormData(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }));

    setIsAddingStep(false);
    setNewStepData({
      title: '',
      responsibleGroupId: availableGroups[0]?.id || '',
      deadline: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map((file: any) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: file.name,
      type: file.type,
      url: '#',
      uploadedBy: currentUser?.name || 'Usuário',
      date: new Date().toISOString()
    }));
    setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), ...newAttachments] }));
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="w-6 h-6 text-indigo-500" />;
    if (type.includes('pdf')) return <FileText className="w-6 h-6 text-rose-500" />;
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
    return <File className="w-6 h-6 text-slate-400" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Task);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
          
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex items-center gap-5">
              <div className="bg-blue-600 p-3.5 rounded-2xl shadow-xl shadow-blue-100">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">Atividade {formData.id}</h2>
                <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">GESTÃO INDUSTRIAL 4.0</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <span className="text-blue-600">{formData.type}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3 h-3" /> CRIADO POR <span className="text-slate-900">{formData.createdBy}</span> EM {new Date(formData.createdAt || '').toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-3 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">
              <X className="w-7 h-7" />
            </button>
          </div>

          <div className="px-8 flex gap-2 border-b border-slate-100 bg-white overflow-x-auto no-scrollbar relative z-10">
            <ModalTab active={activeTab === 'info'} onClick={() => setActiveTab('info')} icon={Info} label="INFORMAÇÕES" />
            <ModalTab active={activeTab === 'access'} onClick={() => setActiveTab('access')} icon={Lock} label="ACESSOS" />
            <ModalTab active={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')} icon={ChevronRight} label="WORKFLOW" count={formData.steps?.length} />
            <ModalTab active={activeTab === 'attachments'} onClick={() => setActiveTab('attachments')} icon={Paperclip} label="ANEXOS" count={formData.attachments?.length} />
            <ModalTab active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="HISTÓRICO" />
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-slate-50/20">
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-in fade-in duration-300">
                <div className="md:col-span-2 space-y-8">
                  <div className="grid grid-cols-2 gap-6 p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status da Atividade</label>
                      <select disabled={formData.status === TaskStatus.COMPLETED && !isAdmin} value={formData.status} onChange={(e) => handleUpdateTaskStatus(e.target.value as TaskStatus)} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 outline-none focus:border-blue-500 font-black text-sm transition-all">
                        {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempo de Execução</label>
                       <div className="flex items-center gap-3 h-[58px] px-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                          <Timer className="w-5 h-5 text-blue-500" />
                          <span className="text-sm font-black text-blue-700 uppercase tracking-widest">{formData.status === TaskStatus.COMPLETED ? 'CONCLUÍDO' : formData.startedAt ? 'EM CURSO' : 'PENDENTE'}</span>
                       </div>
                    </div>
                  </div>
                  
                  {isAdmin && (formData.status === TaskStatus.COMPLETED || formData.status === TaskStatus.CANCELED) && (
                    <div className="p-6 bg-rose-50 border border-rose-100 rounded-[32px] flex items-center justify-between">
                      <div className="flex items-center gap-3 text-rose-600">
                        <AlertTriangle className="w-6 h-6" />
                        <div>
                          <p className="font-black text-[10px] uppercase tracking-widest">Painel de Supervisor</p>
                          <p className="text-xs font-bold">A atividade está encerrada. Deseja reabri-la?</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleReopenTask}
                        className="bg-rose-600 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                      >
                        Reabrir Atividade
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Setor Executor</label>
                      <select value={formData.executorGroupId} onChange={(e) => setFormData({...formData, executorGroupId: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white outline-none focus:border-blue-500 font-bold text-sm shadow-sm">
                        {availableGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prazo Final</label>
                      <input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white outline-none font-bold text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número da OP</label>
                      <input value={formData.opNumber} onChange={(e: any) => setFormData({...formData, opNumber: e.target.value})} placeholder="OP-0000" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white shadow-sm outline-none font-black text-sm uppercase tracking-widest" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Perfil do Produto</label>
                      <input value={formData.productProfile} onChange={(e: any) => setFormData({...formData, productProfile: e.target.value})} placeholder="Ex: Perfil L - 20x20" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white shadow-sm outline-none font-bold text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição e Instruções de Fábrica</label>
                    <textarea rows={5} value={formData.description} onChange={(e: any) => setFormData({...formData, description: e.target.value})} className="w-full px-6 py-5 rounded-[32px] border border-slate-200 focus:border-blue-500 bg-white shadow-sm outline-none resize-none font-medium text-sm leading-relaxed" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl flex flex-col items-center text-center space-y-6">
                    <div className="p-5 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 relative group">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${formData.opNumber || formData.id}`} className="w-32 h-32 mix-blend-multiply group-hover:scale-105 transition-transform" alt="QR Code" />
                    </div>
                    <div className="w-full space-y-3">
                      <button onClick={() => window.print()} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                         <Printer className="w-5 h-5" /> Imprimir Etiqueta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workflow' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-400">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Etapas de Produção</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Planejamento e Execução Normativa</p>
                  </div>
                  {!isAddingStep && (
                    <button 
                      onClick={() => setIsAddingStep(true)} 
                      className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                    >
                      <Plus className="w-5 h-5" /> Inserir Fase
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Formulário Expandido para Adicionar Nova Etapa */}
                  {isAddingStep && (
                    <div className="p-8 rounded-[40px] border-2 border-dashed border-blue-200 bg-blue-50/30 animate-in zoom-in-95 space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                          <Plus className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-blue-900 uppercase tracking-tight">Nova Fase Industrial</h4>
                          <p className="text-[10px] text-blue-600/70 font-bold uppercase tracking-widest">Defina as especificações da etapa</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome da Etapa *</label>
                          <input 
                            autoFocus
                            value={newStepData.title}
                            onChange={(e) => setNewStepData({...newStepData, title: e.target.value})}
                            placeholder="Ex: Extrusão de Perfil"
                            className="w-full bg-white border border-blue-100 rounded-2xl px-5 py-4 font-bold outline-none shadow-sm focus:ring-4 focus:ring-blue-100 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Setor Responsável *</label>
                          <select 
                            value={newStepData.responsibleGroupId}
                            onChange={(e) => setNewStepData({...newStepData, responsibleGroupId: e.target.value})}
                            className="w-full bg-white border border-blue-100 rounded-2xl px-5 py-4 font-bold outline-none shadow-sm focus:ring-4 focus:ring-blue-100 transition-all"
                          >
                            {availableGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prazo (Deadline)</label>
                          <input 
                            type="date"
                            value={newStepData.deadline}
                            onChange={(e) => setNewStepData({...newStepData, deadline: e.target.value})}
                            className="w-full bg-white border border-blue-100 rounded-2xl px-5 py-4 font-bold outline-none shadow-sm focus:ring-4 focus:ring-blue-100 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instruções Técnicas</label>
                          <input 
                            value={newStepData.description}
                            onChange={(e) => setNewStepData({...newStepData, description: e.target.value})}
                            placeholder="Instruções adicionais..."
                            className="w-full bg-white border border-blue-100 rounded-2xl px-5 py-4 font-bold outline-none shadow-sm focus:ring-4 focus:ring-blue-100 transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={() => setIsAddingStep(false)}
                          className="flex-1 py-4 bg-white text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-rose-500 transition-all border border-slate-100 shadow-sm"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleAddStep}
                          className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                        >
                          <CheckCircle2 className="w-5 h-5" /> Confirmar Planejamento
                        </button>
                      </div>
                    </div>
                  )}

                  {formData.steps?.map((step, idx) => {
                    const group = availableGroups.find(g => g.id === step.responsibleGroupId);
                    const isLate = step.deadline && new Date(step.deadline) < new Date() && step.status !== StepStatus.COMPLETED;
                    
                    return (
                      <div key={step.id} className={`p-6 rounded-[32px] border transition-all flex items-center gap-6 group bg-white shadow-sm hover:border-blue-100 ${step.status === StepStatus.COMPLETED ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 border transition-colors ${
                          step.status === StepStatus.COMPLETED ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {idx + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h4 className={`text-base font-black uppercase tracking-tight truncate ${step.status === StepStatus.COMPLETED ? 'text-emerald-700' : 'text-slate-800'}`}>
                              {step.title}
                            </h4>
                            {isLate && (
                              <span className="bg-rose-100 text-rose-600 text-[8px] font-black px-2 py-0.5 rounded-md uppercase animate-pulse">ATRASADO</span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{group?.name || 'Setor N/A'}</span>
                            </div>
                            
                            {step.deadline && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                  Prazo: {new Date(step.deadline).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            )}

                            {step.completedBy && (
                              <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                  Por <span className="text-slate-900">{step.completedBy}</span> em {new Date(step.completedAt!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {step.description && (
                            <p className="text-[10px] text-slate-400 font-medium italic mt-2 line-clamp-1">{step.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {step.status === StepStatus.COMPLETED ? (
                            <div className="flex items-center gap-2">
                               <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                                  <Check className="w-6 h-6" />
                               </div>
                               <button 
                                  onClick={() => handleUpdateStepStatus(step.id, StepStatus.PENDING)}
                                  className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                                  title="Desfazer conclusão"
                               >
                                  <RotateCcw className="w-4 h-4" />
                               </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleUpdateStepStatus(step.id, StepStatus.COMPLETED)} 
                              className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-100"
                            >
                              <Play className="w-5 h-5 ml-1" />
                            </button>
                          )}
                          
                          {!step.completedBy && (
                             <button 
                                onClick={() => setFormData(prev => ({...prev, steps: prev.steps?.filter(s => s.id !== step.id)}))}
                                className="p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {(!formData.steps || formData.steps.length === 0) && !isAddingStep && (
                    <div className="py-24 text-center flex flex-col items-center gap-5 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                        <GripVertical className="w-10 h-10 text-slate-200" />
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-300 uppercase tracking-widest">Workflow não definido</p>
                        <p className="text-[10px] text-slate-200 font-bold uppercase mt-1">Crie as etapas do fluxo de trabalho industrial</p>
                      </div>
                      <button 
                        onClick={() => setIsAddingStep(true)}
                        className="mt-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                      >
                        Começar Planejamento
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'attachments' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Documentação Técnica</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Anexe desenhos, PDFs de OP ou fotos do perfil</p>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
                  >
                    <FileUp className="w-4 h-4" /> Adicionar Arquivo
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.attachments?.map((file) => (
                    <div key={file.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-all">
                      <div className="w-14 h-14 rounded-[22px] bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-800 truncate uppercase tracking-tight">{file.name}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                          {file.uploadedBy} • {new Date(file.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <a href={file.url} download className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Download className="w-4 h-4" /></a>
                        <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {(!formData.attachments || formData.attachments.length === 0) && (
                    <div className="md:col-span-2 py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-center">
                       <Upload className="w-12 h-12 text-slate-200 mb-4" />
                       <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Nenhum anexo encontrado</h4>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                 {formData.history?.map((entry) => (
                   <div key={entry.id} className="flex gap-4 group">
                      <div className="flex flex-col items-center shrink-0">
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${entry.type === 'system' ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-600'}`}>
                           {entry.type === 'system' ? <SettingsIcon className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                         </div>
                         <div className="w-0.5 flex-1 bg-slate-100 my-2" />
                      </div>
                      <div className="flex-1 pb-8">
                         <div className="flex justify-between items-start mb-1">
                            <h4 className="font-black text-slate-800 text-xs uppercase tracking-tight">{entry.action}</h4>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                         <p className="text-xs text-slate-500 leading-relaxed font-medium">{entry.details}</p>
                         <div className="mt-2 text-[9px] font-black text-blue-500 uppercase tracking-widest">{entry.userName}</div>
                      </div>
                   </div>
                 ))}
              </div>
            )}
            
            {activeTab === 'access' && (
              <div className="space-y-10 animate-in slide-in-from-right-6 duration-300">
                 <div className="bg-slate-950 p-10 rounded-[40px] text-white flex items-center gap-8 shadow-2xl relative overflow-hidden group">
                    <div className="bg-blue-600/20 p-6 rounded-3xl relative z-10 transition-transform group-hover:rotate-6">
                      <Shield className="w-12 h-12 text-blue-400" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-black text-2xl uppercase tracking-tighter">Nível de Privacidade</h3>
                      <p className="text-xs text-slate-400 uppercase tracking-[0.2em] font-bold mt-2 opacity-70">Controle a visibilidade industrial desta atividade</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    {Object.values(TaskVisibility).map(v => (
                      <button key={v} type="button" onClick={() => setFormData({...formData, visibility: v})} className={`h-28 px-10 rounded-[32px] border-2 text-left transition-all flex items-center justify-between group shadow-sm ${formData.visibility === v ? 'border-blue-600 bg-blue-50/30 shadow-blue-50' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}`}>
                         <div>
                           <h4 className={`text-base font-black uppercase tracking-widest ${formData.visibility === v ? 'text-blue-600' : 'text-slate-900'}`}>{v}</h4>
                         </div>
                         <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${formData.visibility === v ? 'bg-blue-600 border-blue-600' : 'border-slate-200'}`}>
                           {formData.visibility === v && <Check className="w-4 h-4 text-white" />}
                         </div>
                      </button>
                    ))}
                 </div>
              </div>
            )}
          </div>

          <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-white px-10">
            <button onClick={onClose} className="px-10 py-4 rounded-2xl border border-slate-200 text-slate-400 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest transition-all">DESCARTAR</button>
            <button onClick={handleSubmit} className="px-12 py-4 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3">
              <Save className="w-5 h-5" /> SALVAR ATIVIDADE
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal isOpen={confirmState.isOpen} title={confirmState.title} message={confirmState.message} onConfirm={confirmState.onConfirm} onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))} type={confirmState.type} confirmLabel={confirmState.confirmLabel} />
    </>
  );
};

const UserIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const SettingsIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2 2 2 0 0 1-2 2 2 2 0 0 0-2 2 2 2 0 0 1-2 2 2 2 0 0 0-2 2v.44a2 2 0 0 0 2 2 2 2 0 0 1 2 2 2 2 0 0 0 2 2 2 2 0 0 1 2 2 2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 0 2-2v-.44a2 2 0 0 0-2-2 2 2 0 0 1-2-2 2 2 0 0 0-2-2 2 2 0 0 1-2-2 2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

const ModalTab: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string; count?: number }> = ({ active, onClick, icon: Icon, label, count }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-8 py-6 border-b-4 transition-all font-black text-[10px] uppercase tracking-widest whitespace-nowrap relative ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-300 hover:text-slate-500'}`}>
    <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-300'}`} />
    {label}
    {count !== undefined && count > 0 && (
      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black ml-2 ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
        {count}
      </span>
    )}
  </button>
);

export default TaskModal;
