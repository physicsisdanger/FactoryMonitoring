import React, { useState } from 'react';
import { authApi, setAuthToken } from '../services/api';
import useAuthStore from '../store/authStore';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    invitation_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const setUser = useAuthStore((state) => state.setUser);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let response;
      if (isLogin) {
        response = await authApi.login({
          username: formData.username,
          password: formData.password
        });
      } else {
        response = await authApi.register({
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
          invitation_code: formData.invitation_code
        });
      }
      
      setAuthToken(response.access_token);
      setUser(response.user);
      onSuccess(response.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isLogin ? '🔐 Вход в систему' : '📝 Регистрация'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                background: '#fef2f2',
                color: '#ef4444',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px'
              }}>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label>👤 Имя пользователя</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Введите имя пользователя"
              />
            </div>
            
            {!isLogin && (
              <>
                <div className="form-group">
                  <label>📧 Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="form-group">
                  <label>👤 Полное имя</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Иван Иванов"
                  />
                </div>
                
                <div className="form-group">
                  <label>🎫 Код приглашения</label>
                  <input
                    type="text"
                    name="invitation_code"
                    value={formData.invitation_code}
                    onChange={handleChange}
                    required
                    placeholder="XXXX-XXXX-XXXX"
                  />
                </div>
              </>
            )}
            
            <div className="form-group">
              <label>🔒 Пароль</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
            </button>
          </div>
        </form>
        
        <div className="auth-switch">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({
                username: '',
                email: '',
                full_name: '',
                password: '',
                invitation_code: ''
              });
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '13px',
              padding: '12px 24px',
              width: '100%',
              borderTop: '1px solid #e2e8f0'
            }}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </button>
        </div>
      </div>
      
      <style>{`
        .auth-modal {
          max-width: 450px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #334155;
        }
        
        .form-group input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
      `}</style>
    </div>
  );
};

export default AuthModal;