import React from 'react';
import '../styles/Modals.css';
import '../styles/Buttons.css';

const CodeModal = ({ isOpen, onClose, code, onCopy }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Visualizar Código</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="code-preview">
            {code}
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onCopy} className="btn btn-primary">
            <span>📋</span>
            Copiar Código
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeModal;