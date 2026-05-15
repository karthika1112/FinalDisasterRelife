import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">

      <div className="footer-brand">
        <span className="footer-logo">🚨 DisasterRelief</span>
        <p>Coordinating emergency response and connecting communities when it matters most.</p>
      </div>

      <div className="footer-links">
        <div className="footer-col">
          <h4>Platform</h4>
          <Link to="/disasters">View Disasters</Link>
          <Link to="/disasters/report">Report Disaster</Link>
          <Link to="/relief">Relief Requests</Link>
          <Link to="/volunteer">Volunteer</Link>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/admin">Admin Panel</Link>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <Link to="/contact">Contact Us</Link>
          <a href="https://www.ndma.gov.in" target="_blank" rel="noreferrer">NDMA India</a>
          <a href="https://www.ifrc.org" target="_blank" rel="noreferrer">Red Cross</a>
        </div>
      </div>

    </div>
    <div className="footer-bottom">
      <p>© {new Date().getFullYear()} Smart Disaster Relief Management System. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
