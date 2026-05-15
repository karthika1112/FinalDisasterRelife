import { useState, useEffect, useCallback } from 'react';
import {
  getAnalytics, getUsers, updateUser, deleteUser,
  adminGetDisasters, adminUpdateDisaster, adminDeleteDisaster,
  adminGetRequests,  adminUpdateRequest,  adminDeleteRequest,
  getVolunteers, assignVolunteer,
} from '../../services/api';

// ── Constants ─────────────────────────────────────────────────
const SEV_COLOR  = { low:'#28a745', medium:'#ffc107', high:'#fd7e14', critical:'#dc3545' };
const TYPE_ICON  = { flood:'🌊', earthquake:'🌍', fire:'🔥', cyclone:'🌀', landslide:'⛰️', drought:'☀️', other:'⚠️' };
const REQ_ICON   = { food:'🍱', shelter:'🏠', medical:'🏥' };
const STATUS_RELIEF = ['pending','approved','rejected','completed'];

const TABS = [
  { id:'analytics',  label:'Analytics',       icon:'📊' },
  { id:'disasters',  label:'Disasters',        icon:'🚨' },
  { id:'requests',   label:'Relief Requests',  icon:'🤝' },
  { id:'users',      label:'Users',            icon:'👥' },
  { id:'assign',     label:'Assign Volunteer', icon:'📌' },
];

// ── Sub-components ────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="admin-stat-card" style={{ borderTop: `4px solid ${color}` }}>
    <div className="admin-stat-icon" style={{ background: color + '18' }}>{icon}</div>
    <div>
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
      {sub && <div className="admin-stat-sub">{sub}</div>}
    </div>
  </div>
);

const BarChart = ({ title, data, total, color }) => (
  <div className="analytics-card">
    <h3>{title}</h3>
    {!data?.length
      ? <p className="no-data">No data yet</p>
      : data.map((d) => (
        <div key={d._id} className="bar-item">
          <span>{d._id}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${total ? (d.count/total)*100 : 0}%`, background: color }} />
          </div>
          <span>{d.count}</span>
        </div>
      ))
    }
  </div>
);

const Toast = ({ msg, type, onClose }) => msg ? (
  <div className={`admin-toast toast-${type}`} onClick={onClose}>{msg} ✕</div>
) : null;

// ── Main Component ────────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab,   setActiveTab]   = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast,       setToast]       = useState({ msg:'', type:'success' });

  const [analytics,  setAnalytics]  = useState(null);
  const [users,      setUsers]      = useState([]);
  const [disasters,  setDisasters]  = useState([]);
  const [requests,   setRequests]   = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  const [loadingTab, setLoadingTab] = useState(false);
  const [assignForm, setAssignForm] = useState({ volunteerId:'', disasterId:'' });

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:'', type:'success' }), 3000);
  };

  // Load analytics once on mount
  useEffect(() => {
    getAnalytics().then(({ data }) => setAnalytics(data)).catch(() => {});
    getVolunteers().then(({ data }) => setVolunteers(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  // Lazy-load tab data
  const loadTab = useCallback(async (tab) => {
    setActiveTab(tab);
    setLoadingTab(true);
    try {
      if (tab === 'users'     && !users.length)
        setUsers((await getUsers()).data ?? []);
      if (tab === 'disasters' && !disasters.length)
        setDisasters((await adminGetDisasters()).data ?? []);
      if (tab === 'requests'  && !requests.length)
        setRequests((await adminGetRequests()).data ?? []);
    } catch { /* already loaded or error */ }
    finally { setLoadingTab(false); }
  }, [users.length, disasters.length, requests.length]);

  // ── Users ──────────────────────────────────────────────────
  const handleRoleChange = async (id, role) => {
    try {
      await updateUser(id, { role });
      setUsers(users.map((u) => u._id === id ? { ...u, role } : u));
      notify('Role updated');
    } catch { notify('Update failed', 'error'); }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await updateUser(id, { isActive: !isActive });
      setUsers(users.map((u) => u._id === id ? { ...u, isActive: !isActive } : u));
      notify(`User ${!isActive ? 'activated' : 'deactivated'}`);
    } catch { notify('Update failed', 'error'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
      notify('User deleted');
    } catch { notify('Delete failed', 'error'); }
  };

  // ── Disasters ──────────────────────────────────────────────
  const handleDisasterStatus = async (id, status) => {
    try {
      const { data } = await adminUpdateDisaster(id, { status });
      setDisasters(disasters.map((d) => d._id === id ? data : d));
      notify('Status updated');
    } catch { notify('Update failed', 'error'); }
  };

  const handleDeleteDisaster = async (id) => {
    if (!window.confirm('Delete this disaster report?')) return;
    try {
      await adminDeleteDisaster(id);
      setDisasters(disasters.filter((d) => d._id !== id));
      notify('Disaster deleted');
    } catch { notify('Delete failed', 'error'); }
  };

  // ── Relief Requests ────────────────────────────────────────
  const handleRequestStatus = async (id, status) => {
    try {
      const { data } = await adminUpdateRequest(id, { status });
      setRequests(requests.map((r) => r._id === id ? data : r));
      notify('Status updated');
    } catch { notify('Update failed', 'error'); }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Delete this relief request?')) return;
    try {
      await adminDeleteRequest(id);
      setRequests(requests.filter((r) => r._id !== id));
      notify('Request deleted');
    } catch { notify('Delete failed', 'error'); }
  };

  // ── Assign Volunteer ───────────────────────────────────────
  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await assignVolunteer(assignForm);
      setAssignForm({ volunteerId:'', disasterId:'' });
      notify('Volunteer assigned successfully!');
    } catch (err) {
      notify(err.response?.data?.message || 'Assignment failed', 'error');
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="admin-layout">

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">🛡️</span>
          {sidebarOpen && <span className="sidebar-title">Admin Panel</span>}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => loadTab(tab.id)}
            >
              <span className="sidebar-icon">{tab.icon}</span>
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <div className="admin-main">
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg:'' })} />

        {/* ── Analytics ── */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="admin-section-title">📊 Overview</h2>
            {!analytics ? (
              <div className="loading">Loading analytics...</div>
            ) : (
              <>
                <div className="admin-stats-grid">
                  <StatCard icon="👥" label="Total Users"      value={analytics.totalUsers}     color="#4361ee" />
                  <StatCard icon="🚨" label="Disasters"        value={analytics.totalDisasters}  color="#dc3545"
                    sub={`${analytics.disastersByStatus?.find(d=>d._id==='active')?.count||0} active`} />
                  <StatCard icon="🤝" label="Relief Requests"  value={analytics.totalRequests}   color="#fd7e14"
                    sub={`${analytics.requestsByStatus?.find(r=>r._id==='pending')?.count||0} pending`} />
                  <StatCard icon="🙋" label="Volunteers"       value={analytics.totalVolunteers} color="#28a745" />
                </div>

                <div className="analytics-grid" style={{ marginTop:'1.5rem' }}>
                  <BarChart title="Disasters by Status" data={analytics.disastersByStatus}
                    total={analytics.totalDisasters} color="#4361ee" />
                  <BarChart title="Disasters by Type"   data={analytics.disastersByType}
                    total={analytics.totalDisasters} color="#dc3545" />
                  <BarChart title="Requests by Type"    data={analytics.requestsByType}
                    total={analytics.totalRequests}  color="#fd7e14" />
                  <BarChart title="Requests by Status"  data={analytics.requestsByStatus}
                    total={analytics.totalRequests}  color="#28a745" />
                </div>

                {analytics.recentDisasters?.length > 0 && (
                  <div className="analytics-card" style={{ marginTop:'1.5rem' }}>
                    <h3>🕐 Recent Disaster Reports</h3>
                    <div className="table-container" style={{ marginTop:'1rem' }}>
                      <table className="data-table">
                        <thead><tr><th>Title</th><th>Type</th><th>Severity</th><th>Status</th><th>Reported By</th><th>Date</th></tr></thead>
                        <tbody>
                          {analytics.recentDisasters.map((d) => (
                            <tr key={d._id}>
                              <td>{d.title}</td>
                              <td>{TYPE_ICON[d.disasterType]} {d.disasterType}</td>
                              <td><span className="tag" style={{ color: SEV_COLOR[d.severity] }}>{d.severity}</span></td>
                              <td><span className={`status-badge status-${d.status}`}>{d.status}</span></td>
                              <td>{d.reportedBy?.name}</td>
                              <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Disasters ── */}
        {activeTab === 'disasters' && (
          <div>
            <h2 className="admin-section-title">🚨 Disaster Reports
              <span className="admin-count">{disasters.length}</span>
            </h2>
            {loadingTab ? <div className="loading">Loading...</div> : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th><th>Type</th><th>Severity</th>
                      <th>Location</th><th>Reported By</th>
                      <th>Status</th><th>Date</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disasters.length === 0 && (
                      <tr><td colSpan={8} className="empty-cell">No disasters found</td></tr>
                    )}
                    {disasters.map((d) => (
                      <tr key={d._id}>
                        <td className="td-title">{d.title}</td>
                        <td>{TYPE_ICON[d.disasterType]} {d.disasterType}</td>
                        <td>
                          <span className="tag" style={{ color: SEV_COLOR[d.severity], borderColor: SEV_COLOR[d.severity] }}>
                            {d.severity}
                          </span>
                        </td>
                        <td>📍 {d.location}</td>
                        <td>{d.reportedBy?.name}</td>
                        <td>
                          <select
                            value={d.status}
                            onChange={(e) => handleDisasterStatus(d._id, e.target.value)}
                            className="status-select-sm"
                          >
                            <option value="reported">Reported</option>
                            <option value="active">Active</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                        <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button onClick={() => handleDeleteDisaster(d._id)} className="btn btn-danger btn-sm">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Relief Requests ── */}
        {activeTab === 'requests' && (
          <div>
            <h2 className="admin-section-title">🤝 Relief Requests
              <span className="admin-count">{requests.length}</span>
            </h2>
            {loadingTab ? <div className="loading">Loading...</div> : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th><th>Description</th><th>Location</th>
                      <th>People</th><th>Urgency</th><th>Requested By</th>
                      <th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 && (
                      <tr><td colSpan={8} className="empty-cell">No requests found</td></tr>
                    )}
                    {requests.map((r) => (
                      <tr key={r._id}>
                        <td><span className="tag">{REQ_ICON[r.requestType]} {r.requestType}</span></td>
                        <td className="td-desc">{r.description?.substring(0, 60)}…</td>
                        <td>📍 {r.location}</td>
                        <td>👤 {r.numberOfPeople}</td>
                        <td><span className={`urgency-${r.urgency}`}>{r.urgency}</span></td>
                        <td>{r.requestedBy?.name}</td>
                        <td>
                          <select
                            value={r.status}
                            onChange={(e) => handleRequestStatus(r._id, e.target.value)}
                            className="status-select-sm"
                          >
                            {STATUS_RELIEF.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button onClick={() => handleDeleteRequest(r._id)} className="btn btn-danger btn-sm">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Users ── */}
        {activeTab === 'users' && (
          <div>
            <h2 className="admin-section-title">👥 User Management
              <span className="admin-count">{users.length}</span>
            </h2>
            {loadingTab ? <div className="loading">Loading...</div> : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && (
                      <tr><td colSpan={6} className="empty-cell">No users found</td></tr>
                    )}
                    {users.map((u) => (
                      <tr key={u._id} className={u.role === 'admin' ? 'admin-row' : ''}>
                        <td className="td-name">
                          <div className="user-avatar">{u.name?.[0]?.toUpperCase()}</div>
                          {u.name}
                          {u.role === 'admin' && <span className="admin-shield">🛡️</span>}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          {u.role === 'admin' ? (
                            <span className="tag" style={{ color:'#4361ee' }}>Admin</span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className="status-select-sm"
                            >
                              <option value="user">User</option>
                              <option value="volunteer">Volunteer</option>
                            </select>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${u.isActive ? 'status-resolved' : 'status-active'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="td-actions">
                          {u.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleToggleActive(u._id, u.isActive)}
                                className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-primary'}`}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button onClick={() => handleDeleteUser(u._id)} className="btn btn-danger btn-sm">
                                🗑️
                              </button>
                            </>
                          )}
                          {u.role === 'admin' && (
                            <span className="protected-label">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Assign Volunteer ── */}
        {activeTab === 'assign' && (
          <div>
            <h2 className="admin-section-title">📌 Assign Volunteer to Disaster Zone</h2>
            <div className="assign-layout">
              <div className="form-card">
                <form onSubmit={handleAssign}>
                  <div className="form-group">
                    <label>Select Available Volunteer</label>
                    <select
                      required
                      value={assignForm.volunteerId}
                      onChange={(e) => setAssignForm({ ...assignForm, volunteerId: e.target.value })}
                    >
                      <option value="">-- Select Volunteer --</option>
                      {volunteers.filter((v) => v.availability).map((v) => (
                        <option key={v._id} value={v.user?._id}>
                          {v.user?.name} — {v.user?.email}
                        </option>
                      ))}
                    </select>
                    {volunteers.filter((v) => v.availability).length === 0 && (
                      <p className="field-error">No available volunteers at the moment.</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Select Active Disaster</label>
                    <select
                      required
                      value={assignForm.disasterId}
                      onChange={(e) => setAssignForm({ ...assignForm, disasterId: e.target.value })}
                    >
                      <option value="">-- Select Disaster --</option>
                      {disasters.filter((d) => d.status !== 'resolved').map((d) => (
                        <option key={d._id} value={d._id}>
                          {TYPE_ICON[d.disasterType]} {d.title} — {d.location}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">📌 Assign Volunteer</button>
                </form>
              </div>

              {/* Available volunteers list */}
              <div className="assign-volunteers">
                <h4>Available Volunteers ({volunteers.filter((v) => v.availability).length})</h4>
                {volunteers.filter((v) => v.availability).map((v) => (
                  <div key={v._id} className="volunteer-card">
                    <div className="volunteer-header">
                      <h4>{v.user?.name}</h4>
                      <span className="availability-badge available">✓ Available</span>
                    </div>
                    <p>{v.user?.email}</p>
                    <div className="skills-list">
                      {v.skills?.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
