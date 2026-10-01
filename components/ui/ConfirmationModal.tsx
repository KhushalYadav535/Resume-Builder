"use client";
import React from "react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Optional rich JSX content rendered between title and action buttons */
  customContent?: React.ReactNode;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = false,
  onConfirm,
  onCancel,
  customContent,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const hasCustomContent = !!customContent;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease',
      padding: '1rem',
    }}>
      <div className="card" style={{
        maxWidth: hasCustomContent ? '520px' : '420px',
        width: '100%',
        padding: '1.75rem',
        textAlign: hasCustomContent ? 'left' : 'center',
        display: 'grid',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-3d)',
        border: '1px solid var(--border)',
        animation: 'fadeUp 0.3s var(--ease-spring)',
        backgroundColor: 'var(--card)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: hasCustomContent ? '1.5rem' : '2.5rem', flexShrink: 0 }}>
            {isDanger ? '⚠️' : '❓'}
          </span>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.15rem', margin: 0, color: 'var(--text-primary)' }}>
            {title}
          </h3>
        </div>

        {/* Plain message (shown when no customContent) */}
        {!hasCustomContent && message && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, margin: 0, textAlign: 'center' }}>
            {message}
          </p>
        )}

        {/* Rich custom content slot */}
        {hasCustomContent && customContent}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: hasCustomContent ? 'flex-end' : 'center' }}>
          <button
            className="btn-secondary"
            style={{ padding: '0.55rem 1.4rem', fontSize: '0.85rem', cursor: 'pointer' }}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="btn-primary"
            style={{ 
              padding: '0.55rem 1.4rem', 
              fontSize: '0.85rem', 
              cursor: 'pointer',
              background: isDanger ? '#EF4444' : 'var(--accent)',
              border: 'none',
              color: '#fff'
            }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

