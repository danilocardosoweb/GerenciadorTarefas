
import React from 'react';
import { AlertTriangle, X, Check, Info } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'info' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen, title, message, confirmLabel, cancelLabel = "Cancelar", onConfirm, onCancel, type = 'info'
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: 'bg-rose-600 shadow-rose-100 text-white',
    info: 'bg-blue-600 shadow-blue-100 text-white',
    success: 'bg-emerald-600 shadow-emerald-100 text-white'
  };

  const icons = {
    danger: <AlertTriangle className="w-8 h-8 text-rose-500" />,
    info: <Info className="w-8 h-8 text-blue-500" />,
    success: <Check className="w-8 h-8 text-emerald-500" />
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-100">
            {icons[type]}
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{title}</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">{message}</p>
        </div>
        
        <div className="p-8 pt-0 flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className={`w-full py-4 rounded-[22px] font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 ${colors[type]}`}
          >
            {confirmLabel}
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
