"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icon";

type ToastVariant = "success" | "error" | "info";

type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms. Pass 0 to keep the toast until dismissed. */
  duration?: number;
};

type ToastItem = ToastOptions & { id: string };

type ToastContextValue = {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4500;

/**
 * Access the toast API. Must be rendered inside a {@link ToastProvider}.
 */
export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}

/**
 * App-wide toast host. Stacks notifications in a portal at the bottom-right and
 * auto-dismisses them. Mount once near the root, inside the client providers.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [mounted, setMounted] = React.useState(false);
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());

  React.useEffect(() => {
    setMounted(true);
    const pending = timers.current;

    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));

    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      const duration = options.duration ?? DEFAULT_DURATION;

      setToasts((current) => [...current, { ...options, id }]);

      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }

      return id;
    },
    [dismiss],
  );

  const value = React.useMemo<ToastContextValue>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <div
              aria-label="Notificações"
              className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
              role="region"
            >
              {toasts.map((item) => (
                <ToastCard key={item.id} onDismiss={() => dismiss(item.id)} toast={item} />
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

const variantConfig: Record<ToastVariant, { icon: IconName; iconClassName: string }> = {
  success: { icon: "check-circle-2", iconClassName: "text-[var(--success-600)]" },
  error: { icon: "alert-triangle", iconClassName: "text-[var(--error-600)]" },
  info: { icon: "bell", iconClassName: "text-[var(--info-600)]" },
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const variant = toast.variant ?? "info";
  const config = variantConfig[variant];

  return (
    <div
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg",
      )}
      role={variant === "error" ? "alert" : "status"}
    >
      <span className={cn("mt-0.5 shrink-0", config.iconClassName)}>
        <Icon name={config.icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{toast.title}</p>
        {toast.description ? (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{toast.description}</p>
        ) : null}
      </div>
      <button
        aria-label="Fechar notificação"
        className="shrink-0 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        onClick={onDismiss}
        type="button"
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}
