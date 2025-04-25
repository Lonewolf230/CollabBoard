// import React, { useState, useEffect } from 'react';

// const styles = `
//   .toast-container {
//     position: fixed;
//     padding: 16px;
//     border-radius: 8px;
//     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//     color: white;
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     transition: all 0.3s ease-in-out;
//     z-index: 1000;
//   }

//   .toast-icon {
//     width: 20px;
//     height: 20px;
//   }

//   /* Toast Types */
//   .toast-info {
//     background-color: #3b82f6;
//   }

//   .toast-success {
//     background-color: #22c55e;
//   }

//   .toast-error {
//     background-color: #ef4444;
//   }

//   .toast-warning {
//     background-color: #f59e0b;
//   }

//   /* Toast Positions */
//   .toast-top-right {
//     top: 16px;
//     right: 16px;
//   }

//   .toast-top-left {
//     top: 16px;
//     left: 16px;
//   }

//   .toast-bottom-right {
//     bottom: 16px;
//     right: 16px;
//   }

//   .toast-bottom-left {
//     bottom: 16px;
//     left: 16px;
//   }

//   /* Enter/Exit Animations */
//   .toast-enter {
//     opacity: 1;
//     transform: translateX(0);
//   }

//   .toast-exit {
//     opacity: 0;
//     transform: translateX(100%);
//   }

//   /* Position-specific animations */
//   .toast-top-left.toast-exit,
//   .toast-bottom-left.toast-exit {
//     transform: translateX(-100%);
//   }
// `;

// const Toast = ({ 
//   message = "Default toast message",
//   duration = 3000,
//   type = "info",
//   position = "top-right",
//   onClose = () => {},
// }) => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [isLeaving, setIsLeaving] = useState(false);

//   useEffect(() => {
//     // Inject styles once
//     if (!document.getElementById('toast-styles')) {
//       const styleSheet = document.createElement('style');
//       styleSheet.id = 'toast-styles';
//       styleSheet.textContent = styles;
//       document.head.appendChild(styleSheet);
//     }

//     setIsVisible(true);
//     const timer = setTimeout(() => {
//       setIsLeaving(true);
//       setTimeout(() => {
//         setIsVisible(false);
//         onClose();
//       }, 300); // Match transition duration
//     }, duration);

//     return () => clearTimeout(timer);
//   }, [duration, onClose]);

//   if (!isVisible) return null;

//   const getIcon = () => {
//     switch (type) {
//       case 'success':
//         return (
//           <svg className="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//           </svg>
//         );
//       case 'error':
//         return (
//           <svg className="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         );
//       case 'warning':
//         return (
//           <svg className="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//           </svg>
//         );
//       default:
//         return (
//           <svg className="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//         );
//     }
//   };

//   return (
//     <div
//       className={`
//         toast-container 
//         toast-${type} 
//         toast-${position}
//         ${isLeaving ? 'toast-exit' : 'toast-enter'}
//       `}
//     >
//       {getIcon()}
//       <span>{message}</span>
//     </div>
//   );
// };

// export default Toast;

import React, { useState, useEffect } from 'react';

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

  const handleCloseClick = ( e: any ) => {
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

export default Toast;