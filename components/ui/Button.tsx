"use client";

import React, { forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Generate inline styles based on variant
    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case "primary":
          return {
            background: "var(--accent-grad)",
            color: "white",
            border: "none",
          };
        case "secondary":
          return {
            background: "transparent",
            border: "1.5px solid var(--border-strong)",
            color: "var(--text-primary)",
          };
        case "ghost":
          return {
            background: "transparent",
            border: "none",
            color: "var(--accent)",
          };
        case "danger":
          return {
            background: "linear-gradient(135deg, #EF4444, #DC2626)",
            color: "white",
            border: "none",
          };
        default:
          return {};
      }
    };

    // Use a custom class approach with inline styles to strictly adhere to the token system,
    // while keeping hover/active effects in CSS or using pseudo-classes via tailwind arbitrary.
    // However, since we want exact tokens without worrying about tailwind setup for these specifics,
    // let's use a combination of classes and inline styles.
    
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-[var(--dur-fast)] ease-[var(--ease-out)]",
          {
            // Sizes
            "px-3 py-1.5 text-xs rounded-[var(--radius-sm)]": size === "sm",
            "px-5 py-2.5 text-sm rounded-[var(--radius-md)]": size === "md",
            "px-6 py-3 text-base rounded-[var(--radius-lg)]": size === "lg",
            "w-full": fullWidth,
            "opacity-50 cursor-not-allowed": disabled || loading,
          },
          // Hover/Active states via Tailwind arbitrary variants mapped to CSS variables
          variant === "primary" && !disabled && !loading && "hover:-translate-y-[2px] hover:shadow-[var(--shadow-md)] active:translate-y-0 active:scale-98",
          variant === "secondary" && !disabled && !loading && "hover:-translate-y-[1px] hover:border-[var(--border-accent)]",
          variant === "ghost" && !disabled && !loading && "hover:bg-[var(--accent-soft)] hover:rounded-[var(--radius-md)]",
          variant === "danger" && !disabled && !loading && "hover:-translate-y-[2px] hover:shadow-[var(--shadow-glow-red)] active:translate-y-0 active:scale-98",
          className
        )}
        style={getVariantStyles()}
        {...props}
      >
        {loading && (
          <span
            className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin"
            style={variant !== "primary" && variant !== "danger" ? { borderColor: "var(--border)", borderTopColor: "var(--accent)" } : {}}
          />
        )}
        {!loading && icon && <span className="mr-2 inline-flex">{icon}</span>}
        {loading ? "..." : children}
      </button>
    );
  }
);
Button.displayName = "Button";
