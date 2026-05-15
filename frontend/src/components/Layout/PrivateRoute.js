import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in — redirect to login, remember where they were going
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  // Logged in but wrong role
  if (roles && !roles.includes(user.role))
    return <Navigate to="/" replace />;

  return children;
};

export default PrivateRoute;
