import { createPortal } from 'react-dom';
import { CheckCircle } from 'lucide-react';
import { useToastState } from '../../lib/ToastContext';

export default function ToastContainer() {
  const toasts = useToastState();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg shadow-lg animate-slide-in"
        >
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <span className="text-sm">{toast.message}</span>
        </div>
      ))}
    </div>,
    document.body,
  );
}
