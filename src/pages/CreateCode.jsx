import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { codeService } from '../services/codeService';
import { authService } from '../services/authService';
import ProfileImage from '../components/ProfileImage';
import '../styles/CreateCode.css';
import '../styles/Buttons.css';
import '../styles/Alerts.css';

const CreateCode = () => {
  const [formData, setFormData] = useState({
    linguagem: '',
    descricao: '',
    codigo: '',
    imgUrl: ''
  });
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');
    setFeedbackType('');
    setIsLoading(true);

    try {
      await codeService.createCode(formData);
      setFeedback('Código cadastrado com sucesso!');
      setFeedbackType('success');
      
      // Limpa o formulário
      setFormData({
        linguagem: '',
        descricao: '',
        codigo: '',
        imgUrl: ''
      });
      
      // Redireciona após 1.5 segundos
      setTimeout(() => navigate('/main'), 1500);
    } catch (error) {
      console.error('Error creating code:', error);
      setFeedback('Erro ao cadastrar código: ' + error.message);
      setFeedbackType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/main');
  };

  return (
    <div className="create-container">
      <div className="create-header">
        <ProfileImage size="medium" />
        <h1 className="create-title">Criar Novo Código</h1>
        <p className="create-subtitle">Adicione um novo snippet de código à sua coleção</p>
      </div>

      <div className="create-form-container">
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <span>💻</span>
                Linguagem
              </label>
              <input
                type="text"
                name="linguagem"
                className="form-input"
                placeholder="Ex: JavaScript, Python, Java, PHP..."
                value={formData.linguagem}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>📝</span>
                Descrição
              </label>
              <input
                type="text"
                name="descricao"
                className="form-input"
                placeholder="Descreva o que este código faz..."
                value={formData.descricao}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>🔗</span>
              URL da Imagem
            </label>
            <input
              type="text"
              name="imgUrl"
              className="form-input"
              placeholder="https://exemplo.com/imagem.jpg"
              value={formData.imgUrl}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <small className="form-help">
              Cole a URL de uma imagem representativa do código
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>👨‍💻</span>
              Código
            </label>
            <textarea
              name="codigo"
              className="form-textarea code-textarea"
              rows="12"
              placeholder="Cole ou digite seu código aqui..."
              value={formData.codigo}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <div className="code-stats">
              <span>{formData.codigo.length} caracteres</span>
              <span>{formData.codigo.split('\n').length} linhas</span>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleBack}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              <span>←</span>
              Voltar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="button-spinner"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Salvar Código
                </>
              )}
            </button>
          </div>
        </form>

        {feedback && (
          <div className={`alert alert-${feedbackType}`}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCode;