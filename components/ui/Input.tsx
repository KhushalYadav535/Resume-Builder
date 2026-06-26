"use client";

import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, type = "text", error, icon, value, onChange, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState("");

    // Determine if input is "filled" (either controlled or uncontrolled)
    const isFilled =
      value !== undefined && value !== null && String(value).length > 0
        || internalValue.length > 0;

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const active = focused || isFilled;

    return (
      <div className={cn("relative w-full", className)}>
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10 flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "w-full bg-[var(--bg-elevated)] border-[1.5px] border-[var(--border)] rounded-[var(--radius-md)] text-[15px] text-[var(--text-primary)] transition-all duration-[var(--dur-fast)] ease-[var(--ease-out)] outline-none",
            "focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]",
            error && "border-[var(--danger)] focus:border-[var(--danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
            icon ? "pl-11" : "pl-3.5",
            isPassword ? "pr-11" : "pr-3.5",
            "pt-[18px] pb-1.5"
          )}
          {...props}
        />
        {label && (
          <label
            className={cn(
              "absolute left-3.5 transition-all duration-[var(--dur-fast)] ease-[var(--ease-out)] pointer-events-none",
              icon && !active ? "left-11" : "",
              active
                ? "top-2 transform-none text-[11px] font-semibold text-[var(--accent)] tracking-[0.04em] uppercase"
                : "top-1/2 -translate-y-1/2 text-[15px] text-[var(--text-muted)]",
              error && active && "text-[var(--danger)]"
            )}
          >
            {label}
          </label>
        )}
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {error && (
          <div className="absolute -bottom-5 left-1 text-[11px] text-[var(--danger)] font-medium">
            {error}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
