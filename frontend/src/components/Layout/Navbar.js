import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={close}>
        🚨 DisasterRelief
      </Link>

      {/* Hamburger — mobile only */}
      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      <div className={`navbar-links ${menuOpen ? 'mobile-open' : ''}`}>
        <NavLink to="/disasters" onClick={close}>Disasters</NavLink>
        <NavLink to="/contact" onClick={close}>Contact</NavLink>
        {user && <NavLink to="/relief" onClick={close}>Relief</NavLink>}
        {(user?.role === 'volunteer' || user?.role === 'admin') && (
          <NavLink to="/volunteer" onClick={close}>Volunteer</NavLink>
        )}
        {user?.role === 'admin' && (
          <NavLink to="/admin" onClick={close}>Admin</NavLink>
        )}

        <div className="navbar-auth">
          {user ? (
            <>
              <span className="user-badge">{user.role}</span>
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="btn btn-outline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" onClick={close}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={close}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
