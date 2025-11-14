import React, { useState, useEffect } from 'react';
import '../styles/Modals.css';
import '../styles/Buttons.css';

const UpdateModal = ({ isOpen, onClose, code, onSave }) => {
  const [formData, setFormData] = useState({
    linguagem: '',
    descricao: '',
    imgUrl: '',
    codigo: ''
  });

  useEffect(() => {
    if (code) {
      setFormData({
        linguagem: code.linguagem || '',
        descricao: code.descricao || '',
        imgUrl: code.imgUrl || '',
        codigo: code.codigo || ''
      });
    }
  }, [code]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Editar Código</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Linguagem</label>
              <input
                type="text"
                name="linguagem"
                className="form-input"
                placeholder="Ex: JavaScript, Python, Java..."
                value={formData.linguagem}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <input
                type="text"
                name="descricao"
                className="form-input"
                placeholder="Descreva o que este código faz..."
                value={formData.descricao}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">URL da Imagem</label>
              <input
                type="text"
                name="imgUrl"
                className="form-input"
                placeholder="https://exemplo.com/imagem.jpg"
                value={formData.imgUrl}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Código</label>
              <textarea
                name="codigo"
                className="form-textarea"
                rows="12"
                placeholder="Cole seu código aqui..."
                value={formData.codigo}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <span>💾</span>
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;