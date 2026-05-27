import React, { useState } from 'react';
import api from '../services/api';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.login(username.trim(), password.trim());
      // Handle response.token or response if the backend returned the token object
      const token = response?.token || response?.data?.token || (typeof response === 'string' ? response : null);
      
      if (token) {
        localStorage.setItem("token", token);
        onLoginSuccess(token);
      } else {
        setError('Failed to authenticate. No token returned from server.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid username or password.');
      } else if (!err.response) {
        setError('Server is unreachable. Please verify that the backend is running.');
      } else {
        setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-glow-bg"></div>
      <div className="glass-card login-card animate-fade-in">
        <div className="login-header">
          <div className="login-badge">
            <span className="lock-icon">🔒</span> Secure Teacher Portal
          </div>
          <h2>Gradebook Sign In</h2>
          <p>Access and manage student records</p>
        </div>

        <form onSubmit={handleSubmit} className="student-form login-form">
          {error && (
            <div className="error-banner animate-fade-in">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{error}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={loading}
                className={error && !username ? 'input-error' : ''}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">🔑</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
                className={error && !password ? 'input-error' : ''}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner">⏳</span> Authenticating...
              </>
            ) : (
              <>
                <span>Sign In</span> 🚀
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="hint-box">
            <div className="hint-header">🔑 Teacher Credentials</div>
            <div className="hint-body">
              <div>Username: <code className="selectable-code">teacher</code></div>
              <div>Password: <code className="selectable-code">password</code></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
