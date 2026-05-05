import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Save, XCircle, GraduationCap, Mail, Phone, Hash, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './ui/Button';

const BatchDetailsModal = ({ batch, onClose, onUpdate, user }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    rollNumber: '',
    phone: ''
  });

  useEffect(() => {
    if (batch) fetchBatchDetails();
  }, [batch]);

  const fetchBatchDetails = async () => {
    if (!batch) return;
    setLoading(true);
    try {
      const response = await api.get(`/batches/${batch._id}`);
      setStudents(response.data.data.batch.students || []);
    } catch (error) {
      toast.error('Failed to fetch batch details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name.trim()) return toast.error('Student name is required');
    setLoading(true);
    try {
      const response = await api.post(`/batches/${batch._id}/students`, newStudent);
      setStudents(response.data.data.batch.students || []);
      setNewStudent({ name: '', email: '', rollNumber: '', phone: '' });
      setShowAddForm(false);
      toast.success('Student added successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/batches/${batch._id}/students/${studentId}`);
      setStudents(response.data.data.batch.students || []);
      toast.success('Student removed successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove student');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (studentId, updatedData) => {
    setLoading(true);
    try {
      const response = await api.put(`/batches/${batch._id}/students/${studentId}`, updatedData);
      setStudents(response.data.data.batch.students || []);
      setEditingStudent(null);
      toast.success('Student updated successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'scheduler';

  if (!batch) return null;

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
        className="relative w-full max-w-4xl bg-card border rounded-3xl shadow-premium overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <GraduationCap size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{batch.name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                <span>{batch.branch}</span>
                <div className="w-1 h-1 rounded-full bg-border" />
                <span>{students.length} Students</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
          {/* Subjects */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Curriculum</h3>
            <div className="flex flex-wrap gap-2">
              {batch.subjects.map((subject) => (
                <span
                  key={subject}
                  className="px-4 py-1.5 bg-primary/5 text-primary rounded-full text-xs font-bold border border-primary/10 shadow-sm"
                >
                  {subject}
                </span>
              ))}
            </div>
          </section>

          {/* Students Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight">Student Roster</h3>
              {canEdit && (
                <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="rounded-full gap-2 shadow-premium">
                  {showAddForm ? <X size={14} /> : <Plus size={14} />}
                  <span>{showAddForm ? 'Cancel' : 'Add Student'}</span>
                </Button>
              )}
            </div>

            {/* Add Student Form */}
            <AnimatePresence>
              {showAddForm && canEdit && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="bg-muted/30 border-dashed border-2 mb-6">
                    <CardContent className="p-6">
                      <form onSubmit={handleAddStudent} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Name</label>
                            <Input
                              required
                              value={newStudent.name}
                              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                              placeholder="Student Name"
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Roll Number</label>
                            <Input
                              value={newStudent.rollNumber}
                              onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                              placeholder="ID / Roll Number"
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
                            <Input
                              type="email"
                              value={newStudent.email}
                              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                              placeholder="email@example.com"
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Phone</label>
                            <Input
                              value={newStudent.phone}
                              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                              placeholder="+1 (555) 000-0000"
                              className="bg-background"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <Button variant="secondary" type="button" onClick={() => setShowAddForm(false)} className="rounded-xl">Cancel</Button>
                          <Button type="submit" disabled={loading} className="rounded-xl shadow-premium">
                            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Save Student'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Students List */}
            <div className="space-y-3">
              {loading && students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="text-sm text-muted-foreground mt-4">Loading roster...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-3xl opacity-50">
                  <p className="text-sm font-medium text-muted-foreground">No students enrolled in this batch yet.</p>
                </div>
              ) : (
                students.map((student, index) => (
                  <StudentRow
                    key={student._id || index}
                    student={student}
                    canEdit={canEdit}
                    isEditing={editingStudent === student._id}
                    onEdit={() => setEditingStudent(student._id)}
                    onCancel={() => setEditingStudent(null)}
                    onSave={(data) => handleUpdateStudent(student._id, data)}
                    onDelete={() => handleDeleteStudent(student._id)}
                    index={index}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

const StudentRow = ({ student, canEdit, isEditing, onEdit, onCancel, onSave, onDelete, index }) => {
  const [formData, setFormData] = useState({
    name: student.name || '',
    email: student.email || '',
    rollNumber: student.rollNumber || '',
    phone: student.phone || ''
  });

  if (isEditing) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 bg-primary/5 border border-primary/20 rounded-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Name *"
            className="bg-background"
          />
          <Input
            value={formData.rollNumber}
            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
            placeholder="Roll Number"
            className="bg-background"
          />
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
            className="bg-background"
          />
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Phone"
            className="bg-background"
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={() => onSave(formData)} className="gap-2">
            <Save size={14} />
            Save Changes
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 bg-card border rounded-2xl hover:border-primary/20 hover:shadow-premium transition-all duration-300 group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {student.name?.[0]?.toUpperCase()}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 min-w-0">
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{student.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">Full Name</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-600 truncate flex items-center gap-1.5">
                <Hash size={12} className="text-muted-foreground" />
                {student.rollNumber || 'N/A'}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">Roll No</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-600 truncate flex items-center gap-1.5">
                <Mail size={12} className="text-muted-foreground" />
                {student.email || 'N/A'}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">Email Address</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-600 truncate flex items-center gap-1.5">
                <Phone size={12} className="text-muted-foreground" />
                {student.phone || 'N/A'}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">Contact</p>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10">
              <Edit2 size={14} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10">
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BatchDetailsModal;
