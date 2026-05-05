import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Edit2, CalendarOff, AlertCircle, Loader2, Clock } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './ui/Button';

const TeacherAvailabilityModal = ({ teacher, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newSlot, setNewSlot] = useState({ day: 'Mon', slot: '08:30-11:30' });

  useEffect(() => {
    if (teacher) setAvailability(teacher.availability || []);
  }, [teacher]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put(`/teachers/${teacher._id}`, { availability });
      toast.success('Availability updated');
      const updatedTeacher = response.data?.data?.teacher || null;
      if (onUpdate) onUpdate(updatedTeacher);
      onClose();
    } catch (error) {
      toast.error('Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  const addSlot = () => {
    const exists = availability.some(a => a.day === newSlot.day && a.slot === newSlot.slot);
    if (exists) return toast.error('This slot is already blocked');
    setAvailability([...availability, { ...newSlot }]);
    setNewSlot({ day: 'Mon', slot: '08:30-11:30' });
    toast.success('Slot added to list');
  };

  const removeSlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  if (!teacher) return null;

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
        className="relative w-full max-w-2xl bg-card border rounded-3xl shadow-premium overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive shadow-sm">
              <CalendarOff size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Block Schedule</h2>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                {teacher.name} • {teacher.branch}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="text-primary shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-slate-600 leading-relaxed">
              By default, teachers are available for all slots. Add specific days and times below to <span className="font-bold text-primary">block</span> them from being assigned.
            </p>
          </div>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Currently Blocked</h3>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {availability.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 border-2 border-dashed rounded-3xl opacity-50"
                  >
                    <p className="text-sm font-medium text-muted-foreground">No slots blocked. Fully available.</p>
                  </motion.div>
                ) : (
                  availability.map((slot, index) => (
                    <motion.div
                      key={`${slot.day}-${slot.slot}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-4 bg-muted/30 border rounded-2xl group hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="bg-background px-3 py-1 rounded-xl border font-bold text-sm text-primary shadow-sm min-w-[60px] text-center">
                          {slot.day}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <Clock size={14} className="text-muted-foreground" />
                          {slot.slot}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeSlot(index)}
                        className="text-destructive hover:bg-destructive/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>

          <section className="pt-4 border-t">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Add Unavailable Block</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={newSlot.day}
                onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                className="h-11 px-4 bg-muted/30 border border-muted-foreground/20 rounded-xl text-sm font-bold focus:bg-background outline-none transition-all cursor-pointer"
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <Input
                value={newSlot.slot}
                onChange={(e) => setNewSlot({ ...newSlot, slot: e.target.value })}
                placeholder="08:30-11:30"
                className="rounded-xl font-medium"
              />
              <Button onClick={addSlot} variant="secondary" className="rounded-xl gap-2 font-bold uppercase tracking-wider text-[10px] h-11">
                <Plus size={16} />
                Add Block
              </Button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="shadow-premium rounded-xl px-8"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Availability'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherAvailabilityModal;
