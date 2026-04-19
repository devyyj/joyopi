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
  const [resolveFn, setResolveFn] = useState<((value: boolean) => void) | null>(null);

  const showAlert = useCallback((message: string, opts?: Omit<DialogOptions, 'message'>) => {
    setOptions({ confirmText: '확인', ...opts, message });
    setType('alert');
    setIsOpen(true);
    setResolveFn(null);
  }, []);

  const showConfirm = useCallback((message: string, opts?: Omit<DialogOptions, 'message'>) => {
    setOptions({ confirmText: '확인', cancelText: '취소', ...opts, message });
    setType('confirm');
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveFn(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    options.onConfirm?.();
    if (resolveFn) resolveFn(true);
  }, [options, resolveFn]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    options.onCancel?.();
    if (resolveFn) resolveFn(false);
  }, [options, resolveFn]);

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
        cancelText={type === 'confirm' ? (options.cancelText || '취소') : undefined}
        variant={options.variant}
      />
    </DialogContext.Provider>
  );
};
