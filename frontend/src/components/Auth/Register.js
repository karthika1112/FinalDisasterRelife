import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '',          color: '' },
    { label: 'Weak',      color: '#dc3545' },
    { label: 'Fair',      color: '#fd7e14' },
    { label: 'Good',      color: '#ffc107' },
    { label: 'Strong',    color: '#28a745' },
    { label: 'Very Strong', color: '#20c997' },
  ];
  return { score, ...map[score] };
};

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    role: 'user', phone: '', location: '',
  });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError]     = useState('');

  const { register, loading, error, success, clearMessages } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(() => getStrength(form.password), [form.password]);
  const passwordsMatch = form.confirm === '' || form.password === form.confirm;

  const update = (field) => (e) => {
    clearMessages();
    setFormError('');
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setFormError('Passwords do not match');
      return;
    }
    try {
      const { confirm, ...payload } = form;
      await register(payload);
      navigate('/disasters');
    } catch { /* error shown via context */ }
  };

  const displayError = formError || error;

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-icon">🛡️</div>
        <h2>Create Account</h2>
        <p>Join the disaster relief network</p>

        {displayError && <div className="alert alert-error">{displayError}</div>}
        {success      && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" required value={form.name} onChange={update('name')} placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={update('role')}>
                <option value="user">👤 User</option>
                <option value="volunteer">🤝 Volunteer</option>
                <option value="admin">🛡️ Admin</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required value={form.email} onChange={update('email')} placeholder="your@email.com" autoComplete="email" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <input
                type={showPass ? 'text' : 'password'} required minLength={6}
                value={form.password} onChange={update('password')}
                placeholder="Min 6 characters" autoComplete="new-password"
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Password strength meter */}
            {form.password && (
              <div className="strength-meter">
                <div className="strength-bars">
                  {[1,2,3,4,5].map((n) => (
                    <div
                      key={n}
                      className="strength-bar"
                      style={{ background: n <= strength.score ? strength.color : '#e9ecef' }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-icon-wrap">
              <input
                type={showConfirm ? 'text' : 'password'} required
                value={form.confirm} onChange={update('confirm')}
                placeholder="Re-enter password" autoComplete="new-password"
                style={{ borderColor: !passwordsMatch ? '#dc3545' : undefined }}
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
            {!passwordsMatch && (
              <span className="field-error">Passwords do not match</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone <span className="optional">(optional)</span></label>
              <input type="tel" value={form.phone} onChange={update('phone')} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="form-group">
              <label>Location <span className="optional">(optional)</span></label>
              <input type="text" value={form.location} onChange={update('location')} placeholder="City, Country" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading || !passwordsMatch}>
            {loading ? <span className="btn-spinner" /> : null}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <p className="auth-link">Already have an account? <Link to="/login">Sign In</Link></p>

      </div>
    </div>
  );
};

export default Register;
