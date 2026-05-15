import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getDisasters, deleteDisaster, imgUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SEV_COLOR = { low:'#28a745', medium:'#ffc107', high:'#fd7e14', critical:'#dc3545' };
const TYPE_ICON = { flood:'🌊', earthquake:'🌍', fire:'🔥', cyclone:'🌀', landslide:'⛰️', drought:'☀️', other:'⚠️' };
const TYPES     = ['flood','earthquake','fire','cyclone','landslide','drought','other'];

const DisasterList = () => {
  const { user } = useAuth();
  const [disasters, setDisasters] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filters,   setFilters]   = useState({ status:'', type:'', severity:'' });
  const [deleting,  setDeleting]  = useState(null);

  const fetchDisasters = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await getDisasters(params);
      setDisasters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchDisasters(); }, [fetchDisasters]);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Delete this disaster report?')) return;
    setDeleting(id);
    try {
      await deleteDisaster(id);
      setDisasters((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const setFilter = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  // Client-side search on title + location
  const visible = disasters.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.title.toLowerCase().includes(q) || d.location.toLowerCase().includes(q);
  });

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="page-header">
        <h1>Disaster Reports</h1>
        {user && (
          <Link to="/disasters/report" className="btn btn-primary">🚨 Report Disaster</Link>
        )}
      </div>

      {/* ── Search + Filters ── */}
      <div className="search-filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text" placeholder="Search by title or location..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className="filter-bar">
          <select value={filters.status} onChange={setFilter('status')}>
            <option value="">All Status</option>
            <option value="reported">Reported</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={filters.type} onChange={setFilter('type')}>
            <option value="">All Types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_ICON[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <select value={filters.severity} onChange={setFilter('severity')}>
            <option value="">All Severity</option>
            {['low','medium','high','critical'].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          {(filters.status || filters.type || filters.severity || search) && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => { setFilters({ status:'', type:'', severity:'' }); setSearch(''); }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <p className="results-count">
          Showing <strong>{visible.length}</strong> of <strong>{disasters.length}</strong> reports
        </p>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="card-grid">
          {[1,2,3,4,5,6].map((n) => <div key={n} className="skeleton-card" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No disasters found</h3>
          <p>{search || filters.status || filters.type || filters.severity
            ? 'Try adjusting your filters or search term.'
            : 'No disasters have been reported yet.'}
          </p>
          {user && <Link to="/disasters/report" className="btn btn-primary" style={{ marginTop:'1rem' }}>Report First Disaster</Link>}
        </div>
      ) : (
        <div className="card-grid">
          {visible.map((d) => (
            <div key={d._id} className="disaster-card">
              {/* Image */}
              {d.image
                ? <img src={imgUrl(d.image)} alt={d.title} className="card-img" />
                : <div className="card-img-placeholder">{TYPE_ICON[d.disasterType] || '⚠️'}</div>
              }

              <div className="card-body">
                {/* Tags */}
                <div className="card-tags">
                  <span className="tag">{TYPE_ICON[d.disasterType]} {d.disasterType}</span>
                  <span className="tag sev-tag" style={{ background: SEV_COLOR[d.severity] + '22', color: SEV_COLOR[d.severity], border: `1px solid ${SEV_COLOR[d.severity]}` }}>
                    {d.severity}
                  </span>
                  <span className={`status-badge status-${d.status}`}>{d.status}</span>
                </div>

                <h3>{d.title}</h3>
                <p className="location">📍 {d.location}</p>
                <p className="description">
                  {d.description.length > 100 ? d.description.substring(0, 100) + '…' : d.description}
                </p>

                <div className="card-footer">
                  <div className="card-meta">
                    <span>👤 {d.reportedBy?.name}</span>
                    <span className="card-date">
                      {new Date(d.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                  </div>
                  <div className="card-actions">
                    <Link to={`/disasters/${d._id}`} className="btn btn-sm btn-outline">Details</Link>
                    {user?.role === 'admin' && (
                      <button
                        className="btn btn-sm btn-danger"
                        disabled={deleting === d._id}
                        onClick={(e) => handleDelete(d._id, e)}
                      >
                        {deleting === d._id ? '…' : '🗑️'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisasterList;
