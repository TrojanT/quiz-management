import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSideMenu from './AdminSideMenu';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user?.token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSideMenu />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-end gap-3 border-b border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <span className="hidden truncate sm:inline max-w-[12rem]">{user.name}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
          >
            Log out
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
