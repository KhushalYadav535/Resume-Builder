"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  subtitle?: string;
}

interface ToastContextType {
  success: (title: string, subtitle?: string) => void;
  error: (title: string, subtitle?: string) => void;
  info: (title: string, subtitle?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, title: string, subtitle?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, subtitle }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, subtitle?: string) => addToast("success", title, subtitle), [addToast]);
  const error = useCallback((title: string, subtitle?: string) => addToast("error", title, subtitle), [addToast]);
  const info = useCallback((title: string, subtitle?: string) => addToast("info", title, subtitle), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";
  
  const accentColor = isSuccess ? "var(--score-high)" : isError ? "var(--danger)" : "var(--accent)";
  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: "110%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "110%" }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      className="relative flex items-center gap-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-[14px_18px] min-w-[280px] max-w-[400px] pointer-events-auto overflow-hidden"
    >
      {/* Left accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: accentColor, borderRadius: "var(--radius-lg) 0 0 var(--radius-lg)" }}
      />
      
      <Icon size={20} style={{ color: accentColor, flexShrink: 0 }} />
      
      <div className="flex flex-col flex-1">
        <span className="text-[14px] font-semibold text-[var(--text-primary)]">
          {toast.title}
        </span>
        {toast.subtitle && (
          <span className="text-[12px] text-[var(--text-muted)] mt-0.5">
            {toast.subtitle}
          </span>
        )}
      </div>

      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-full p-1"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
