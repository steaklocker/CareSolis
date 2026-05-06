import React from 'react';

/**
 * ROBUST MODAL COMPONENT
 * 
 * This modal ensures proper scrolling on ALL devices and input methods:
 * - Trackpad (two-finger swipe)
 * - Mouse wheel
 * - Touch scrolling (mobile)
 * - Keyboard navigation
 * 
 * ARCHITECTURE:
 * - Fixed backdrop with overflow-y-auto for page-level scrolling
 * - Flexbox layout separating header/body/footer
 * - WebKit touch scrolling optimization
 * - Overscroll containment to prevent background scroll
 * 
 * USAGE:
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Modal Title"
 *   subtitle="Optional subtitle"
 *   maxWidth="2xl"
 * >
 *   <Modal.Body>
 *     Your scrollable content here
 *   </Modal.Body>
 *   <Modal.Footer>
 *     <button onClick={onCancel}>Cancel</button>
 *     <button onClick={onSave}>Save</button>
 *   </Modal.Footer>
 * </Modal>
 */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  preventClose?: boolean; // Prevent clicking backdrop to close
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
  preventClose = false,
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] overflow-y-auto"
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      }}
      onClick={handleBackdropClick}
    >
      <div className="min-h-screen py-8 px-4 flex items-start justify-center">
        <div
          className={`w-full ${maxWidthClasses[maxWidth]} bg-slate-900 border border-slate-800 rounded-lg shadow-2xl my-auto`}
          style={{ maxHeight: 'calc(100vh - 4rem)' }}
        >
          <div className="flex flex-col h-full" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            {/* Header - Fixed (only if title provided) */}
            {title && (
              <div className="border-b border-slate-800 p-6 flex-shrink-0">
                <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
                {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
              </div>
            )}

            {/* Content - Rendered by children using Modal.Body and Modal.Footer */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal.Body - Scrollable content area
interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

Modal.Body = function ModalBody({ children, className = '' }: ModalBodyProps) {
  return (
    <div
      className={`p-6 overflow-y-auto flex-1 ${className}`}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      }}
    >
      {children}
    </div>
  );
};

// Modal.Footer - Fixed action buttons
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

Modal.Footer = function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`border-t border-slate-800 p-6 flex justify-end gap-3 flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
};

// Modal.Form - Wrapper for forms with onSubmit
interface ModalFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

Modal.Form = function ModalForm({ children, onSubmit }: ModalFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full">
      {children}
    </form>
  );
};
