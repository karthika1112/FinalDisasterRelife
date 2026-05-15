import { useState } from 'react';

const FAQS = [
  { q: 'How do I report a disaster?', a: 'Register or log in, then click "Report Disaster". Fill in the title, location, type, severity and optionally upload a photo.' },
  { q: 'Who can request relief?', a: 'Any registered user can submit a relief request for food, shelter or medical aid from the Relief Requests page.' },
  { q: 'How do I become a volunteer?', a: 'Register with the Volunteer role, or visit the Volunteer Panel and click "Register as Volunteer" to list your skills.' },
  { q: 'How are volunteers assigned?', a: 'Admins assign available volunteers to active disaster zones from the Admin Dashboard → Assign tab.' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production wire this to an email API (e.g. EmailJS / backend endpoint)
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Have a question or need help? Reach out and we'll respond as soon as possible.</p>
      </div>

      <div className="contact-grid">

        {/* ── Form ── */}
        <div className="form-card">
          <h3>Send a Message</h3>
          {submitted && (
            <div className="alert alert-success">
              ✅ Message sent! We'll get back to you within 24 hours.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" required value={form.name} onChange={update('name')} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" required value={form.email} onChange={update('email')} placeholder="your@email.com" />
              </div>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <select value={form.subject} onChange={update('subject')} required>
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="volunteer">Volunteer Support</option>
                <option value="disaster">Disaster Report Issue</option>
                <option value="relief">Relief Request Help</option>
                <option value="technical">Technical Problem</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea required rows={5} value={form.message} onChange={update('message')} placeholder="Describe your question or issue..." />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Send Message</button>
          </form>
        </div>

        {/* ── Info ── */}
        <div className="contact-info">
          <div className="contact-info-card">
            <h3>Get in Touch</h3>
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <div>
                <strong>Email</strong>
                <p>support@disasterrelief.org</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div>
                <strong>Emergency Hotline</strong>
                <p>1800-XXX-XXXX (Toll Free)</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🕐</span>
              <div>
                <strong>Response Time</strong>
                <p>Within 24 hours on business days</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🌐</span>
              <div>
                <strong>External Resources</strong>
                <a href="https://www.ndma.gov.in" target="_blank" rel="noreferrer">NDMA India →</a>
                <a href="https://www.ifrc.org" target="_blank" rel="noreferrer">Red Cross →</a>
              </div>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="faq-card">
            <h3>Frequently Asked Questions</h3>
            {FAQS.map((faq, i) => (
              <details key={i} className="faq-item">
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
