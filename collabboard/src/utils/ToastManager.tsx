// import React, { useState, createContext, useContext } from 'react';
// import Toast from '../components/Toast';
// import {v4 as uuidv4} from 'uuid'

// interface ToastProps {
//     id: string;
//     message: string;
//     type: 'info' | 'success' | 'warning' | 'error';
//     duration: number;
//     position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
//     onClose: () => void;
//   }
  
//   interface ToastContextType {
//     showToast: (
//       message: string, 
//       type?: ToastProps['type'], 
//       duration?: number, 
//       position?: ToastProps['position']
//     ) => void;
//   }
  
//   interface ToastProviderProps {
//     children: React.ReactNode;
//   }
  
// const ToastContext = createContext<ToastContextType | undefined>(undefined);

// export const useToast = (): ToastContextType => {
//     const context = useContext(ToastContext);
//     if (context === undefined) {
//       throw new Error('useToast must be used within a ToastProvider');
//     }
//     return context;
//   };
  
//   export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
//     const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);
  
//     // Function to add a toast
//     const showToast = (
//       message: string, 
//       type: ToastProps['type'] = 'info', 
//       duration = 2000, 
//       position: ToastProps['position'] = 'top-right'
//     ): void => {
//       const id = uuidv4(); // Unique ID for each toast
//       setToasts((prev) => [...prev, { id, message, type, duration, position }]);
  
//       // Remove toast after duration
//       setTimeout(() => {
//         setToasts((prev) => prev.filter((toast) => toast.id !== id));
//       }, duration + 300); // Account for animation delay
//     };
  
//     return (
//       <ToastContext.Provider value={{ showToast }}>
//         {children}
//         {toasts.map((toast) => (
//           <Toast 
//             key={toast.id} 
//             {...toast} 
//             onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} 
//           />
//         ))}
//       </ToastContext.Provider>
//     );
//   };

import React, { useState, createContext, useContext, useEffect } from 'react';

// Define Toast types
interface ToastProps {
  id: string;
  message: string;
  duration: number;
  type: 'info' | 'success' | 'warning' | 'error';
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onClose: () => void;
}

interface ToastOptions {
  duration?: number;
  position?: ToastProps['position'];
}

interface ToastContextValue {
  show: (message: string, type?: ToastProps['type'], duration?: number, position?: ToastProps['position']) => void;
  info: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// Toast Styles
const styles = `
  .toast-container {
    position: fixed;
    padding: 10px 16px;
    border-radius: 4px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    color: white;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
    max-width: 350px;
    min-width: 250px;
    transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 1000;
    backdrop-filter: blur(5px);
  }

  .toast-message {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .toast-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .toast-close {
    width: 16px;
    height: 16px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
    flex-shrink: 0;
  }

  .toast-close:hover {
    opacity: 1;
  }

  /* Toast Types */
  .toast-info {
    background-color: rgba(59, 130, 246, 0.9);
    border-left: 3px solid #2563eb;
  }

  .toast-success {
    background-color: rgba(34, 197, 94, 0.9);
    border-left: 3px solid #16a34a;
  }

  .toast-error {
    background-color: rgba(239, 68, 68, 0.9);
    border-left: 3px solid #dc2626;
  }

  .toast-warning {
    background-color: rgba(245, 158, 11, 0.9);
    border-left: 3px solid #d97706;
  }

  /* Toast Positions */
  .toast-top-right {
    top: 16px;
    right: 16px;
  }

  .toast-top-left {
    top: 16px;
    left: 16px;
  }

  .toast-bottom-right {
    bottom: 16px;
    right: 16px;
  }

  .toast-bottom-left {
    bottom: 16px;
    left: 16px;
  }

  .toast-top-center {
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
  }

  .toast-bottom-center {
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
  }

  /* Enter/Exit Animations */
  .toast-enter-right {
    opacity: 1;
    transform: translateX(0);
  }

  .toast-exit-right {
    opacity: 0;
    transform: translateX(100%);
  }

  .toast-enter-left {
    opacity: 1;
    transform: translateX(0);
  }

  .toast-exit-left {
    opacity: 0;
    transform: translateX(-100%);
  }

  .toast-enter-center {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  .toast-exit-center {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }

  .toast-exit-bottom-center {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
`;

// Generate unique IDs
const generateId = (): string => Math.random().toString(36).substring(2, 9);

// Toast Component
const Toast: React.FC<ToastProps> = ({ 
  message,
  duration,
  type,
  position,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLeaving, setIsLeaving] = useState<boolean>(false);

  useEffect(() => {
    // Inject styles once
    if (!document.getElementById('toast-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'toast-styles';
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 250); // Match transition duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getAnimationClasses = () => {
    if (position.includes('center')) {
      return isLeaving 
        ? position.includes('bottom') ? 'toast-exit-bottom-center' : 'toast-exit-center'
        : 'toast-enter-center';
    }
    
    if (position.includes('left')) {
      return isLeaving ? 'toast-exit-left' : 'toast-enter-left';
    }
    
    return isLeaving ? 'toast-exit-right' : 'toast-enter-right';
  };

  const handleCloseClick = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 250);
  };

  return (
    <div
      className={`
        toast-container 
        toast-${type} 
        toast-${position}
        ${getAnimationClasses()}
      `}
    >
      {getIcon()}
      <span className="toast-message">{message}</span>
      <svg 
        className="toast-close" 
        onClick={handleCloseClick}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
};

// Create the context
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Custom hook to use the toast context
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider component
interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<Omit<ToastProps, 'onClose'>>>([]);

  // Function to add a toast
  const showToast = (
    message: string, 
    type: ToastProps['type'] = 'info', 
    duration: number = 3000, 
    position: ToastProps['position'] = 'top-right'
  ): void => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type, duration, position }]);

    // Remove toast after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration + 250); // Account for exit animation
  };

  // Additional helper methods
  const toast: ToastContextValue = {
    show: showToast,
    info: (message: string, options: ToastOptions = {}): void => 
      showToast(message, 'info', options.duration, options.position),
    success: (message: string, options: ToastOptions = {}): void => 
      showToast(message, 'success', options.duration, options.position),
    warning: (message: string, options: ToastOptions = {}): void => 
      showToast(message, 'warning', options.duration, options.position),
    error: (message: string, options: ToastOptions = {}): void => 
      showToast(message, 'error', options.duration, options.position),
    dismiss: (id: string): void => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    },
    dismissAll: (): void => {
      setToasts([]);
    }
  };

  return (
    <ToastContext.Provider value={toast}>
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

// Default export for easier imports
const ToastManager = {
  Provider: ToastProvider,
  useToast
};

export default ToastManager;