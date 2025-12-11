import { authService } from '../services/authService';

// 🔥 CORREÇÃO: Aponte para o contexto correto da sua API Java
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://cwc3d.net/cwcdev'  // ✅ SEU CONTEXTO JAVA
  : 'http://localhost:8080';

export const api = {
  baseURL: API_BASE_URL,
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    
    // 🔧 CORREÇÃO: Verificar se o token é válido ANTES de enviar
    if (token && token.split('.').length !== 3) {
      console.error('❌ Token JWT inválido detectado!');
      console.error('Token:', token);
      authService.logout();
      // 🔥 CORREÇÃO: Redirecionar para a URL correta do React
      window.location.href = import.meta.env.PROD ? '/reactcode/' : '/';
      throw new Error('Token JWT inválido - por favor faça login novamente');
    }

    // 🔧 CORREÇÃO: Montar headers corretamente
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    // 🔍 DEBUG: Mostra o que está sendo enviado
    console.log('📡 API Request:', {
      method: config.method || 'GET',
      url: url,
      hasToken: !!token,
      authHeader: config.headers.Authorization ? `${config.headers.Authorization.substring(0, 30)}...` : 'SEM TOKEN'
    });

    try {
      const response = await fetch(url, config);
      
      console.log(`✅ Response: ${config.method || 'GET'} ${url} - Status: ${response.status}`);
      
      // Se token expirou (401 Unauthorized)
      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token inválido ou expirado');
        authService.logout();
        // 🔥 CORREÇÃO: Redirecionar para a URL correta do React
        window.location.href = import.meta.env.PROD ? '/reactcode/' : '/';
        return;
      }

      // 🔧 MELHOR TRATAMENTO DE ERRO 500
      if (response.status === 500) {
        let errorMessage = 'Erro interno do servidor';
        try {
          const errorText = await response.text();
          console.error('❌ Erro 500 detalhes:', errorText);
          
          // Tenta extrair a mensagem de erro do HTML
          const match = errorText.match(/<b>Message<\/b>\s*(.+?)<\/p>/);
          if (match) {
            errorMessage = match[1].trim();
          }
        } catch (e) {
          console.error('Erro ao processar resposta 500:', e);
        }
        throw new Error(`Erro no servidor: ${errorMessage}`);
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) errorMessage += ` - ${errorText}`;
        } catch (e) {
          // Ignora erro ao ler resposta
        }
        throw new Error(errorMessage);
      }
      
      return await this.handleResponse(response, options.expectJson);
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  },

  async handleResponse(response, expectJson = true) {
    // Se não esperamos JSON ou a resposta está vazia
    if (!expectJson || response.status === 204) {
      return { success: true, status: response.status };
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (jsonError) {
        console.warn('⚠️ Failed to parse JSON response:', jsonError);
        return { success: true, rawResponse: response };
      }
    }
    
    // Se não é JSON, retorna o texto ou sucesso
    try {
      const text = await response.text();
      return text ? { data: text } : { success: true };
    } catch (textError) {
      return { success: true, status: response.status };
    }
  },

  // Métodos auxiliares
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data 
    });
  },

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data 
    });
  },

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};