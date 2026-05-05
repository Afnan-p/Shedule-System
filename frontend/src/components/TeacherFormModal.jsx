import { useEffect, useState } from 'react';
import { X, Save, Trash2, UserPlus, BookOpen, MapPin, FileText, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

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
      setMetaNotes(typeof teacher?.meta?.notes === 'string' ? teacher.meta.notes : '');
    }
  }, [teacher, open]);

  const parsedSubjects = () =>
    subjectsInput.split(',').map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !branch.trim()) return toast.error('Name and branch are required');
    const subjects = parsedSubjects();
    if (subjects.length === 0) return toast.error('Please enter at least one subject');

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

      onSaved?.(response?.data?.data?.teacher || null);
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-card border rounded-3xl shadow-premium overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              {isEdit ? <Save size={24} /> : <UserPlus size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {isEdit ? 'Update Profile' : 'New Teacher'}
              </h2>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                {isEdit ? teacher?.name : 'Create a new teacher profile'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                <UserPlus size={12} className="text-primary" />
                Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Prof. Sarah Wilson"
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  <MapPin size={12} className="text-primary" />
                  Branch
                </label>
                <Input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g., North Campus"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  <BookOpen size={12} className="text-primary" />
                  Expertise
                </label>
                <Input
                  value={subjectsInput}
                  onChange={(e) => setSubjectsInput(e.target.value)}
                  placeholder="Comma separated (e.g., Math, CS)"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                <FileText size={12} className="text-primary" />
                Internal Notes
              </label>
              <textarea
                value={metaNotes}
                onChange={(e) => setMetaNotes(e.target.value)}
                className="w-full min-h-[100px] px-4 py-3 bg-muted/30 border border-muted-foreground/20 rounded-2xl text-sm focus:bg-background focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                placeholder="Extra details about availability, performance, etc."
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/5 flex items-center justify-between">
          <div>
            {isEdit && (
              <Button 
                variant="ghost" 
                type="button" 
                onClick={handleDelete}
                disabled={deleting || loading}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 px-3"
              >
                <Trash2 size={16} />
                <span className="font-bold uppercase tracking-wider text-[10px]">Delete Profile</span>
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={loading}
              className="shadow-premium rounded-xl px-8"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isEdit ? 'Update Teacher' : 'Create Teacher')}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherFormModal;
