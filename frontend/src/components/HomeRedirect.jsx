import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/user" replace />;
};

export default HomeRedirect;
