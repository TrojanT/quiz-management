import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pageTitleFromPath = (pathname) => {
  if (pathname === '/admin' || pathname === '/admin/') return 'Dashboard';
  if (pathname.startsWith('/admin/quizzes')) return 'Quizzes';
  return 'Admin';
};

const AdminTopBar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pageTitle = pageTitleFromPath(pathname);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3">
      <h1 className="truncate text-base font-semibold text-slate-900">{pageTitle}</h1>
      <div className="flex shrink-0 items-center gap-3 text-sm text-slate-600">
        <span className="hidden max-w-[12rem] truncate sm:inline">{user?.name}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
        >
          Log out
        </button>
      </div>
    </header>
  );
};

export default AdminTopBar;
