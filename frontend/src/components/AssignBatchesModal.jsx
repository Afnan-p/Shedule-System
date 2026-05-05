import { useEffect, useMemo, useState } from 'react';
import { X, CheckSquare, Square, Search, Users, Calendar, User, BookOpen } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './ui/Button';

const AssignBatchesModal = ({
  open,
  day,
  slot,
  teacher,
  batches = [],
  schedule = [],
  onClose,
  onConfirm
}) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const scheduledBatchIds = useMemo(() => {
    const target = schedule.find(
      (item) =>
        (typeof item.teacherId === 'object' ? item.teacherId._id : item.teacherId) === teacher?._id && 
        item.day === day && 
        item.slot === slot
    );
    return target?.batchIds?.map((b) => (typeof b === 'object' ? b._id : b)) || [];
  }, [schedule, teacher, day, slot]);

  const toggleBatch = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((batchId) => batchId !== id) : [...prev, id]
    );
  };

  const filteredBatches = useMemo(() => {
    const lower = search.toLowerCase();
    return batches
      .filter((batch) => (teacher?.branch ? batch.branch === teacher.branch : true))
      .filter(
        (batch) =>
          batch.name.toLowerCase().includes(lower) ||
          batch.subjects.some((subject) => subject.toLowerCase().includes(lower))
      )
      .map((batch) => ({
        ...batch,
        isAssignedElsewhere: schedule.some(
          (item) =>
            item.day === day &&
            item.slot === slot &&
            (typeof item.teacherId === 'object' ? item.teacherId._id : item.teacherId) !== teacher?._id &&
            item.batchIds.some((b) => (typeof b === 'object' ? b._id : b) === batch._id)
        )
      }));
  }, [batches, search, teacher, schedule, day, slot]);

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setSearch('');
    }
  }, [open]);

  const handleConfirm = () => {
    const uniqueIds = Array.from(new Set([...scheduledBatchIds, ...selectedIds]));
    onConfirm?.(uniqueIds);
    setSelectedIds([]);
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
        className="relative w-full max-w-2xl bg-card border rounded-3xl shadow-premium overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Assign Batches</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                <User size={12} className="text-primary" />
                <span className="text-primary font-bold">{teacher?.name}</span>
                <div className="w-1 h-1 rounded-full bg-border" />
                <span>{day}</span>
                <div className="w-1 h-1 rounded-full bg-border" />
                <span>{slot}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X size={20} />
          </Button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batches or subjects…"
              className="pl-9 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all rounded-xl"
            />
          </div>
        </div>

        {/* Batch List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredBatches.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="bg-muted p-4 rounded-full mb-4">
                  <Search size={32} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No matching batches found</p>
              </motion.div>
            ) : (
              filteredBatches.map((batch, index) => {
                const isScheduled = scheduledBatchIds.includes(batch._id);
                const isNewlySelected = selectedIds.includes(batch._id);
                const isSelected = isScheduled || isNewlySelected;
                
                return (
                  <motion.button
                    key={batch._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => toggleBatch(batch._id)}
                    disabled={batch.isAssignedElsewhere}
                    className={cn(
                      "w-full flex items-center justify-between p-4 border rounded-2xl text-left transition-all duration-300",
                      isSelected 
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                        : "border-border bg-card hover:border-primary/40 hover:shadow-premium",
                      batch.isAssignedElsewhere && "opacity-40 cursor-not-allowed bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors",
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                      )}>
                        {isSelected && <CheckSquare size={16} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{batch.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{batch.branch}</span>
                          <div className="w-1 h-1 rounded-full bg-border" />
                          <div className="flex items-center gap-1 text-[11px] font-medium text-primary">
                            <BookOpen size={10} />
                            {batch.subjects.slice(0, 2).join(', ')}
                            {batch.subjects.length > 2 && ` +${batch.subjects.length - 2}`}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground">
                      <Users size={12} />
                      <span>{batch.size}</span>
                    </div>
                  </motion.button>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/5 flex items-center justify-between">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {scheduledBatchIds.length} Assigned • {selectedIds.length} Selected
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleConfirm}
              disabled={scheduledBatchIds.length + selectedIds.length === 0}
              className="shadow-premium rounded-xl"
            >
              Confirm Assignment
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AssignBatchesModal;
