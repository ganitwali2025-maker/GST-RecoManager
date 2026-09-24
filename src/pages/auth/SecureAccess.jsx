import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function SecureAccess() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Secure access password is required');
      return;
    }
    // Proceeding to login page per flow requirements
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome to GST RecoManager</h1>
          <p className="auth-subtitle">Enter your secure access credentials</p>
        </div>

        <form onSubmit={handleContinue} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label>Secure Password</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                className="ctrl auth-input"
                placeholder="Enter secure workspace password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                className="icon-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn primary auth-btn">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
