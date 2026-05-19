import { useEffect, useCallback } from 'react';

export default function Modal({ isOpen, onClose, title, children, actions }) {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={`modal-overlay${isOpen ? ' visible' : ''}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      <div className="modal">
        {title && <h2>{title}</h2>}
        <div className="modal-body">{children}</div>
        {actions && actions.length > 0 && (
          <div className="modal-actions">
            {actions.map((action, idx) => (
              <button
                key={idx}
                className={`btn btn-${action.variant || 'secondary'}${action.size === 'sm' ? ' btn-sm' : ''}`}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
