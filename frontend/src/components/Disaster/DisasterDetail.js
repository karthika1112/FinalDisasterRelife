import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDisaster, addDisasterUpdate, updateDisaster, deleteDisaster, imgUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SEV_COLOR  = { low:'#28a745', medium:'#ffc107', high:'#fd7e14', critical:'#dc3545' };
const TYPE_ICON  = { flood:'🌊', earthquake:'🌍', fire:'🔥', cyclone:'🌀', landslide:'⛰️', drought:'☀️', other:'⚠️' };

const DisasterDetail = () => {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [disaster,   setDisaster]   = useState(null);
  const [updateMsg,  setUpdateMsg]  = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [posting,    setPosting]    = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => {
    setLoading(true);
    getDisaster(id)
      .then(({ data }) => setDisaster(data))
      .catch(() => setError('Disaster not found or failed to load.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!updateMsg.trim()) return;
    setPosting(true);
    try {
      const { data } = await addDisasterUpdate(id, { message: updateMsg });
      setDisaster(data);
      setUpdateMsg('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post update');
    } finally {
      setPosting(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const { data } = await updateDisaster(id, { status });
      setDisaster(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this disaster report?')) return;
    setDeleting(true);
    try {
      await deleteDisaster(id);
      navigate('/disasters');
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      setDeleting(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) return (
    <div className="page-container">
      <div className="skeleton-detail">
        <div className="skeleton-img-lg" />
        <div className="skeleton-lines">
          <div className="skeleton-line w-60" />
          <div className="skeleton-line w-40" />
          <div className="skeleton-line w-80" />
          <div className="skeleton-line w-80" />
          <div className="skeleton-line w-50" />
        </div>
      </div>
    </div>
  );

  if (error && !disaster) return (
    <div className="page-container">
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/disasters')} className="btn btn-primary" style={{ marginTop:'1rem' }}>
          ← Back to Disasters
        </button>
      </div>
    </div>
  );

  const canManage = user?.role === 'admin' || user?.role === 'volunteer';
  const sevColor  = SEV_COLOR[disaster.severity] || '#6c757d';
  const typeIcon  = TYPE_ICON[disaster.disasterType] || '⚠️';

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn btn-outline back-btn">← Back</button>

      {error && <div className="alert alert-error" style={{ marginBottom:'1rem' }}>{error}</div>}

      <div className="detail-card">

        {/* ── Hero image ── */}
        {disaster.image
          ? <img src={imgUrl(disaster.image)} alt={disaster.title} className="detail-img" />
          : (
            <div className="detail-img-placeholder">
              <span>{typeIcon}</span>
            </div>
          )
        }

        {/* ── Header ── */}
        <div className="detail-header">
          <div>
            <h1>{disaster.title}</h1>
            <p className="location">📍 {disaster.location}</p>
            <p className="detail-date">
              🕐 Reported on {new Date(disaster.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
          <div className="detail-tags">
            <span className="tag">{typeIcon} {disaster.disasterType}</span>
            <span
              className="tag"
              style={{ background: sevColor + '22', color: sevColor, border: `1px solid ${sevColor}` }}
            >
              {disaster.severity}
            </span>
            <span className={`status-badge status-${disaster.status}`}>{disaster.status}</span>
          </div>
        </div>

        {/* ── Description ── */}
        <p className="detail-description">{disaster.description}</p>

        {/* ── Info grid ── */}
        <div className="detail-info-grid">
          <div className="detail-info-item">
            <span className="detail-info-label">Reported By</span>
            <span className="detail-info-value">👤 {disaster.reportedBy?.name}</span>
            <span className="detail-info-sub">{disaster.reportedBy?.email}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">Volunteers Assigned</span>
            <span className="detail-info-value">👥 {disaster.assignedVolunteers?.length || 0}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">Rescue Updates</span>
            <span className="detail-info-value">📋 {disaster.updates?.length || 0}</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">Last Updated</span>
            <span className="detail-info-value">
              {new Date(disaster.updatedAt).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>

        {/* ── Admin / Volunteer actions ── */}
        {canManage && (
          <div className="action-bar">
            <div className="action-bar-left">
              <label className="action-label">Update Status:</label>
              <select
                value={disaster.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="status-select"
              >
                <option value="reported">🟡 Reported</option>
                <option value="active">🔴 Active</option>
                <option value="resolved">🟢 Resolved</option>
              </select>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : '🗑️ Delete Report'}
              </button>
            )}
          </div>
        )}

        {/* ── Rescue updates ── */}
        <div className="updates-section">
          <h3>📋 Rescue Updates
            <span className="updates-count">{disaster.updates?.length || 0}</span>
          </h3>

          <div className="updates-list">
            {disaster.updates?.length === 0 && (
              <p className="no-updates">No updates posted yet.</p>
            )}
            {disaster.updates?.map((u, i) => (
              <div key={i} className="update-item">
                <div className="update-avatar">{u.updatedBy?.name?.[0]?.toUpperCase() || '?'}</div>
                <div className="update-body">
                  <p>{u.message}</p>
                  <small>
                    <strong>{u.updatedBy?.name || 'Unknown'}</strong>
                    {' · '}
                    {new Date(u.updatedAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </small>
                </div>
              </div>
            ))}
          </div>

          {canManage && (
            <form onSubmit={handleAddUpdate} className="update-form">
              <input
                type="text"
                value={updateMsg}
                onChange={(e) => setUpdateMsg(e.target.value)}
                placeholder="Post a rescue update..."
                maxLength={500}
              />
              <button type="submit" className="btn btn-primary" disabled={posting || !updateMsg.trim()}>
                {posting ? '…' : 'Post'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default DisasterDetail;
