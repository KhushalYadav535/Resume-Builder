"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, X, Info, AlertCircle } from "lucide-react";

export type ToastVariant = "success" | "ai" | "goal" | "info" | "warning";

interface Props {
  message: string;
  show: boolean;
  variant?: ToastVariant;
  onClose: () => void;
}

const VARIANT_STYLES: Record<ToastVariant, { icon: any; bg: string; icon_color: string }> = {
  success: {
    icon: CheckCircle2,
    bg: "bg-slate-900 dark:bg-slate-800",
    icon_color: "text-emerald-400",
  },
  ai: {
    icon: Sparkles,
    bg: "bg-slate-900 dark:bg-slate-800",
    icon_color: "text-amber-400",
  },
  goal: {
    icon: Sparkles,
    bg: "bg-gradient-to-r from-amber-600 to-amber-500",
    icon_color: "text-white",
  },
  info: {
    icon: Info,
    bg: "bg-slate-900 dark:bg-slate-800",
    icon_color: "text-blue-400",
  },
  warning: {
    icon: AlertCircle,
    bg: "bg-slate-900 dark:bg-slate-800",
    icon_color: "text-amber-400",
  },
};

export default function PulseToast({ message, show, variant = "success", onClose }: Props) {
  const cfg = (variant && VARIANT_STYLES[variant]) ? VARIANT_STYLES[variant] : VARIANT_STYLES.success;
  const Icon = cfg.icon;

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[70]
            flex items-center gap-3 px-5 py-3.5 rounded-2xl
            ${cfg.bg} backdrop-blur-xl
            border border-white/10 shadow-2xl
            text-white text-sm font-semibold max-w-sm w-full mx-4`}
        >
          <Icon className={`w-4 h-4 shrink-0 ${cfg.icon_color}`} />
          <span className="flex-1 leading-snug">{message}</span>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Auto-progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 3.8, ease: "linear" }}
            style={{ transformOrigin: "left" }}
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl bg-white/20"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
