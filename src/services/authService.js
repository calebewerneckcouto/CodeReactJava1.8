// services/authService.js
import { api } from '../utils/api';

export const authService = {
  async login(credentials) {
    try {
      const loginURL = `${api.baseURL}/login`;
      console.log('🔐 Tentando login:', { url: loginURL, email: credentials.email });

      const response = await fetch(loginURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: credentials.email,
          senha: credentials.password
        })
      });

      console.log('📡 Response status:', response.status);
      
      // DEBUG: Mostra todos os headers
      console.log('📋 Response headers:');
      response.headers.forEach((value, key) => {
        console.log(`   ${key}: ${value}`);
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // DEBUG: Verifica a resposta completa
      const responseText = await response.text();
      console.log('📨 Resposta COMPLETA do servidor:', responseText);

      // Tenta parsear como JSON
      let authResponse;
      try {
        authResponse = JSON.parse(responseText);
        console.log('✅ Resposta parseada:', authResponse);
      } catch (parseError) {
        console.log('⚠️ Resposta não é JSON, é texto puro:', responseText);
        // Se não é JSON, talvez seja o token direto
        if (responseText && responseText.includes('.')) {
          console.log('✅ Possível JWT detectado (contém pontos)');
          authResponse = { token: responseText };
        } else {
          throw new Error('Resposta não é JSON válido nem JWT');
        }
      }

      const token = this.extractToken(authResponse, response);
      console.log('🔐 Token extraído:', token ? `${token.substring(0, 20)}...` : 'NULO');
      
      if (token) {
        // VERIFICA SE É JWT VÁLIDO
        if (token.split('.').length !== 3) {
          console.error('❌ Token NÃO é JWT válido. Partes:', token.split('.').length);
          console.error('❌ Token completo:', token);
          throw new Error('Token recebido não é um JWT válido');
        }
        
        localStorage.setItem("auth_token", token);
        console.log('✅ JWT válido salvo com sucesso!');
        return { token: token, type: 'Bearer' };
      }

      throw new Error('Token não encontrado na resposta');
      
    } catch (error) {
      console.error("❌ Erro de autenticação:", error);
      throw error;
    }
  },

  extractToken(authResponse, response) {
    // 1. Tenta no corpo da resposta (diferentes formatos)
    if (authResponse.token) return authResponse.token;
    if (authResponse.access_token) return authResponse.access_token;
    if (authResponse.jwt) return authResponse.jwt;
    if (authResponse.accessToken) return authResponse.accessToken;
    
    // 2. Token como string direta
    if (typeof authResponse === 'string' && authResponse.length > 100) {
      return authResponse;
    }

    // 3. Tenta em estruturas aninhadas
    if (authResponse.data) {
      if (authResponse.data.token) return authResponse.data.token;
      if (authResponse.data.access_token) return authResponse.data.access_token;
    }

    if (authResponse.result && authResponse.result.token) {
      return authResponse.result.token;
    }

    // 4. Tenta nos headers
    const authHeader = response.headers.get('Authorization');
    if (authHeader) {
      return authHeader.replace(/Bearer\s+/i, '');
    }

    return null;
  },

  async refreshToken() {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error('Nenhum token disponível para refresh');
    }

    try {
      const response = await fetch(`${api.baseURL}/refresh`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const newToken = await response.json();
        localStorage.setItem("auth_token", newToken.token || newToken.access_token);
        this.setTokenIssuedTime();
        return newToken;
      } else {
        throw new Error('Falha ao renovar token');
      }
    } catch (error) {
      console.error('❌ Erro no refresh token:', error);
      this.logout();
      throw error;
    }
  },

  logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token_issued_at");
    console.log('✅ Logout realizado');
  },

  isAuthenticated() {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.log('🔐 Nenhum token encontrado');
      return false;
    }

    try {
      // Verifica se é um JWT válido (tem 3 partes)
      if (token.split('.').length !== 3) {
        console.log('🔐 Token não é um JWT válido');
        return false;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const isValid = payload.exp > now;
      
      console.log('🔐 Token válido:', isValid);
      return isValid;
    } catch (error) {
      console.error('🔐 Erro ao verificar token:', error);
      return false;
    }
  },

  getAuthHeader() {
    const token = localStorage.getItem("auth_token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
  },

  setTokenIssuedTime() {
    localStorage.setItem("token_issued_at", Date.now().toString());
  },

  getTokenPayload() {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;
    
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('❌ Erro ao decodificar token:', error);
      return null;
    }
  },

  // Método para debug - testa diferentes endpoints
  async testEndpoints(credentials) {
    const baseURL = api.baseURL;
    const endpoints = [
      '/login',
      '/api/login', 
      '/auth/login',
      '/api/auth/login',
      '/authenticate'
    ];

    console.log('🧪 Testando endpoints de autenticação...');
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔍 Testando: ${endpoint}`);
        
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            login: credentials.email,
            senha: credentials.password
          })
        });

        console.log(`📡 Status: ${response.status}`);
        
        if (response.ok) {
          const result = await response.text();
          console.log(`✅ ENDPOINT FUNCIONAL: ${endpoint}`, result.substring(0, 100));
          return endpoint;
        }
      } catch (error) {
        console.log(`❌ ${endpoint} erro: ${error.message}`);
      }
    }
    
    console.log('❌ Nenhum endpoint de autenticação funcionou');
    return null;
  }
};