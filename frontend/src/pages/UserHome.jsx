import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { BookOpenCheck, ClipboardCheck, TrendingUp } from 'lucide-react';

const UserHome = () => {
  const { user } = useAuth();
  const [availableQuizzes, setAvailableQuizzes] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axiosInstance.get('/api/user/quiz-stats');
        if (!cancelled) {
          setAvailableQuizzes(typeof data?.availableQuizzes === 'number' ? data.availableQuizzes : 0);
        }
      } catch {
        if (!cancelled) setAvailableQuizzes(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const attemptedQuizzes = 0;
  const averageScore = 0;

  const displayName = user?.name?.trim() || 'there';

  return (
    <div className="space-y-8" aria-label="Home">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Hi, {displayName}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Available quizzes</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                {availableQuizzes === null ? '—' : availableQuizzes}
              </p>
            </div>
            <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <BookOpenCheck size={22} strokeWidth={1.75} aria-hidden />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Active quizzes you can take</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Attempted quizzes</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{attemptedQuizzes}</p>
            </div>
            <div className="grid size-11 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <ClipboardCheck size={22} strokeWidth={1.75} aria-hidden />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Quizzes you have started or finished</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Average score</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{averageScore}%</p>
            </div>
            <div className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <TrendingUp size={22} strokeWidth={1.75} aria-hidden />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Across all completed attempts</p>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
