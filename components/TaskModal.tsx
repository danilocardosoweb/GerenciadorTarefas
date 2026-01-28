
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Save, AlertTriangle, FileText, Info, Eye, Users, Lock, 
  UserCircle, History, MessageSquare, Paperclip, CheckCircle2,
  Globe, Shield, User as UserIcon, Plus, ChevronRight, Play, Check, 
  Clock, Trash2, ArrowUpCircle, AlertCircle, RotateCcw, AlertOctagon
} from 'lucide-react';
import { 
  Task, TaskType, TaskPriority, TaskStatus, UserRole, TaskVisibility, User, GroupPermissions, TaskStep, StepStatus, TaskHistory 
} from '../types';

interface TaskModalProps {
  task?: Partial<Task>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  availableUsers: User[];
  availableGroups: GroupPermissions[];
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onSave, 
  availableUsers, 
  availableGroups 
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'workflow' | 'history' | 'attachments'>('info');
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [stepToConfirm, setStepToConfirm] = useState<string | null>(null);
  const [isConfirmingFinalSave, setIsConfirmingFinalSave] = useState(false);
  const [stepToUndo, setStepToUndo] = useState<string | null>(null);
  
  const [newStep, setNewStep] = useState<Partial<TaskStep>>({
    title: '',
    responsibleGroupId: availableGroups[0]?.id || '',
    status: StepStatus.PENDING
  });
  const [newComment, setNewComment] = useState('');

  // Simulando usuário logado
  const currentUser: User = availableUsers[0];

  useEffect(() => {
    if (isOpen) {
      setFormData(task || {
        type: TaskType.ROUTINE,
        requestingSector: 'PCP',
        responsibleSector: 'Produção',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.OPEN,
        visibility: TaskVisibility.GLOBAL,
        visibleGroupIds: [],
        visibleUserIds: [],
        openDate: new Date().toISOString(),
        deadline: new Date().toISOString().split('T')[0],
        followerIds: [],
        history: [],
        attachments: [],
        steps: [],
        description: '',
        productProfile: '',
        opNumber: ''
      });
      setActiveTab('info');
      setStepToConfirm(null);
      setStepToUndo(null);
      setIsConfirmingFinalSave(false);
    }
  }, [task, isOpen, availableGroups]);

  const updateTaskStatusFromSteps = (steps: TaskStep[]): TaskStatus => {
    if (steps.length === 0) return formData.status || TaskStatus.OPEN;
    
    const allCompleted = steps.every(s => s.status === StepStatus.COMPLETED);
    if (allCompleted) return TaskStatus.COMPLETED;
    
    const anyInProgress = steps.some(s => s.status === StepStatus.IN_PROGRESS || s.status === StepStatus.COMPLETED);
    if (anyInProgress) return TaskStatus.IN_PROGRESS;
    
    return TaskStatus.OPEN;
  };

  const addHistoryEntry = (action: string, details: string, type: 'system' | 'manual' | 'step', comment?: string) => {
    const entry: TaskHistory = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      timestamp: new Date().toISOString(),
      type,
      comment
    };
    setFormData(prev => ({
      ...prev,
      history: [entry, ...(prev.history || [])]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmingFinalSave) {
      setIsConfirmingFinalSave(true);
      return;
    }
    onSave(formData as Task);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStep = () => {
    if (!newStep.title) return;
    const steps = [...(formData.steps || [])];
    const step: TaskStep = {
      id: Math.random().toString(36).substr(2, 9),
      title: newStep.title!,
      description: newStep.description,
      responsibleGroupId: newStep.responsibleGroupId!,
      status: StepStatus.PENDING,
      order: steps.length + 1
    };
    const updatedSteps = [...steps, step];
    setFormData({ 
      ...formData, 
      steps: updatedSteps,
      status: updateTaskStatusFromSteps(updatedSteps)
    });
    addHistoryEntry('Nova Etapa Criada', `Etapa "${step.title}" adicionada ao fluxo.`, 'step');
    setNewStep({ title: '', responsibleGroupId: availableGroups[0]?.id || '', status: StepStatus.PENDING });
    setIsAddingStep(false);
  };

  const updateStepStatus = (stepId: string, newStatus: StepStatus) => {
    const steps = (formData.steps || []).map(s => {
      if (s.id === stepId) {
        const updated = { ...s, status: newStatus };
        if (newStatus === StepStatus.COMPLETED) {
          updated.completedAt = new Date().toISOString();
          updated.completedBy = currentUser.name;
        } else {
          updated.completedAt = undefined;
          updated.completedBy = undefined;
        }
        return updated;
      }
      return s;
    });

    const taskStatus = updateTaskStatusFromSteps(steps);
    setFormData({ ...formData, steps, status: taskStatus });
    
    const step = steps.find(s => s.id === stepId);
    const actionName = newStatus === StepStatus.COMPLETED ? 'Etapa Concluída' : 'Status da Etapa Alterado';
    addHistoryEntry(actionName, `Etapa "${step?.title}" movida para ${newStatus}.`, 'step');
    setStepToConfirm(null);
  };

  const handleRevertStep = (stepId: string) => {
    const steps = (formData.steps || []).map(s => {
      if (s.id === stepId) {
        return { 
          ...s, 
          status: StepStatus.IN_PROGRESS, 
          completedAt: undefined, 
          completedBy: undefined 
        };
      }
      return s;
    });

    const taskStatus = updateTaskStatusFromSteps(steps);
    setFormData({ ...formData, steps, status: taskStatus });
    
    const step = steps.find(s => s.id === stepId);
    addHistoryEntry('Etapa Revertida', `A conclusão da etapa "${step?.title}" foi desfeita para correção.`, 'step');
    setStepToUndo(null);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addHistoryEntry('Comentário Técnico', 'Novo apontamento registrado pelo usuário.', 'manual', newComment);
    setNewComment('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">
                {task?.id ? `Atividade ${task.id}` : 'Nova Atividade Tecnoperfil'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                  formData.status === TaskStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 
                  formData.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {formData.status}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">• TECNOPERFIL ALUMÍNIO</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-2 flex gap-4 border-b border-slate-100 bg-white overflow-x-auto no-scrollbar">
          <ModalTab active={activeTab === 'info'} onClick={() => setActiveTab('info')} icon={Info} label="Informações" />
          <ModalTab active={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')} icon={ChevronRight} label="Fluxo de Trabalho" count={formData.steps?.length} />
          <ModalTab active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Eventos & Timeline" />
          <ModalTab active={activeTab === 'attachments'} onClick={() => setActiveTab('attachments')} icon={Paperclip} label="Anexos" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
          {activeTab === 'info' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Atividade</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white shadow-sm outline-none">
                    {Object.values(TaskType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prioridade</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white shadow-sm outline-none">
                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Perfil Tecnoperfil</label>
                  <input name="productProfile" value={formData.productProfile} onChange={handleChange} placeholder="Ex: Perfil Estrutural 20x20" className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white shadow-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número da OP</label>
                  <input name="opNumber" value={formData.opNumber} onChange={handleChange} placeholder="Ex: OP-2024-550" className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white shadow-sm outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instruções de Produção</label>
                <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white shadow-sm outline-none resize-none" />
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-800">Fluxo Operacional Tecnoperfil</h3>
                  <p className="text-xs text-slate-500">Defina as etapas para conclusão da atividade</p>
                </div>
                <button 
                  onClick={() => setIsAddingStep(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-100 active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Adicionar Etapa
                </button>
              </div>

              {isAddingStep && (
                <div className="bg-white p-6 rounded-3xl border-2 border-blue-100 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome da Etapa</label>
                      <input 
                        value={newStep.title} 
                        onChange={e => setNewStep({...newStep, title: e.target.value})}
                        placeholder="Ex: Liberar Prensa" 
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Setor Responsável</label>
                      <select 
                        value={newStep.responsibleGroupId}
                        onChange={e => setNewStep({...newStep, responsibleGroupId: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                      >
                        {availableGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsAddingStep(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                    <button onClick={handleAddStep} className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg shadow-md shadow-blue-100">Criar Etapa</button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {(formData.steps || []).length > 0 ? (
                  formData.steps?.sort((a, b) => a.order - b.order).map((step, idx) => {
                    const isPrevCompleted = idx === 0 || formData.steps![idx-1].status === StepStatus.COMPLETED;
                    const group = availableGroups.find(g => g.id === step.responsibleGroupId);
                    const isConfirmingThis = stepToConfirm === step.id;
                    const isUndoingThis = stepToUndo === step.id;
                    
                    return (
                      <div key={step.id} className={`bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 group transition-all ${step.status === StepStatus.COMPLETED ? 'bg-slate-50/80 border-slate-200' : 'hover:border-blue-200'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black shadow-inner transition-colors ${
                          step.status === StepStatus.COMPLETED ? 'bg-emerald-100 text-emerald-600' : 
                          step.status === StepStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {step.status === StepStatus.COMPLETED ? <Check className="w-6 h-6" /> : step.order}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold text-sm ${step.status === StepStatus.COMPLETED ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                              {step.title}
                            </h4>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">{group?.name}</span>
                          </div>
                          {step.completedAt && (
                            <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Finalizado por {step.completedBy} em {new Date(step.completedAt).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isConfirmingThis ? (
                            <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-2xl border border-amber-100 animate-in slide-in-from-right-2">
                               <p className="text-[10px] font-black text-amber-600 uppercase">Confirmar conclusão?</p>
                               <button 
                                 onClick={() => updateStepStatus(step.id, StepStatus.COMPLETED)}
                                 className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-sm"
                               >
                                 <Check className="w-3 h-3" />
                               </button>
                               <button 
                                 onClick={() => setStepToConfirm(null)}
                                 className="p-1.5 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-all shadow-sm"
                               >
                                 <X className="w-3 h-3" />
                               </button>
                            </div>
                          ) : isUndoingThis ? (
                            <div className="flex items-center gap-2 bg-rose-50 px-3 py-2 rounded-2xl border border-rose-100 animate-in slide-in-from-right-2">
                               <p className="text-[10px] font-black text-rose-600 uppercase">Voltar ao anterior?</p>
                               <button 
                                 onClick={() => handleRevertStep(step.id)}
                                 className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all shadow-sm"
                               >
                                 <Check className="w-3 h-3" />
                               </button>
                               <button 
                                 onClick={() => setStepToUndo(null)}
                                 className="p-1.5 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-all shadow-sm"
                               >
                                 <X className="w-3 h-3" />
                               </button>
                            </div>
                          ) : (
                            <>
                              {step.status === StepStatus.PENDING && (
                                <button 
                                  disabled={!isPrevCompleted}
                                  onClick={() => updateStepStatus(step.id, StepStatus.IN_PROGRESS)}
                                  className={`p-2.5 rounded-xl transition-all ${isPrevCompleted ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300 cursor-not-allowed'}`}
                                  title={isPrevCompleted ? "Iniciar Etapa" : "Etapa anterior pendente"}
                                >
                                  <Play className="w-5 h-5" />
                                </button>
                              )}
                              {step.status === StepStatus.IN_PROGRESS && (
                                <button 
                                  onClick={() => setStepToConfirm(step.id)}
                                  className="p-2.5 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
                                  title="Concluir Etapa"
                                >
                                  <CheckCircle2 className="w-5 h-5" />
                                </button>
                              )}
                              {step.status === StepStatus.COMPLETED && (
                                <button 
                                  onClick={() => setStepToUndo(step.id)}
                                  className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                  title="Reverter para Aberto (Voltar)"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}
                              <button className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <ArrowUpCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Nenhuma etapa operacional configurada</p>
                    <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-medium">Use o botão Adicionar para iniciar o workflow</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <MessageSquare className="w-4 h-4 text-blue-500" /> Registrar Apontamento Tecnoperfil
                </h3>
                <textarea 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Descreva observações técnicas relevantes para esta OP..."
                  className="w-full p-5 rounded-2xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-500 text-sm resize-none transition-all font-medium"
                  rows={2}
                />
                <div className="flex justify-end mt-3">
                  <button 
                    onClick={handleAddComment}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                  >
                    Registrar Evento
                  </button>
                </div>
              </div>

              <div className="relative space-y-8 pl-4 border-l-2 border-slate-100 ml-4">
                {(formData.history || []).length > 0 ? (
                  formData.history?.map((event) => (
                    <div key={event.id} className="relative pl-10 group">
                      <div className={`absolute -left-[31px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-md flex items-center justify-center ${
                        event.type === 'step' ? 'bg-blue-500' : event.type === 'manual' ? 'bg-amber-500' : 'bg-slate-400'
                      }`}>
                         {event.type === 'step' ? <ChevronRight className="w-2 h-2 text-white" /> : <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{event.userName}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(event.timestamp).toLocaleString('pt-BR')}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${
                           event.type === 'step' ? 'text-blue-600' : event.type === 'manual' ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {event.action}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed bg-white/50 p-2 rounded-lg border border-slate-50 font-medium">{event.details}</p>
                        {event.comment && (
                          <div className="mt-2 bg-slate-100 p-4 rounded-2xl border-l-4 border-blue-400 italic text-sm text-slate-700 shadow-sm">
                            "{event.comment}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm italic ml-4">Nenhum evento registrado ainda.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="bg-white border-2 border-dashed border-slate-200 p-16 rounded-[40px] flex flex-col items-center justify-center text-center gap-6 hover:border-blue-400 hover:bg-blue-50/10 transition-all group">
                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-[30px] flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all">
                  <Paperclip className="w-10 h-10" />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-xl uppercase tracking-tighter">Central de Documentação Tecnoperfil</p>
                  <p className="text-slate-400 text-sm font-medium">Anexe fotos da linha, laudos técnicos ou certificados de qualidade</p>
                </div>
                <label className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-black shadow-2xl shadow-slate-200 transition-all active:scale-95">
                  Fazer Upload
                  <input type="file" className="hidden" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button type="button" onClick={onClose} className="px-10 py-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold transition-all text-sm">Descartar</button>
          
          <div className="relative">
            {isConfirmingFinalSave && (
              <div className="absolute -top-16 right-0 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs font-bold whitespace-nowrap">Deseja salvar as alterações?</span>
                <button 
                  onClick={() => setIsConfirmingFinalSave(false)}
                  className="px-2 py-1 text-[10px] font-black uppercase hover:text-slate-300"
                >
                  Não
                </button>
              </div>
            )}
            <button 
              onClick={handleSubmit} 
              className={`px-10 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-xl transition-all active:scale-95 text-sm ${
                isConfirmingFinalSave 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              }`}
            >
              <Save className="w-4 h-4" />
              {isConfirmingFinalSave ? 'Sim, Confirmar' : 'Finalizar & Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModalTab: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string; count?: number }> = ({ active, onClick, icon: Icon, label, count }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-5 border-b-2 transition-all font-black text-[10px] uppercase tracking-[0.15em] whitespace-nowrap ${
      active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-300'}`} />
    {label}
    {count !== undefined && (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
        {count}
      </span>
    )}
  </button>
);

export default TaskModal;
