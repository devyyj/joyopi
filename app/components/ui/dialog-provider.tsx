'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmModal } from './core';

type DialogType = 'alert' | 'confirm';

interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface DialogContextType {
  alert: (message: string, options?: Omit<DialogOptions, 'message'>) => void;
  confirm: (message: string, options?: Omit<DialogOptions, 'message'>) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<DialogType>('alert');
  const [options, setOptions] = useState<DialogOptions>({ message: '' });
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>();

  const showAlert = useCallback((message: string, opts?: Omit<DialogOptions, 'message'>) => {
    setType('alert');
    setOptions({ message, ...opts });
    setIsOpen(true);
  }, []);

  const showConfirm = useCallback((message: string, opts?: Omit<DialogOptions, 'message'>) => {
    setType('confirm');
    setOptions({ message, ...opts });
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    options.onConfirm?.();
    resolvePromise?.(true);
    setIsOpen(false);
  }, [options, resolvePromise]);

  const handleCancel = useCallback(() => {
    options.onCancel?.();
    resolvePromise?.(false);
    setIsOpen(false);
  }, [options, resolvePromise]);

  return (
    <DialogContext.Provider value={{ alert: showAlert, confirm: showConfirm }}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={options.title || (type === 'alert' ? '알림' : '확인')}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={type === 'alert' ? undefined : options.cancelText}
        variant={options.variant}
      />
    </DialogContext.Provider>
  );
};
