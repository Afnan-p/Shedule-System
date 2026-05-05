import { useEffect, useMemo, useState } from 'react';
import { X, Save, Clock4, Calendar, User, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './ui/Button';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ScheduleSlotModal = ({ open, scheduleItem, teachers = [], onClose, onSubmit }) => {
  const [day, setDay] = useState(scheduleItem?.day || 'Mon');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('11:30');
  const [teacherId, setTeacherId] = useState(scheduleItem?.teacherId?._id || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (scheduleItem && open) {
      setDay(scheduleItem.day);
      const [start, end] = scheduleItem.slot.split('-');
      setStartTime(start);
      setEndTime(end);
      setTeacherId(typeof scheduleItem.teacherId === 'object' ? scheduleItem.teacherId._id : scheduleItem.teacherId);
    }
  }, [scheduleItem, open]);

  const slotPresets = useMemo(() => {
    const t = teachers.find(t => t._id === teacherId) || scheduleItem?.teacherId;
    const availabilitySlots = t?.availability?.map((slot) => slot.slot) || [];
    const defaults = ['08:30-11:30', '11:30-14:30', '14:30-17:00'];
    return [...new Set([`${startTime}-${endTime}`, ...availabilitySlots, ...defaults])];
  }, [scheduleItem, startTime, endTime, teachers, teacherId]);

  if (!open || !scheduleItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId || !startTime || !endTime) return toast.error('Please fill all fields');
    if (startTime >= endTime) return toast.error('Start time must be before end time');
    
    setSaving(true);
    try {
      await onSubmit?.({
        scheduleItemId: scheduleItem._id,
        source: {
          day: scheduleItem.day,
          slot: scheduleItem.slot,
          teacherId: typeof scheduleItem.teacherId === 'object' ? scheduleItem.teacherId._id : scheduleItem.teacherId
        },
        target: { day, slot: `${startTime}-${endTime}`, teacherId }
      });
      onClose?.();
    } catch (error) {
      console.error('Failed to update schedule:', error);
    } finally {
      setSaving(false);
    }
  };

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
        className="relative w-full max-w-lg bg-card border rounded-3xl shadow-premium overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Clock4 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Adjust Schedule</h2>
              <p className="text-sm text-muted-foreground font-medium truncate max-w-[240px]">
                {scheduleItem.batchIds?.map((b) => b.name).join(', ')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                <Calendar size={12} className="text-primary" />
                Select Day
              </label>
              <div className="flex flex-wrap gap-2">
                {days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDay(d)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                      day === d 
                        ? "bg-primary text-primary-foreground border-primary shadow-md" 
                        : "bg-background border-border hover:border-primary/40"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                <Clock4 size={12} className="text-primary" />
                Time Interval
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="rounded-xl font-bold text-center"
                />
                <ArrowRight size={16} className="text-muted-foreground" />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="rounded-xl font-bold text-center"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {slotPresets.map((preset) => {
                  const [pStart, pEnd] = preset.split('-');
                  const isActive = pStart === startTime && pEnd === endTime;
                  return (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => { setStartTime(pStart); setEndTime(pEnd); }}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all",
                        isActive
                          ? "bg-primary/10 text-primary border-primary shadow-sm"
                          : "bg-background text-slate-600 border-border hover:border-primary/40"
                      )}
                    >
                      {pStart} – {pEnd}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                <User size={12} className="text-primary" />
                Assigned Teacher
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full h-11 px-4 bg-muted/30 border border-muted-foreground/20 rounded-xl text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
              >
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} • {t.branch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={saving}
            className="shadow-premium rounded-xl px-8"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ScheduleSlotModal;
