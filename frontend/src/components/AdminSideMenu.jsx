import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, MessageSquareText } from 'lucide-react';
import logo from '../assets/logo2.png';

const navClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`;

const AdminSideMenu = () => (
  <aside className="flex min-h-screen w-52 shrink-0 flex-col border-r border-slate-200 bg-white">
    <div className="px-3 py-4">
      <NavLink to="/admin" className="block" aria-label="Admin home">
        <img
          src={logo}
          alt=""
          className="mx-auto h-12 w-auto max-w-full object-contain"
          draggable={false}
        />
      </NavLink>
    </div>
    <nav className="flex flex-col gap-0.5 p-3" aria-label="Admin navigation">
      <NavLink to="/admin" end className={navClass}>
        <LayoutDashboard size={18} strokeWidth={1.75} aria-hidden />
        Dashboard
      </NavLink>
      <NavLink to="/admin/quizzes" className={navClass}>
        <ListChecks size={18} strokeWidth={1.75} aria-hidden />
        Quizzes
      </NavLink>
      <NavLink to="/admin/questions" className={navClass}>
        <MessageSquareText size={18} strokeWidth={1.75} aria-hidden />
        Questions
      </NavLink>
    </nav>
  </aside>
);

export default AdminSideMenu;
