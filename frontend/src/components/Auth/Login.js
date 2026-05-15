import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading, error, success, clearMessages } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Redirect back to the page the user tried to visit before being sent to /login
  const from = location.state?.from || null;

  const handleChange = (field) => (e) => {
    clearMessages();
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form);
      const dest = from || (user.role === 'admin' ? '/admin' : user.role === 'volunteer' ? '/volunteer' : '/disasters');
      navigate(dest, { replace: true });
    } catch { /* error shown via context */ }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-icon">🔐</div>
        <h2>Welcome Back</h2>
        <p>Sign in to your account</p>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email" required autoComplete="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <input
                type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Enter your password"
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Create one free</Link>
        </p>
        <p className="auth-link" style={{ marginTop: '0.4rem' }}>
          <Link to="/contact" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Need help? Contact support
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
