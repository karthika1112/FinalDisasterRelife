import { useState, useEffect } from 'react';
import { getVolunteers, registerVolunteer, updateAvailability } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const VolunteerPanel = () => {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getVolunteers().then(({ data }) => {
      setVolunteers(data);
      setRegistered(data.some((v) => v.user?._id === user?._id));
      setLoading(false);
    });
  }, [user]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerVolunteer({ skills: skills.split(',').map((s) => s.trim()) });
      setMessage('Successfully registered as volunteer!');
      setRegistered(true);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleAvailability = async (availability) => {
    await updateAvailability({ availability });
    setMessage(`Availability updated to: ${availability ? 'Available' : 'Unavailable'}`);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <h1>Volunteer Panel</h1>
      {message && <div className="alert alert-success">{message}</div>}

      {!registered && user?.role !== 'volunteer' && (
        <div className="form-card">
          <h3>Register as Volunteer</h3>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Skills (comma-separated)</label>
              <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="First Aid, Search & Rescue, Medical..." />
            </div>
            <button type="submit" className="btn btn-primary">Register as Volunteer</button>
          </form>
        </div>
      )}

      {registered && (
        <div className="form-card">
          <h3>Update Your Availability</h3>
          <div className="btn-group">
            <button onClick={() => handleAvailability(true)} className="btn btn-primary">Set Available</button>
            <button onClick={() => handleAvailability(false)} className="btn btn-outline">Set Unavailable</button>
          </div>
        </div>
      )}

      <div className="section">
        <h2>All Volunteers ({volunteers.length})</h2>
        <div className="card-grid">
          {volunteers.map((v) => (
            <div key={v._id} className="volunteer-card">
              <div className="volunteer-header">
                <h4>{v.user?.name}</h4>
                <span className={`availability-badge ${v.availability ? 'available' : 'unavailable'}`}>
                  {v.availability ? '✓ Available' : '✗ Unavailable'}
                </span>
              </div>
              <p>{v.user?.email}</p>
              <p>📍 {v.user?.location || 'N/A'}</p>
              <div className="skills-list">
                {v.skills?.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
              </div>
              <p>Completed Missions: <strong>{v.completedMissions}</strong></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VolunteerPanel;
