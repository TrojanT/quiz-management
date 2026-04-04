import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { Home, ListChecks } from 'lucide-react';

const linkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`;

const UserNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
          <Link
            to="/user"
            className="flex shrink-0 items-center gap-2 rounded-lg outline-none ring-slate-300 focus-visible:ring-2"
            aria-label="Go to home"
          >
            <img src={logo} alt="" className="h-9 w-auto object-contain" draggable={false} />
            <span className="hidden text-base font-semibold tracking-tight text-slate-900 sm:inline">
              Quiz Hub
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-0.5 sm:gap-1" aria-label="Main navigation">
            <NavLink to="/user" end className={linkClass}>
              <Home size={18} strokeWidth={1.75} aria-hidden />
              Home
            </NavLink>
            <NavLink to="/quizzes" className={linkClass}>
              <ListChecks size={18} strokeWidth={1.75} aria-hidden />
              Quizzes
            </NavLink>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-sm text-slate-600">
          <span className="hidden max-w-[10rem] truncate sm:inline" title={user?.name}>
            {user?.name}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};

export default UserNavbar;
