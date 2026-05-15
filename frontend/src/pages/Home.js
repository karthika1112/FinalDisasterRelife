import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDisasters } from '../services/api';

const STEPS = [
  { icon: '📝', title: 'Report', desc: 'Anyone can report a disaster with location, type, severity and photos.' },
  { icon: '🔔', title: 'Alert', desc: 'Admins and volunteers are notified instantly and the event goes live.' },
  { icon: '🚁', title: 'Respond', desc: 'Volunteers are assigned to zones and relief resources are dispatched.' },
  { icon: '✅', title: 'Resolve', desc: 'Status is updated in real-time until the disaster is marked resolved.' },
];

const FEATURES = [
  { icon: '🚨', title: 'Disaster Reporting', desc: 'Report with location, type, severity and images for rapid coordination.' },
  { icon: '🤝', title: 'Relief Requests', desc: 'Request food, shelter and medical aid. Track status in real-time.' },
  { icon: '👥', title: 'Volunteer Network', desc: 'Connect skilled volunteers with disaster zones efficiently.' },
  { icon: '📊', title: 'Admin Analytics', desc: 'Full dashboard for managing users, requests and operations.' },
];

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0 });

  useEffect(() => {
    getDisasters()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        setStats({
          total: list.length,
          active: list.filter((d) => d.status === 'active').length,
          resolved: list.filter((d) => d.status === 'resolved').length,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">🌍 Emergency Response Platform</span>
          <h1>Smart Disaster Relief Management System</h1>
          <p>Coordinating emergency response, connecting volunteers, and delivering aid where it's needed most.</p>
          <div className="hero-actions">
            <Link to="/disasters" className="btn btn-primary btn-lg">View Active Disasters</Link>
            {!user
              ? <Link to="/register" className="btn btn-outline btn-lg">Join as Volunteer</Link>
              : <Link to="/disasters/report" className="btn btn-outline btn-lg">Report Disaster</Link>
            }
          </div>
        </div>
      </section>

      {/* ── Live Stats ── */}
      <section className="home-stats">
        <div className="home-stat">
          <span className="home-stat-num">{stats.total}</span>
          <span className="home-stat-label">Total Reports</span>
        </div>
        <div className="home-stat">
          <span className="home-stat-num" style={{ color: '#dc3545' }}>{stats.active}</span>
          <span className="home-stat-label">Active Now</span>
        </div>
        <div className="home-stat">
          <span className="home-stat-num" style={{ color: '#28a745' }}>{stats.resolved}</span>
          <span className="home-stat-label">Resolved</span>
        </div>
        <div className="home-stat">
          <span className="home-stat-num">24/7</span>
          <span className="home-stat-label">Monitoring</span>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── How It Works ── */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={s.title} className="step-card">
              <div className="step-number">{i + 1}</div>
              <span className="step-icon">{s.icon}</span>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      {!user && (
        <section className="cta-section">
          <h2>Ready to make a difference?</h2>
          <p>Join thousands of volunteers and responders on the platform.</p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
            <Link to="/contact" className="btn btn-outline btn-lg">Contact Us</Link>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
