import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, Loader2, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "loading";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (type !== "loading" && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, type]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
    loading: <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />,
  };

  const bgColors = {
    success: "bg-zinc-950 border-green-500",
    error: "bg-zinc-950 border-red-500",
    info: "bg-zinc-950 border-cyan-500",
    loading: "bg-zinc-950 border-cyan-500",
  };

  const textColors = {
    success: "text-green-400",
    error: "text-red-400",
    info: "text-cyan-400",
    loading: "text-cyan-400",
  };

  return (
    <div
      className={`fixed bottom-24 right-4 z-[60] max-w-md animate-in slide-in-from-bottom-5 ${bgColors[type]} border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] p-4`}
    >
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className={`flex-1 text-xs font-mono uppercase tracking-wider ${textColors[type]}`}>{message}</div>
        {type !== "loading" && (
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 text-zinc-500 hover:text-zinc-400"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Toast manager hook
let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<
    Array<{ id: number; message: string; type: ToastType }>
  >([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Date.now() + toastIdCounter++;
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  };

  const hideToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </>
  );

  return { showToast, hideToast, ToastContainer };
}
