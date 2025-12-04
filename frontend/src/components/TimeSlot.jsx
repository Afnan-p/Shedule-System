import { useDrop, useDrag } from 'react-dnd';
import { X, GripVertical, Clock4 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRef } from 'react';
import { getBatchIds } from '../utils/scheduleHelpers';

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
  const currentTeacherId =
    typeof scheduleItem?.teacherId === 'object'
      ? scheduleItem.teacherId._id
      : scheduleItem?.teacherId;
  const batchIds =
    scheduleItem?.batchIds?.map((batch) =>
      typeof batch === 'object' ? batch._id : batch
    ) || [];

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['batch', 'schedule'],
    canDrop: () => Boolean(canManageSchedule),
    drop: async (item, monitor) => {
      if (!canManageSchedule) return;
      // Use batchIds from item if available (for multi-select), otherwise use batchId
      if (monitor.getItemType() === 'schedule') {
        if (!onMoveSchedule || !item.scheduleItemId) return;
        if (
          item.teacherId === teacherId &&
          item.day === day &&
          item.slot === slot
        ) {
          return;
        }
        onMoveSchedule?.({
          scheduleItemId: item.scheduleItemId,
          source: {
            day: item.day,
            slot: item.slot,
            teacherId: item.teacherId
          },
          target: { day, slot, teacherId }
        });
        return;
      }

      let incomingBatchIds = item.batchIds || [item.batchId];
      
      // Ensure we have at least one batch
      if (!Array.isArray(incomingBatchIds) || incomingBatchIds.length === 0) {
        if (item.batchId) {
          incomingBatchIds = [item.batchId];
        } else {
          toast.error('No batch selected');
          return;
        }
      }
      
      if (!isAvailable && !scheduleItem) {
        toast.error('Teacher is not available at this time slot');
        return;
      }

      // If there are existing batches in this slot, merge with them (avoid duplicates)
      const existingBatchIds = batchIds;
      
      // Merge new batches with existing ones, removing duplicates
      // Backend will also handle merging, but frontend merge ensures we send all at once
      const allBatchIds = [...new Set([...existingBatchIds, ...incomingBatchIds])];

      try {
        await onDrop?.(day, slot, teacherId, allBatchIds);
      } catch (error) {
        console.error('Drop failed:', error);
        toast.error('Failed to assign batches. Please try again.');
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
      item: {
        scheduleItemId: scheduleItem?._id,
        day,
        slot,
        teacherId
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    }),
    [canManageSchedule, scheduleItem, day, slot, teacherId]
  );

  drop(slotRef);
  if (scheduleItem) {
    drag(scheduleRef);
  }

  const getStatusColor = () => {
    if (scheduleItem) {
      if (scheduleItem.batchIds?.length > 0) {
        return 'bg-green-50 border-green-300';
      }
      return 'bg-yellow-50 border-yellow-300';
    }
    if (isAvailable) {
      return 'bg-gray-50 border-gray-200';
    }
    return 'bg-red-50 border-red-200';
  };

  return (
    <div
      ref={slotRef}
      className={`
        w-full min-h-[80px] p-1 border
        ${getStatusColor()}
        ${isOver && canDrop ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
        ${isDragging ? 'opacity-60' : 'opacity-100'}
        transition-all duration-150
        relative
      `}
    >
      {scheduleItem?.batchIds?.length > 0 ? (
        <div ref={scheduleRef} className="space-y-1 cursor-move pt-5">
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-gray-500 tracking-wide">
            {slot.replace('-', ' – ')}
          </div>
          {canManageSchedule && onScheduleEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onScheduleEdit(scheduleItem);
              }}
              className="absolute top-1 right-1 p-1 bg-white border border-gray-200 rounded-full shadow-sm text-gray-600 hover:bg-gray-50"
              title="Change time / teacher"
            >
              <Clock4 className="w-3 h-3" />
            </button>
          )}
          {canManageSchedule && (
            <div className="absolute top-1 left-1 text-gray-400 flex items-center space-x-1 text-[10px] uppercase tracking-wide">
              <GripVertical className="w-3 h-3" />
              <span>Drag</span>
            </div>
          )}
          {scheduleItem.batchIds.map((batch, idx) => {
            const batchId = typeof batch === 'object' ? batch._id : batch;
            const batchName = typeof batch === 'object' ? batch.name : 'Batch';
            const batchSize = typeof batch === 'object' ? batch.size : 0;
            return (
              <div
                key={batchId || idx}
                className="group relative px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:shadow-md transition-shadow"
              >
                <div className="font-medium text-gray-900 truncate">
                  {batchName}
                </div>
                <div className="text-gray-500 text-[10px]">
                  {batchSize} students
                </div>
                <button
                  onClick={async () => {
                    try {
                      await onRemoveBatch(day, slot, teacherId, batchId);
                    } catch (error) {
                      console.error('Remove batch failed:', error);
                    }
                  }}
                  className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove batch"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-[11px] text-gray-500 text-center pt-2 space-y-2">
          <div className="font-semibold text-gray-600">{slot.replace('-', ' – ')}</div>
          {isAvailable ? (
            canManageSchedule && (
              <button
                onClick={() => onAssignRequest?.({ day, slot, teacherId })}
                className="px-2 py-1 text-[10px] bg-white border border-dashed border-blue-300 text-blue-600 rounded-full hover:bg-blue-50"
              >
                + Assign
              </button>
            )
          ) : (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-semibold bg-red-50 text-red-600 rounded-full border border-red-100">
              Unavailable
            </span>
          )}
        </div>
      )}
      {canManageSchedule && scheduleItem && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAssignRequest?.({ day, slot, teacherId });
          }}
          className="absolute bottom-1 right-1 text-[9px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
        >
          + Assign
        </button>
      )}
    </div>
  );
};

export default TimeSlot;

