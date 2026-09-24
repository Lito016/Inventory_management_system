import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[3px]" onClick={onCancel} aria-hidden="true" />
      <div
        className="relative bg-surface rounded-xl shadow-2xl ring-1 ring-gray-900/5 w-full max-w-md mx-4 p-6"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-full grid place-items-center bg-sunken">
            <AlertTriangle className={`h-5 w-5 ${variant === 'danger' ? 'text-error-600' : 'text-link'}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-gray-900 tracking-tight">{title}</h3>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
