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
}: ConfirmationModalProps) {
  if (!isOpen) return null;

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
    }}>
      <div className="card" style={{
        maxWidth: '420px',
        width: '90%',
        padding: '2rem',
        textAlign: 'center',
        display: 'grid',
        gap: '1.5rem',
        boxShadow: 'var(--shadow-3d)',
        border: '1px solid var(--border)',
        animation: 'fadeUp 0.3s var(--ease-spring)',
        backgroundColor: 'var(--card)'
      }}>
        <div style={{ fontSize: '2.5rem' }}>{isDanger ? '⚠️' : '❓'}</div>
        <div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.25rem', margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
            {message}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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
