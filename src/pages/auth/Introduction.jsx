import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, X, ShieldCheck, FileText, CloudUpload, BarChart2, Zap, Cloud, Headset, User, Lock, LogIn, Shield, Bell, HelpCircle, ChevronDown, Home, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Introduction() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!userId || !password) {
      setError('User ID and Password are required');
      return;
    }

    setLoading(true);
    const res = await login(userId, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="landing-page new-layout">
      {/* Decorative Corner Shapes */}
      <div className="landing-shape shape-top-right"></div>
      <div className="landing-shape shape-bottom-left"></div>

      <header className="landing-header">
        <div className="landing-logo-group">
          <div className="landing-logo-icon">G</div>
          <div className="landing-logo-text">
            <div className="title">GST-RecoManager</div>
            <div className="sub">Smart Accounting • Compliant India • Better Business</div>
          </div>
        </div>
        <nav className="landing-nav">
          <a href="#" className="nav-link active"><Home size={16} /> Home</a>
          <a href="#" className="nav-link">GST Reconciliation <ChevronDown size={14} /></a>
          <a href="#" className="nav-link">ITC Management</a>
          <a href="#" className="nav-link">GSTR-2B <ChevronDown size={14} /></a>
          <a href="#" className="nav-link">RCM</a>
          <a href="#" className="nav-link"><FileText size={16} /> Reports <ChevronDown size={14} /></a>
          <button className="nav-btn-green" onClick={() => document.getElementById('userIdInput')?.focus()}>
            Let's Start <ArrowRight size={16} />
          </button>
        </nav>
      </header>

      <main className="landing-main-3col">
        {/* Column 1: Text & Features */}
        <div className="landing-col-left">
          <div className="landing-pill">
            <ShieldCheck size={16} className="icon"/> Professional GST & TDS Solution <span className="divider">|</span> 100% Compliant <span className="divider">|</span> Secure <span className="divider">|</span> Reliable
          </div>
          <h1 className="landing-h1">Welcome to <br/><span className="text-green">Your GST & TDS Workspace</span></h1>
          <p className="landing-p">
            Manage • Reconcile • Comply &nbsp;|&nbsp; Everything You Need in One Place
          </p>
          
          <div className="landing-features-grid">
            <div className="feat-card">
              <div className="feat-icon-wrapper bg-green-light">
                <ShieldCheck size={20} className="text-green"/>
              </div>
              <div className="feat-title">Accurate<br/>Reconciliation</div>
              <div className="feat-desc">Match your books<br/>with GSTR-2B</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon-wrapper bg-orange-light">
                <FileText size={20} className="text-orange"/>
              </div>
              <div className="feat-title">ITC<br/>Management</div>
              <div className="feat-desc">Track & manage<br/>your ITC status</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon-wrapper bg-purple-light">
                <CloudUpload size={20} className="text-purple"/>
              </div>
              <div className="feat-title">GSTR-2B<br/>Tracking</div>
              <div className="feat-desc">Monitor 2B data<br/>in real-time</div>
            </div>
            <div className="feat-card">
              <div className="feat-icon-wrapper bg-blue-light">
                <BarChart2 size={20} className="text-blue"/>
              </div>
              <div className="feat-title">Detailed<br/>Reports</div>
              <div className="feat-desc">Get insights with<br/>powerful reports</div>
            </div>
          </div>

          <div className="landing-cta-row">
            <div className="cta-trust" style={{ marginTop: '20px' }}>
              <ShieldCheck size={18} className="text-green"/> Secure • Reliable • Professional
            </div>
          </div>
        </div>

        {/* Column 2: Login Card */}
        <div className="landing-col-right">
          <div className="login-card-permanent" style={{ maxWidth: '100%', animation: 'fadeIn 0.4s ease-out' }}>
            <div className="auth-header-new">
              <h2>Sign <span>In</span></h2>
              <p>Enter your credentials to access the workspace</p>
            </div>

            <form onSubmit={handleLogin} className="auth-form-new">
              {error && <div className="auth-error">{error}</div>}
              
              <div className="form-group-new">
                <label>User ID / Email</label>
                <div className="input-with-left-icon">
                  <User className="left-icon" size={18} />
                  <input
                    id="userIdInput"
                    type="text"
                    placeholder="Enter admin or email"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-new">
                <label>Password</label>
                <div className="input-with-left-icon input-with-right-icon">
                  <Lock className="left-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    className="right-icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-options-new">
                <label className="checkbox-label-new">
                  <input type="checkbox" /> Remember Me
                </label>
                <a href="#" className="forgot-link-new">Forgot Password?</a>
              </div>

              <button type="submit" className="auth-btn-new dark" disabled={loading}>
                <LogIn size={18} /> {loading ? 'Authenticating...' : 'LOGIN TO WORKSPACE'}
              </button>

              <div className="auth-divider-new">
                <span>Secure Access</span>
              </div>
              
              <div className="auth-secure-text-new">
                <ShieldCheck size={14} /> Your data is safe with us
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
