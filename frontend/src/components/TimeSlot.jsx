import { useDrop, useDrag } from 'react-dnd';
import { X, GripVertical, Clock4, Plus, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRef } from 'react';
import { cn } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const TimeSlot = ({
  day,
  slot,
  teacherId,
  scheduleItem,
  isAvailable,
  onDrop,
  onRemoveBatch,
  onMoveSchedule,
  onScheduleEdit,
  onAssignRequest,
  canManageSchedule
}) => {
  const slotRef = useRef(null);
  const scheduleRef = useRef(null);
  
  const batchIds =
    scheduleItem?.batchIds?.map((batch) =>
      typeof batch === 'object' ? batch._id : batch
    ) || [];

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['batch', 'schedule'],
    canDrop: () => Boolean(canManageSchedule),
    drop: async (item, monitor) => {
      if (!canManageSchedule) return;
      if (monitor.getItemType() === 'schedule') {
        if (!onMoveSchedule || !item.scheduleItemId) return;
        if (item.teacherId === teacherId && item.day === day && item.slot === slot) return;
        
        onMoveSchedule?.({
          scheduleItemId: item.scheduleItemId,
          source: { day: item.day, slot: item.slot, teacherId: item.teacherId },
          target: { day, slot, teacherId }
        });
        return;
      }

      let incomingBatchIds = item.batchIds || [item.batchId];
      if (!Array.isArray(incomingBatchIds) || incomingBatchIds.length === 0) {
        if (item.batchId) incomingBatchIds = [item.batchId];
        else {
          toast.error('No batch selected');
          return;
        }
      }
      
      if (!isAvailable && !scheduleItem) {
        toast.error('Teacher is not available at this time slot');
        return;
      }

      const allBatchIds = [...new Set([...batchIds, ...incomingBatchIds])];
      try {
        await onDrop?.(day, slot, teacherId, allBatchIds);
      } catch (error) {
        toast.error('Failed to assign batches');
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }));

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'schedule',
      canDrag: canManageSchedule && Boolean(scheduleItem),
      item: { scheduleItemId: scheduleItem?._id, day, slot, teacherId },
      collect: (monitor) => ({ isDragging: monitor.isDragging() })
    }),
    [canManageSchedule, scheduleItem, day, slot, teacherId]
  );

  drop(slotRef);
  if (scheduleItem) drag(scheduleRef);

  return (
    <div
      ref={slotRef}
      className={cn(
        "relative h-full w-full p-2 transition-all duration-200 group/slot",
        !isAvailable && !scheduleItem ? "bg-destructive/5 cursor-not-allowed" : "bg-card/30",
        isOver && canDrop && "bg-primary/10 ring-2 ring-primary ring-inset",
        isDragging && "opacity-40"
      )}
    >
      {/* Slot Time Label */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
          {slot.replace('-', ' - ')}
        </span>
        {canManageSchedule && isAvailable && (
          <button
            onClick={() => onAssignRequest?.({ day, slot, teacherId })}
            className="opacity-0 group-hover/slot:opacity-100 p-1 rounded-md hover:bg-primary/10 text-primary transition-all"
            title="Assign batch"
          >
            <Plus size={12} />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {scheduleItem?.batchIds?.length > 0 ? (
          <div ref={scheduleRef} className="cursor-grab active:cursor-grabbing space-y-1">
            <AnimatePresence mode="popLayout">
              {scheduleItem.batchIds.map((batch, idx) => {
                const batchId = typeof batch === 'object' ? batch._id : batch;
                const batchName = typeof batch === 'object' ? batch.name : 'Batch';
                return (
                  <motion.div
                    key={batchId || idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group/batch relative px-2 py-1.5 bg-background border rounded-lg shadow-sm hover:shadow-premium transition-all border-border/60 hover:border-primary/40"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[11px] font-bold truncate pr-3">{batchName}</span>
                    </div>
                    {canManageSchedule && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await onRemoveBatch(day, slot, teacherId, batchId);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-md bg-destructive/10 text-destructive opacity-0 group-hover/batch:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {canManageSchedule && (
              <div className="flex items-center justify-center pt-1">
                 <GripVertical size={12} className="text-muted-foreground/30" />
              </div>
            )}
          </div>
        ) : !isAvailable ? (
          <div className="flex flex-col items-center justify-center py-4 opacity-40">
            <UserX size={16} className="text-destructive mb-1" />
            <span className="text-[10px] font-bold text-destructive uppercase">Unavailable</span>
          </div>
        ) : (
          <div className="flex items-center justify-center py-4 border-2 border-dashed border-border/40 rounded-xl group-hover/slot:border-primary/20 transition-colors">
            <span className="text-[10px] font-bold text-muted-foreground/30 group-hover/slot:text-primary/40 transition-colors">EMPTY</span>
          </div>
        )}
      </div>

      {/* Floating Action Button for Slot Edit */}
      {canManageSchedule && scheduleItem && (
        <button
          onClick={() => onScheduleEdit?.(scheduleItem)}
          className="absolute -bottom-2 -right-2 p-1.5 bg-background border rounded-full shadow-premium text-muted-foreground hover:text-primary opacity-0 group-hover/slot:opacity-100 transition-all z-10"
        >
          <Clock4 size={12} />
        </button>
      )}
    </div>
  );
};

export default TimeSlot;
