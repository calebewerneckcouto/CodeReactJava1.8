import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import ProfileImage from '../components/ProfileImage';
import '../styles/Login.css';
import '../styles/Buttons.css';
import '../styles/Alerts.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [alert, setAlert] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert('');
    setIsLoading(true);

    try {
      const tokenData = await authService.login(credentials);
      authService.setTokenIssuedTime();
      console.log('Login successful');
      navigate('/main');
    } catch (error) {
      console.error('Login error:', error);
      setAlert('Erro ao fazer login: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <ProfileImage size="medium" />
          <h1 className="login-title">CWCDEV Login</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email ou Usuário</label>
            <input
              type="text"
              name="email"
              className="form-input"
              placeholder="seu@email.com"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Sua senha"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {alert && (
          <div className="login-alert">
            {alert}
          </div>
        )}

        <div className="login-debug">
          <h4>Informações de Debug</h4>
          <div>Endpoint: {import.meta.env.PROD ? 'https://cwc3d.net/oauth/token' : 'http://localhost:8080/oauth/token'}</div>
          <div>Client: {authService.CLIENT_ID}</div>
        </div>
      </div>
    </div>
  );
};

export default Login;