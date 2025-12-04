import { useEffect, useState } from 'react';
import { X, Save, Trash2, UserPlus } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const TeacherFormModal = ({ open, teacher, onClose, onSaved, onDeleted }) => {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [subjectsInput, setSubjectsInput] = useState('');
  const [metaNotes, setMetaNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEdit = Boolean(teacher?._id);

  useEffect(() => {
    if (open) {
      setName(teacher?.name || '');
      setBranch(teacher?.branch || '');
      setSubjectsInput((teacher?.subjects || []).join(', '));
      setMetaNotes(
        typeof teacher?.meta?.notes === 'string' ? teacher.meta.notes : ''
      );
    }
  }, [teacher, open]);

  const parsedSubjects = () =>
    subjectsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !branch.trim()) {
      toast.error('Name and branch are required');
      return;
    }
    const subjects = parsedSubjects();
    if (subjects.length === 0) {
      toast.error('Please enter at least one subject');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        branch: branch.trim(),
        subjects,
        meta: metaNotes ? { notes: metaNotes } : undefined
      };

      let response;
      if (isEdit) {
        response = await api.put(`/teachers/${teacher._id}`, payload);
        toast.success('Teacher updated successfully');
      } else {
        response = await api.post('/teachers', payload);
        toast.success('Teacher created successfully');
      }

      const savedTeacher = response?.data?.data?.teacher;
      onSaved?.(savedTeacher || null);
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    const confirmed = window.confirm('Delete this teacher permanently?');
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.delete(`/teachers/${teacher._id}`);
      toast.success('Teacher deleted');
      onDeleted?.(teacher._id);
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete teacher');
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? 'Edit Teacher' : 'Add Teacher'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit ? teacher?.name : 'Create a new teacher profile'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., Mr. David Johnson"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., Downtown"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subjects
            </label>
            <input
              type="text"
              value={subjectsInput}
              onChange={(e) => setSubjectsInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Comma separated (e.g., Math, Physics)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={metaNotes}
              onChange={(e) => setMetaNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
              placeholder="Any extra information"
            />
          </div>
        </form>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          {isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{deleting ? 'Deleting…' : 'Delete'}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <UserPlus className="w-4 h-4" />
              <span>Only admins & schedulers can add teachers</span>
            </div>
          )}

          <div className="space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving…' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherFormModal;

