import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { codeService } from '../services/codeService';
import { authService } from '../services/authService';
import ProfileImage from '../components/ProfileImage';
import CodeModal from '../components/CodeModal';
import UpdateModal from '../components/UpdateModal';

import '../styles/Main.css';
import '../styles/Buttons.css';
import '../styles/Alerts.css';
import '../styles/Modals.css';

const Main = () => {
  const [codes, setCodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCode, setSelectedCode] = useState(null);
  const [editingCode, setEditingCode] = useState(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }
    fetchCodes();
  }, [navigate, currentPage]);

  const fetchCodes = async (page = 0) => {
    setLoading(true);
    setError('');
    try {
      const data = await codeService.getCodes(page, 10); // Página atual, 10 itens por página
      console.log('Codes received:', data);
      
      // Spring Data Page retorna content (array) e totalPages
      if (data && data.content) {
        setCodes(data.content);
        setTotalPages(data.totalPages || 0);
      } else if (Array.isArray(data)) {
        setCodes(data);
        setTotalPages(0);
      } else {
        setCodes([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
      setError('Erro ao carregar códigos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const searchCodes = async (page = 0) => {
    if (!searchTerm.trim()) {
      fetchCodes(page);
      return;
    }

    setLoading(true);
    try {
      const data = await codeService.searchCodes(searchTerm, page, 10);
      
      // Spring Data Page retorna content (array) e totalPages
      if (data && data.content) {
        setCodes(data.content);
        setTotalPages(data.totalPages || 0);
      } else if (Array.isArray(data)) {
        setCodes(data);
        setTotalPages(0);
      } else {
        setCodes([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error searching codes:', error);
      setError('Erro na busca: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(0);
      searchCodes(0);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    searchCodes(0);
  };

  const deleteCode = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este código?')) return;

    try {
      await codeService.deleteCode(id);
      setFeedback('Código deletado com sucesso!');
      setFeedbackType('success');
      
      // Recarrega a lista mantendo a página atual
      if (searchTerm.trim()) {
        searchCodes(currentPage);
      } else {
        fetchCodes(currentPage);
      }
      
      setTimeout(() => {
        setFeedback('');
        setFeedbackType('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting code:', error);
      setFeedback('Erro ao deletar código: ' + error.message);
      setFeedbackType('error');
      
      setTimeout(() => {
        setFeedback('');
        setFeedbackType('');
      }, 5000);
    }
  };

  const updateCode = async (codeData) => {
    try {
      await codeService.updateCode(editingCode.id, codeData);
      setIsUpdateModalOpen(false);
      setEditingCode(null);
      setFeedback('Código atualizado com sucesso!');
      setFeedbackType('success');
      
      // Recarrega a lista mantendo a página atual
      if (searchTerm.trim()) {
        searchCodes(currentPage);
      } else {
        fetchCodes(currentPage);
      }
      
      setTimeout(() => {
        setFeedback('');
        setFeedbackType('');
      }, 3000);
    } catch (error) {
      console.error('Error updating code:', error);
      setFeedback('Erro ao atualizar código: ' + error.message);
      setFeedbackType('error');
    }
  };

  const viewCode = (code) => {
    setSelectedCode(code.codigo);
    setIsCodeModalOpen(true);
  };

  const editCode = (code) => {
    setEditingCode(code);
    setIsUpdateModalOpen(true);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(selectedCode);
    setFeedback('Código copiado para a área de transferência!');
    setFeedbackType('success');
    
    setTimeout(() => {
      setFeedback('');
      setFeedbackType('');
    }, 2000);
  };

  const logout = () => {
    authService.logout();
    navigate('/');
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(0);
    fetchCodes(0);
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="main-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando códigos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="main-header">
        <ProfileImage size="large" />
        <h1 className="main-title">Gerenciador de Códigos</h1>
        <p className="main-subtitle">Gerencie seus snippets de código</p>
      </div>

      <div className="actions-grid">
        <button onClick={logout} className="btn btn-secondary">
          <span>🚪</span>
          Logout
        </button>
        <button onClick={() => navigate('/create')} className="btn btn-primary">
          <span>➕</span>
          Criar Código
        </button>
      </div>

      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Pesquisar por linguagem ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearchKeyPress}
          />
          <button onClick={handleSearch} className="btn btn-primary">
            <span>🔍</span>
            Buscar
          </button>
          <button onClick={clearSearch} className="btn btn-secondary">
            <span>🔄</span>
            Limpar
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {feedback && (
        <div className={`alert alert-${feedbackType}`}>
          {feedback}
        </div>
      )}

      <div className="table-section">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Linguagem</th>
                <th>Descrição</th>
                <th>Preview</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                        </svg>
                      </div>
                      <h3>Nenhum código encontrado</h3>
                      <p>{searchTerm ? 'Tente ajustar os termos da busca' : 'Comece criando seu primeiro código'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                codes.map(code => (
                  <tr key={code.id}>
                    <td>
                      <strong>#{code.id}</strong>
                    </td>
                    <td>
                      <span className="language-badge">
                        {code.linguagem}
                      </span>
                    </td>
                    <td>
                      <div className="code-description">
                        <div className="description-text">
                          {code.descricao}
                        </div>
                        <div className="code-stats">
                          {code.codigo?.length || 0} caracteres
                        </div>
                      </div>
                    </td>
                    <td>
                      {code.imgUrl ? (
                        <img 
                          src={code.imgUrl} 
                          alt="Preview" 
                          className="img-preview"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="img-placeholder">
                          Sem imagem
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          onClick={() => viewCode(code)} 
                          className="btn btn-secondary btn-sm"
                          title="Visualizar código"
                        >
                          <span>👁️</span>
                          Ver
                        </button>
                        <button 
                          onClick={() => editCode(code)} 
                          className="btn btn-success btn-sm"
                          title="Editar código"
                        >
                          <span>✏️</span>
                          Editar
                        </button>
                        <button 
                          onClick={() => deleteCode(code.id)} 
                          className="btn btn-danger btn-sm"
                          title="Deletar código"
                        >
                          <span>🗑️</span>
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={prevPage} 
              disabled={currentPage === 0}
              className="btn btn-secondary btn-sm"
            >
              ‹ Anterior
            </button>
            
            <span className="page-info">
              Página {currentPage + 1} de {totalPages}
            </span>
            
            <button 
              onClick={nextPage} 
              disabled={currentPage >= totalPages - 1}
              className="btn btn-secondary btn-sm"
            >
              Próxima ›
            </button>
          </div>
        )}
      </div>

      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        code={selectedCode}
        onCopy={copyCode}
      />

      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        code={editingCode}
        onSave={updateCode}
      />
    </div>
  );
};

export default Main;