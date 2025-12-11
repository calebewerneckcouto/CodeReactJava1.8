import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Main from './pages/Main';
import CreateCode from './pages/CreateCode';
import { authService } from './services/authService';
import './App.css';
import './index.css';

function App() {
  return (
    <Router basename="/code/">  {/* 🔥 ADICIONE ESTA LINHA */}
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/main" 
            element={
              authService.isAuthenticated() ? <Main /> : <Navigate to="/" />
            } 
          />
          <Route 
            path="/create" 
            element={
              authService.isAuthenticated() ? <CreateCode /> : <Navigate to="/" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;