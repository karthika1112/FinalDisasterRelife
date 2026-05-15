import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import PrivateRoute from './components/Layout/PrivateRoute';

import Home from './pages/Home';
import Contact from './pages/Contact';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import DisasterList from './components/Disaster/DisasterList';
import DisasterDetail from './components/Disaster/DisasterDetail';
import ReportDisaster from './components/Disaster/ReportDisaster';
import ReliefRequests from './components/Relief/ReliefRequests';
import VolunteerPanel from './components/Volunteer/VolunteerPanel';
import AdminDashboard from './components/Admin/AdminDashboard';

import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/disasters" element={<DisasterList />} />

            {/* NOTE: /disasters/report MUST be before /disasters/:id */}
            <Route path="/disasters/report" element={
              <PrivateRoute><ReportDisaster /></PrivateRoute>
            } />
            <Route path="/disasters/:id" element={<DisasterDetail />} />

            {/* Private — any logged-in user */}
            <Route path="/relief" element={
              <PrivateRoute><ReliefRequests /></PrivateRoute>
            } />

            {/* Private — volunteer or admin */}
            <Route path="/volunteer" element={
              <PrivateRoute roles={['volunteer', 'admin']}><VolunteerPanel /></PrivateRoute>
            } />

            {/* Private — admin only */}
            <Route path="/admin" element={
              <PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>
            } />

            {/* 404 fallback */}
            <Route path="*" element={
              <div className="not-found">
                <h2>404 — Page Not Found</h2>
                <a href="/" className="btn btn-primary">Go Home</a>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
