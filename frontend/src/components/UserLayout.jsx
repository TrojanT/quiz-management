import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserNavbar from './UserNavbar';

const UserLayout = () => {
  const { user } = useAuth();

  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'user') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <UserNavbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
