import React from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  singleButton?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  singleButton = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-rose-400" />,
          iconBg: 'bg-rose-500/20 border-rose-500/40',
          confirmBtn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-danger-glow',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          iconBg: 'bg-amber-500/20 border-amber-500/40',
          confirmBtn: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
          iconBg: 'bg-emerald-500/20 border-emerald-500/40',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-success-glow',
        };
      default:
        return {
          icon: <Info className="w-6 h-6 text-blue-400" />,
          iconBg: 'bg-blue-500/20 border-blue-500/40',
          confirmBtn: 'bg-industrial-accent hover:bg-blue-600 text-white shadow-scada-glow',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-industrial-card border border-industrial-border rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-industrial-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <h3 className="font-extrabold text-base text-white font-mono tracking-tight">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-industrial-cardHover text-industrial-textMuted hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-industrial-textSecondary leading-relaxed">{message}</p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 bg-industrial-bg/50 border-t border-industrial-border">
          {!singleButton && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-industrial-card hover:bg-industrial-cardHover border border-industrial-border text-white text-xs font-bold rounded-xl transition-all"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs font-extrabold rounded-xl uppercase tracking-wider transition-all ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};
