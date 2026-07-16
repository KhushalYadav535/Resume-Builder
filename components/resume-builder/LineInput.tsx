"use client";

import React, { useRef, useEffect, TextareaHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type LineInputState = "empty" | "unassessed" | "flagged" | "affirmed";

interface LineInputProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  inputState?: LineInputState;
  placeholder?: string;
}

export function LineInput({
  value,
  onChange,
  inputState = "empty",
  placeholder = "What did you do here?",
  className,
  ...props
}: LineInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";
      // Set to scrollHeight, with a max of 3 rows (~72px assuming 24px line height)
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 72)}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Determine border classes based on state
  let stateClasses = "border-[var(--border)] border";
  if (inputState === "flagged") {
    stateClasses = "border-l-[3px] border-l-[var(--signal-nudge)] border-y-[var(--border)] border-r-[var(--border)] border-y border-r";
  } else if (inputState === "affirmed") {
    stateClasses = "border-l-[3px] border-l-[var(--accent-affirm)] border-y-[var(--border)] border-r-[var(--border)] border-y border-r";
  }

  return (
    <div className="relative w-full group">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={1}
        className={cn(
          "w-full resize-none overflow-hidden rounded-[8px] bg-[var(--bg-2)] px-4 py-3",
          "text-[var(--text)] type-body transition-colors outline-none",
          "placeholder:text-[var(--text-muted)] placeholder:not-italic",
          "focus:border-[var(--accent)] focus:border focus:ring-0 focus:shadow-none",
          stateClasses,
          className
        )}
        style={{ minHeight: "46px" }}
        {...props}
      />
      {inputState === "affirmed" && (
        <div 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--accent-affirm)] pointer-events-none"
          title="Strongly written"
        >
          <Check size={16} strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}
