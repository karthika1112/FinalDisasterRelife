import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDisaster } from '../../services/api';

const TYPES     = ['flood','earthquake','fire','cyclone','landslide','drought','other'];
const SEVERITIES = ['low','medium','high','critical'];
const SEV_META  = { low:'#28a745', medium:'#ffc107', high:'#fd7e14', critical:'#dc3545' };
const MAX_DESC  = 1000;

const ReportDisaster = () => {
  const navigate  = useNavigate();
  const fileRef   = useRef();

  const [form, setForm] = useState({
    title: '', description: '', location: '',
    disasterType: 'flood', severity: 'medium',
  });
  const [image,    setImage]   = useState(null);
  const [preview,  setPreview] = useState(null);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState('');
  const [success,  setSuccess] = useState(false);
  const [dragOver, setDragOver]= useState(false);

  const update = (field) => (e) => {
    setError('');
    setForm({ ...form, [field]: e.target.value });
  };

  const handleImage = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImage(e.dataTransfer.files[0]);
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await createDisaster(fd);
      setSuccess(true);
      setTimeout(() => navigate('/disasters'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="page-container">
      <div className="success-screen">
        <div className="success-icon">✅</div>
        <h2>Disaster Reported!</h2>
        <p>Your report has been submitted. Redirecting to disasters list...</p>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="report-layout">

        {/* ── Form ── */}
        <div className="form-card">
          <div className="form-card-header">
            <span className="form-card-icon">🚨</span>
            <div>
              <h2>Report a Disaster</h2>
              <p>Provide accurate details to help coordinate relief efforts.</p>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label>Title <span className="req">*</span></label>
              <input
                type="text" required maxLength={120}
                value={form.title} onChange={update('title')}
                placeholder="e.g. Severe flooding in Chennai"
              />
            </div>

            {/* Type + Severity */}
            <div className="form-row">
              <div className="form-group">
                <label>Disaster Type <span className="req">*</span></label>
                <select value={form.disasterType} onChange={update('disasterType')}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === 'flood' ? '🌊' : t === 'earthquake' ? '🌍' : t === 'fire' ? '🔥'
                        : t === 'cyclone' ? '🌀' : t === 'landslide' ? '⛰️' : t === 'drought' ? '☀️' : '⚠️'}
                      {' '}{t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Severity <span className="req">*</span></label>
                <select
                  value={form.severity} onChange={update('severity')}
                  style={{ borderColor: SEV_META[form.severity], color: SEV_META[form.severity] }}
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <div className="severity-bar">
                  {SEVERITIES.map((s) => (
                    <div
                      key={s}
                      className="severity-seg"
                      style={{
                        background: SEVERITIES.indexOf(s) <= SEVERITIES.indexOf(form.severity)
                          ? SEV_META[form.severity] : '#e9ecef',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="form-group">
              <label>Location <span className="req">*</span></label>
              <input
                type="text" required
                value={form.location} onChange={update('location')}
                placeholder="City, District, State"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>
                Description <span className="req">*</span>
                <span className="char-count">{form.description.length}/{MAX_DESC}</span>
              </label>
              <textarea
                required rows={5} maxLength={MAX_DESC}
                value={form.description} onChange={update('description')}
                placeholder="Describe what happened, affected areas, number of people impacted..."
              />
            </div>

            {/* Image upload */}
            <div className="form-group">
              <label>Photo Evidence <span className="optional">(optional, max 5 MB)</span></label>

              {preview ? (
                <div className="img-preview-wrap">
                  <img src={preview} alt="preview" className="img-preview" />
                  <button type="button" className="img-remove-btn" onClick={removeImage}>✕ Remove</button>
                </div>
              ) : (
                <div
                  className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                  onClick={() => fileRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <span className="drop-icon">📷</span>
                  <p>Drag & drop or <strong>click to browse</strong></p>
                  <small>JPG, PNG, WEBP</small>
                </div>
              )}

              <input
                ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => handleImage(e.target.files[0])}
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="btn-spinner" /> Submitting...</> : '🚨 Submit Report'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Side tips ── */}
        <div className="report-tips">
          <h4>📋 Reporting Tips</h4>
          <ul>
            <li>Be as specific as possible about the location</li>
            <li>Include the number of people affected if known</li>
            <li>Mention any immediate dangers or hazards</li>
            <li>Upload a clear photo if available</li>
            <li>Select the correct severity level</li>
          </ul>
          <div className="severity-guide">
            <h4>Severity Guide</h4>
            {[
              { level: 'Low',      color: '#28a745', desc: 'Minor impact, no immediate danger' },
              { level: 'Medium',   color: '#ffc107', desc: 'Moderate impact, some risk' },
              { level: 'High',     color: '#fd7e14', desc: 'Serious impact, evacuation may be needed' },
              { level: 'Critical', color: '#dc3545', desc: 'Life-threatening, immediate response required' },
            ].map((s) => (
              <div key={s.level} className="sev-guide-item">
                <span className="sev-dot" style={{ background: s.color }} />
                <div>
                  <strong style={{ color: s.color }}>{s.level}</strong>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportDisaster;
