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
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }
    loadCodes();
  }, [navigate, currentPage, searchTerm]);

  const loadCodes = async () => {
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (searchTerm.trim()) {
        // Usa searchCodes (que faz chamada ao endpoint /search)
        response = await codeService.searchCodes(searchTerm, currentPage, 10);
      } else {
        // Usa getCodes (que faz chamada ao endpoint raiz com paginação)
        response = await codeService.getCodes(currentPage, 10);
      }
      
      console.log('📊 Resposta da API:', response);
      
      // Spring Data Page retorna:
      // content: Array de itens
      // totalPages: Número total de páginas
      // totalElements: Número total de elementos
      // number: Página atual (0-based)
      // size: Tamanho da página
      // first: É a primeira página?
      // last: É a última página?
      
      if (response && response.content) {
        setCodes(response.content);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
        
        // Verifica se a página atual é maior que o total de páginas
        if (response.number !== undefined && response.number !== currentPage) {
          console.log(`⚠️ Ajustando página: ${currentPage} → ${response.number}`);
          setCurrentPage(response.number);
        }
      } else {
        setCodes([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar códigos:', error);
      setError('Erro ao carregar códigos: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(0);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
  };

  const deleteCode = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este código?')) return;

    try {
      await codeService.deleteCode(id);
      setFeedback('Código deletado com sucesso!');
      setFeedbackType('success');
      
      // Se deletou o último item da página e não é a primeira página, volta uma
      if (codes.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadCodes();
      }
      
      setTimeout(() => {
        setFeedback('');
        setFeedbackType('');
      }, 3000);
    } catch (error) {
      console.error('❌ Erro ao deletar código:', error);
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
      
      await loadCodes();
      
      setTimeout(() => {
        setFeedback('');
        setFeedbackType('');
      }, 3000);
    } catch (error) {
      console.error('❌ Erro ao atualizar código:', error);
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

  const goToPage = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // Gera array de números de página para exibição
  const getPageNumbers = () => {
    const pagesToShow = 5;
    let startPage = Math.max(0, currentPage - Math.floor(pagesToShow / 2));
    let endPage = startPage + pagesToShow - 1;
    
    if (endPage >= totalPages) {
      endPage = totalPages - 1;
      startPage = Math.max(0, endPage - pagesToShow + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage && i < totalPages; i++) {
      pages.push(i);
    }
    return pages;
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
        
        {/* Informações da paginação */}
        <div className="pagination-info">
          {totalElements > 0 && (
            <span className="total-info">
              Total: {totalElements} código{totalElements !== 1 ? 's' : ''}
            </span>
          )}
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
            
            <div className="page-numbers">
              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {pageNum + 1}
                </button>
              ))}
            </div>
            
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