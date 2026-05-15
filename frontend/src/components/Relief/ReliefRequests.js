import { useState, useEffect } from 'react';
import { getReliefRequests, createReliefRequest, updateReliefRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ReliefRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ requestType: 'food', description: '', location: '', numberOfPeople: 1, urgency: 'medium' });

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await getReliefRequests();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createReliefRequest(form);
    setShowForm(false);
    setForm({ requestType: 'food', description: '', location: '', numberOfPeople: 1, urgency: 'medium' });
    fetchRequests();
  };

  const handleStatusUpdate = async (id, status) => {
    await updateReliefRequest(id, { status });
    fetchRequests();
  };

  const canManage = user?.role === 'admin' || user?.role === 'volunteer';
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Relief Requests</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Submit Relief Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Request Type</label>
                <select value={form.requestType} onChange={update('requestType')}>
                  <option value="food">Food</option>
                  <option value="shelter">Shelter</option>
                  <option value="medical">Medical</option>
                </select>
              </div>
              <div className="form-group">
                <label>Urgency</label>
                <select value={form.urgency} onChange={update('urgency')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea required rows={3} value={form.description} onChange={update('description')} placeholder="Describe your need..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input type="text" required value={form.location} onChange={update('location')} placeholder="Your location" />
              </div>
              <div className="form-group">
                <label>Number of People</label>
                <input type="number" min={1} value={form.numberOfPeople} onChange={update('numberOfPeople')} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Submit Request</button>
          </form>
        </div>
      )}

      {loading ? <div className="loading">Loading...</div> : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th><th>Description</th><th>Location</th><th>People</th><th>Urgency</th><th>Status</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td><span className="tag">{r.requestType}</span></td>
                  <td>{r.description.substring(0, 60)}...</td>
                  <td>{r.location}</td>
                  <td>{r.numberOfPeople}</td>
                  <td><span className={`urgency-${r.urgency}`}>{r.urgency}</span></td>
                  <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
                  {canManage && (
                    <td>
                      <select value={r.status} onChange={(e) => handleStatusUpdate(r._id, e.target.value)} className="status-select-sm">
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="fulfilled">Fulfilled</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReliefRequests;
