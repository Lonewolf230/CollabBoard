import React, { useState, useEffect } from 'react';

const styles = `
  .toast-container {
    position: fixed;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease-in-out;
    z-index: 1000;
  }

  .toast-icon {
    width: 20px;
    height: 20px;
  }

  /* Toast Types */
  .toast-info {
    background-color: #3b82f6;
  }

  .toast-success {
    background-color: #22c55e;
  }

  .toast-error {
    background-color: #ef4444;
  }

  .toast-warning {
    background-color: #f59e0b;
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

  /* Enter/Exit Animations */
  .toast-enter {
    opacity: 1;
    transform: translateX(0);
  }

  .toast-exit {
    opacity: 0;
    transform: translateX(100%);
  }

  /* Position-specific animations */
  .toast-top-left.toast-exit,
  .toast-bottom-left.toast-exit {
    transform: translateX(-100%);
  }
`;

const Toast = ({ 
  message = "Default toast message",
  duration = 3000,
  type = "info",
  position = "top-right",
  onClose = () => {},
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

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
      }, 300); // Match transition duration
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

  return (
    <div
      className={`
        toast-container 
        toast-${type} 
        toast-${position}
        ${isLeaving ? 'toast-exit' : 'toast-enter'}
      `}
    >
      {getIcon()}
      <span>{message}</span>
    </div>
  );
};

export default Toast;