import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import Modal from '../components/Modal';
import { Pencil, Plus, Trash2 } from 'lucide-react';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const OPTION_COUNT = 4;

const emptyOptions = () => Array.from({ length: OPTION_COUNT }, () => '');

const emptyForm = {
  questionNo: '',
  text: '',
  options: emptyOptions(),
  correctIndex: 0,
  marks: 1,
};

const formatCorrectLabel = (q) => {
  const idx = q.correctIndex;
  const letter = OPTION_LETTERS[idx] ?? String(idx + 1);
  const text = q.correctAnswer || q.options?.[idx] || '';
  return `${letter}) ${text}`;
};

const AdminQuestions = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState('');

  const [questionModal, setQuestionModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadQuizzes = useCallback(async () => {
    setLoadingQuizzes(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/api/admin/quizzes');
      setQuizzes(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load quizzes.');
      setQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  }, []);

  const loadQuestions = useCallback(async (quizId) => {
    if (!quizId) {
      setQuestions([]);
      return;
    }
    setLoadingQuestions(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/api/admin/questions', {
        params: { quizId },
      });
      setQuestions(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load questions for this quiz.');
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  useEffect(() => {
    if (selectedQuizId) loadQuestions(selectedQuizId);
    else setQuestions([]);
  }, [selectedQuizId, loadQuestions]);

  const openAdd = () => {
    setForm(emptyForm);
    setQuestionModal({ mode: 'new' });
  };

  const openEdit = (q) => {
    const raw = Array.isArray(q.options) ? [...q.options] : [];
    const options = raw.slice(0, OPTION_COUNT);
    while (options.length < OPTION_COUNT) options.push('');
    let correctIndex = Number(q.correctIndex) || 0;
    if (correctIndex < 0 || correctIndex >= OPTION_COUNT) correctIndex = 0;
    setForm({
      questionNo: String(q.questionNo),
      text: q.text || '',
      options,
      correctIndex,
      marks: q.marks ?? 0,
    });
    setQuestionModal({ mode: 'edit', id: q.id });
  };

  const closeModal = () => setQuestionModal(null);

  const setOptionAt = (index, value) => {
    setForm((f) => {
      const options = [...f.options];
      options[index] = value;
      return { ...f, options };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuizId) return;
    const qn = Math.floor(Number(form.questionNo));
    if (!Number.isInteger(qn) || qn < 1) {
      alert('Question number is required and must be a positive whole number.');
      return;
    }
    const opts = form.options.map((o) => String(o).trim());
    if (opts.length !== OPTION_COUNT || opts.some((o) => !o)) {
      alert('Enter all four answer choices (A–D).');
      return;
    }
    if (form.correctIndex < 0 || form.correctIndex >= OPTION_COUNT) {
      alert('Select which choice is correct (A–D).');
      return;
    }
    setSaving(true);
    try {
      const body = {
        questionNo: qn,
        text: form.text.trim(),
        options: opts,
        correctIndex: form.correctIndex,
        marks: Number(form.marks),
      };
      if (questionModal.mode === 'new') {
        await axiosInstance.post('/api/admin/questions', {
          ...body,
          quizId: Number(selectedQuizId),
        });
      } else {
        await axiosInstance.put(`/api/admin/questions/${questionModal.id}`, body);
      }
      closeModal();
      await loadQuestions(selectedQuizId);
      await loadQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await axiosInstance.delete(`/api/admin/questions/${id}`);
      await loadQuestions(selectedQuizId);
      await loadQuizzes();
    } catch {
      alert('Delete failed.');
    }
  };

  const selectedTitle = quizzes.find((q) => String(q.id) === String(selectedQuizId))?.title;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="admin-quiz-pick" className="mb-1 block text-sm font-medium text-slate-700">
            Select quiz
          </label>
          <select
            id="admin-quiz-pick"
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            disabled={loadingQuizzes}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Choose a quiz</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                #{q.id} — {q.title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={!selectedQuizId}
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} aria-hidden />
          Add MCQ
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!selectedQuizId ? (
        <p className="text-sm text-slate-500">Select a quiz to view and manage its questions.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
            <span className="font-medium text-slate-800">{selectedTitle}</span>
            <span className="text-slate-400"> · </span>
            <span>Quiz ID {selectedQuizId}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Question No</th>
                  <th className="px-4 py-3">Question Text</th>
                  <th className="px-4 py-3">Correct Answer</th>
                  <th className="px-4 py-3">Marks</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingQuestions ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Loading
                    </td>
                  </tr>
                ) : questions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No questions yet. Use Add MCQ to create a multiple-choice question.
                    </td>
                  </tr>
                ) : (
                  questions.map((q) => (
                    <tr key={q.id} className="text-slate-700">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{q.questionNo}</td>
                      <td className="max-w-xs px-4 py-3 text-slate-800">{q.text}</td>
                      <td className="max-w-[14rem] px-4 py-3 text-slate-700">{formatCorrectLabel(q)}</td>
                      <td className="whitespace-nowrap px-4 py-3">{q.marks}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(q)}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            aria-label="Edit question"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(q.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                            aria-label="Delete question"
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
      )}

      <Modal
        title={questionModal?.mode === 'edit' ? 'Edit question' : 'Add question'}
        isOpen={!!questionModal}
        onClose={closeModal}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Question No</label>
            <input
              type="number"
              min={1}
              step={1}
              required
              value={form.questionNo}
              onChange={(e) => setForm({ ...form, questionNo: e.target.value })}
              placeholder="e.g. 1"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Question text</label>
            <textarea
              required
              rows={3}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Answer choices (exactly four: A–D)</span>
            {form.options.map((opt, i) => (
              <div key={i} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <span className="w-8 shrink-0 text-sm font-semibold text-slate-500">
                  {OPTION_LETTERS[i]}.
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => setOptionAt(i, e.target.value)}
                  placeholder={`Choice ${OPTION_LETTERS[i]}`}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="correct-mcq"
                    checked={form.correctIndex === i}
                    onChange={() => setForm((f) => ({ ...f, correctIndex: i }))}
                  />
                  Correct
                </label>
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Marks</label>
            <input
              type="number"
              min={0}
              step={0.5}
              required
              value={form.marks}
              onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminQuestions;
