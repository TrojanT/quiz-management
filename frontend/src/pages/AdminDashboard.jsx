import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { BookOpenCheck, ClipboardCheck, ListChecks, Users } from 'lucide-react';

const TOTAL_ATTEMPTS_PLACEHOLDER = 0;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get('/api/admin/stats');
        if (!cancelled) {
          setStats({
            totalQuizzes: typeof data?.totalQuizzes === 'number' ? data.totalQuizzes : 0,
            totalQuestions: typeof data?.totalQuestions === 'number' ? data.totalQuestions : 0,
            totalUsers: typeof data?.totalUsers === 'number' ? data.totalUsers : 0,
          });
        }
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      label: 'Total quizzes',
      value: loading ? null : stats?.totalQuizzes ?? 0,
      hint: 'Quizzes in the catalogue',
      icon: BookOpenCheck,
      iconClass: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Total questions',
      value: loading ? null : stats?.totalQuestions ?? 0,
      hint: 'Questions across all quizzes',
      icon: ListChecks,
      iconClass: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Total users',
      value: loading ? null : stats?.totalUsers ?? 0,
      hint: 'Registered accounts',
      icon: Users,
      iconClass: 'bg-violet-50 text-violet-700',
    },
    {
      label: 'Total attempts',
      value: TOTAL_ATTEMPTS_PLACEHOLDER,
      hint: 'Quiz completion attempts',
      icon: ClipboardCheck,
      iconClass: 'bg-amber-50 text-amber-700',
    },
  ];

  return (
    <div className="space-y-8" aria-label="Admin dashboard">

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, hint, icon: Icon, iconClass }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                  {value === null ? '—' : value}
                </p>
              </div>
              <div className={`grid size-11 place-items-center rounded-xl ${iconClass}`}>
                <Icon size={22} strokeWidth={1.75} aria-hidden />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">{hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
