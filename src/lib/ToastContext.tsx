import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface Toast {
  id: number;
  message: string;
}

type ShowToast = (message: string) => void;

const ToastDispatchContext = createContext<ShowToast | null>(null);
const ToastStateContext = createContext<Toast[]>([]);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback<ShowToast>((message) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, 2500);
    timers.current.set(id, timer);
  }, []);

  useEffect(() => {
    const t = timers.current;
    return () => {
      t.forEach((timer) => clearTimeout(timer));
      t.clear();
    };
  }, []);

  return (
    <ToastDispatchContext.Provider value={showToast}>
      <ToastStateContext.Provider value={toasts}>{children}</ToastStateContext.Provider>
    </ToastDispatchContext.Provider>
  );
}

export function useToast() {
  const showToast = useContext(ToastDispatchContext);
  if (!showToast) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return { showToast };
}

export function useToastState() {
  return useContext(ToastStateContext);
}
