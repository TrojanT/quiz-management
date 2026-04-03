import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'user') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700">
            <Link to="/user" className="hover:text-slate-900">
              Dashboard
            </Link>

          </nav>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="truncate max-w-[10rem] sm:max-w-xs">{user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
