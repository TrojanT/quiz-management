import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import Modal from '../components/Modal';
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';

const statusStyle = {
  active: 'bg-emerald-100 text-emerald-900',
  inactive: 'bg-slate-200 text-slate-700',
};

const emptyQuizForm = {
  title: '',
  questionCount: 0,
  duration: 15,
  status: 'inactive',
  categoryId: '',
};

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);

  const [quizModal, setQuizModal] = useState(null);
  const [quizForm, setQuizForm] = useState(emptyQuizForm);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSaving, setQuizSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/api/admin/quizzes');
      setQuizzes(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load quizzes.');
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/admin/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (categoriesModalOpen) loadCategories();
  }, [categoriesModalOpen, loadCategories]);

  useEffect(() => {
    if (!quizModal) return;
    let cancelled = false;
    loadCategories();
    if (quizModal.mode === 'new') {
      setQuizForm(emptyQuizForm);
      setQuizLoading(false);
      return undefined;
    }
    setQuizLoading(true);
    (async () => {
      try {
        const { data } = await axiosInstance.get(`/api/admin/quizzes/${quizModal.id}`);
        if (cancelled) return;
        setQuizForm({
          title: data.title || '',
          questionCount: data.questionCount ?? 0,
          duration: data.duration ?? 15,
          status: data.status || 'inactive',
          categoryId: data.categoryId || '',
        });
      } catch {
        if (!cancelled) setQuizModal(null);
      } finally {
        if (!cancelled) setQuizLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quizModal, loadCategories]);

  const closeQuizModal = () => setQuizModal(null);
  const openNewQuiz = () => setQuizModal({ mode: 'new' });

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await axiosInstance.delete(`/api/admin/quizzes/${id}`);
      await load();
    } catch {
      alert('Delete failed.');
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!quizForm.categoryId) {
      alert('Select a category (open Manage categories to add one).');
      return;
    }
    setQuizSaving(true);
    try {
      const body = {
        title: quizForm.title,
        questionCount: quizForm.questionCount,
        duration: quizForm.duration,
        status: quizForm.status,
        categoryId: quizForm.categoryId,
      };
      if (quizModal.mode === 'new') {
        await axiosInstance.post('/api/admin/quizzes', body);
      } else {
        await axiosInstance.put(`/api/admin/quizzes/${quizModal.id}`, body);
      }
      closeQuizModal();
      await load();
    } catch {
      alert('Save failed.');
    } finally {
      setQuizSaving(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    setCategorySaving(true);
    try {
      await axiosInstance.post('/api/admin/categories', { name: trimmed });
      setNewCategoryName('');
      await loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add category.');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axiosInstance.delete(`/api/admin/categories/${id}`);
      await loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const quizModalTitle = quizModal?.mode === 'edit' ? 'Edit quiz' : 'New quiz';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openNewQuiz}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
        >
          <Plus size={18} aria-hidden />
          Add new quiz
        </button>
        <button
          type="button"
          onClick={() => setCategoriesModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          <FolderTree size={18} aria-hidden />
          Manage categories
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Questions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : quizzes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No quizzes yet. Add a category first, then create a quiz.
                  </td>
                </tr>
              ) : (
                quizzes.map((q) => (
                  <tr key={q.id} className="text-slate-700">
                    <td className="max-w-[8rem] truncate px-4 py-3 font-mono text-xs text-slate-500">
                      {q.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{q.title}</td>
                    <td className="px-4 py-3">{q.questionCount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusStyle[q.status] || 'bg-slate-100 text-slate-800'}`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{q.duration} min</td>
                    <td className="px-4 py-3">{q.category}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setQuizModal({ mode: 'edit', id: q.id })}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          aria-label="Edit quiz"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                          aria-label="Delete quiz"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title={quizModalTitle}
        isOpen={!!quizModal}
        onClose={closeQuizModal}
        size="lg"
      >
        {quizLoading ? (
          <p className="text-sm text-slate-600">Loading…</p>
        ) : (
          <form onSubmit={handleQuizSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
              <input
                type="text"
                required
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
              <select
                required
                value={quizForm.categoryId}
                onChange={(e) => setQuizForm({ ...quizForm, categoryId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Number of questions
                </label>
                <input
                  type="number"
                  min={0}
                  value={quizForm.questionCount}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, questionCount: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quizForm.duration}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, duration: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={quizForm.status}
                onChange={(e) => setQuizForm({ ...quizForm, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={quizSaving}
                className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
              >
                {quizSaving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={closeQuizModal}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        title="Manage categories"
        isOpen={categoriesModalOpen}
        onClose={() => setCategoriesModalOpen(false)}
        size="xl"
      >
        <form
          onSubmit={handleAddCategory}
          className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4"
        >
          <div className="min-w-[12rem] flex-1">
            <label htmlFor="admin-cat-name" className="mb-1 block text-sm font-medium text-slate-700">
              New category name
            </label>
            <input
              id="admin-cat-name"
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Science"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <button
            type="submit"
            disabled={categorySaving || !newCategoryName.trim()}
            className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50"
          >
            {categorySaving ? 'Adding…' : 'Add category'}
          </button>
        </form>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoriesLoading ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                    No categories yet.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default AdminQuizzes;
