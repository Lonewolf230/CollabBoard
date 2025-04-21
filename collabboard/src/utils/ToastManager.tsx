import React, { useState, createContext, useContext } from 'react';
import Toast from '../components/Toast';
import {v4 as uuidv4} from 'uuid'

interface ToastProps {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    duration: number;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    onClose: () => void;
  }
  
  interface ToastContextType {
    showToast: (
      message: string, 
      type?: ToastProps['type'], 
      duration?: number, 
      position?: ToastProps['position']
    ) => void;
  }
  
  interface ToastProviderProps {
    children: React.ReactNode;
  }
  
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (context === undefined) {
      throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
  };
  
  export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);
  
    // Function to add a toast
    const showToast = (
      message: string, 
      type: ToastProps['type'] = 'info', 
      duration = 2000, 
      position: ToastProps['position'] = 'top-right'
    ): void => {
      const id = uuidv4(); // Unique ID for each toast
      setToasts((prev) => [...prev, { id, message, type, duration, position }]);
  
      // Remove toast after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration + 300); // Account for animation delay
    };
  
    return (
      <ToastContext.Provider value={{ showToast }}>
        {children}
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            {...toast} 
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} 
          />
        ))}
      </ToastContext.Provider>
    );
  };