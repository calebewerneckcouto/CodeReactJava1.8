// services/codeService.js
import { api } from '../utils/api';

export const codeService = {
  /**
   * Lista códigos com paginação
   */
  async getCodes(page = 0, size = 10) {
    try {
      // ✅ CORRIGIDO: Adicionada barra no final (seu controller espera /codigos/)
      const response = await api.request(`/codigos/?page=${page}&size=${size}`, {
        method: 'GET'
      });
      
      console.log('✅ Códigos carregados:', {
        total: response.totalElements,
        paginas: response.totalPages,
        itens: response.content?.length
      });
      
      return response;
    } catch (error) {
      console.error('❌ Erro ao carregar códigos:', error);
      throw error;
    }
  },

  /**
   * Busca código por ID
   */
  async getCodeById(id) {
    try {
      // ✅ CORRIGIDO: Adicionada barra antes do ID
      const response = await api.request(`/codigos/${id}`, {
        method: 'GET'
      });
      
      console.log(`✅ Código ${id} carregado:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Erro ao buscar código ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cria novo código
   */
  async createCode(codeData) {
    try {
      console.log('➕ Criando novo código:', codeData);
      
      // ✅ CORRIGIDO: 
      // 1. Adicionada barra no final
      // 2. Removido JSON.stringify (api.request já faz isso)
      // 3. Removido headers (api.request já adiciona Content-Type)
      const response = await api.request('/codigos/', {
        method: 'POST',
        body: codeData // ✅ Objeto direto, não JSON.stringify
      });
      
      console.log('✅ Código criado:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro ao criar código:', error);
      throw error;
    }
  },

  /**
   * Atualiza código existente
   */
  async updateCode(id, codeData) {
    try {
      console.log(`✏️ Atualizando código ${id}:`, codeData);
      
      // ✅ CORRIGIDO: Mesmas correções do createCode
      const response = await api.request(`/codigos/${id}`, {
        method: 'PUT',
        body: codeData // ✅ Objeto direto
      });
      
      console.log('✅ Código atualizado:', response);
      return response;
    } catch (error) {
      console.error(`❌ Erro ao atualizar código ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deleta código
   */
  async deleteCode(id) {
    try {
      console.log(`🗑️ Deletando código ${id}`);
      
      const response = await api.request(`/codigos/${id}`, {
        method: 'DELETE',
        expectJson: false // ✅ Delete retorna texto, não JSON
      });
      
      console.log('✅ Código deletado');
      return response;
    } catch (error) {
      console.error(`❌ Erro ao deletar código ${id}:`, error);
      throw error;
    }
  },

  /**
   * Busca códigos por palavra-chave
   */
  async searchCodes(keyword, page = 0, size = 10) {
    try {
      console.log(`🔎 Buscando códigos: "${keyword}"`);
      
      // ✅ Seu controller tem endpoint /codigos/search
      const response = await api.request(
        `/codigos/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
        { method: 'GET' }
      );
      
      console.log('✅ Busca concluída:', {
        resultados: response.content?.length,
        total: response.totalElements
      });
      
      return response;
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      throw error;
    }
  },

  /**
   * Busca alternativa - filtra localmente
   * Use apenas se o endpoint de busca não funcionar
   */
  async searchCodesLocal(keyword, page = 0, size = 10) {
    try {
      console.log(`🔍 Busca local: "${keyword}"`);
      
      // Busca todos os códigos (aumentar size se necessário)
      const allCodes = await this.getCodes(0, 100);
      
      if (!allCodes?.content) {
        return { content: [], totalPages: 0, totalElements: 0 };
      }
      
      // Filtra localmente
      const filtered = allCodes.content.filter(code => {
        const linguagem = code.linguagem?.toLowerCase() || '';
        const descricao = code.descricao?.toLowerCase() || '';
        const codigo = code.codigo?.toLowerCase() || '';
        const keywordLower = keyword.toLowerCase();
        
        return linguagem.includes(keywordLower) || 
               descricao.includes(keywordLower) ||
               codigo.includes(keywordLower);
      });
      
      // Pagina os resultados
      const start = page * size;
      const end = start + size;
      const paginated = filtered.slice(start, end);
      
      console.log(`✅ Busca local concluída: ${filtered.length} resultados`);
      
      return {
        content: paginated,
        totalPages: Math.ceil(filtered.length / size),
        totalElements: filtered.length,
        number: page,
        size: size
      };
    } catch (error) {
      console.error('❌ Erro na busca local:', error);
      throw error;
    }
  }
};

// ===== EXEMPLOS DE USO =====

// import { codeService } from '../services/codeService';

// // 1. Listar códigos
// const result = await codeService.getCodes(0, 10);
// console.log(result.content); // Array de códigos
// console.log(result.totalElements); // Total

// // 2. Buscar por ID
// const code = await codeService.getCodeById(1);

// // 3. Criar código
// const newCode = await codeService.createCode({
//   linguagem: 'JavaScript',
//   descricao: 'Função para validar email',
//   codigo: 'const validateEmail = (email) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);'
// });

// // 4. Atualizar código
// const updated = await codeService.updateCode(1, {
//   linguagem: 'JavaScript',
//   descricao: 'Função atualizada',
//   codigo: 'const validateEmail = ...'
// });

// // 5. Deletar código
// await codeService.deleteCode(1);

// // 6. Buscar códigos
// const searchResults = await codeService.searchCodes('javascript', 0, 10);

// // 7. Busca local (fallback)
// const localResults = await codeService.searchCodesLocal('react', 0, 10);