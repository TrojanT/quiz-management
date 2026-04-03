import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSideMenu from './AdminSideMenu';
import AdminTopBar from './AdminTopBar';

const AdminLayout = () => {
  const { user } = useAuth();

  if (!user?.token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSideMenu />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminTopBar />

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
