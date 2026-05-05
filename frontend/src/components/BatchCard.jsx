import { useDrag } from 'react-dnd';
import { Users, Eye, GripVertical, CheckCircle2 } from 'lucide-react';
import { cn } from './ui/Button';

const BatchCard = ({ batch, isSelected, onToggle, onView, selectedBatches }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'batch',
    item: () => {
      const batchIdsToDrag =
        selectedBatches && selectedBatches.length > 1
          ? selectedBatches
          : [batch._id];

      return {
        batchId: batch._id,
        batch,
        batchIds: batchIdsToDrag,
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [batch, selectedBatches]);

  const handleViewClick = (e) => {
    e.stopPropagation();
    if (onView) onView(batch);
  };

  return (
    <div
      ref={drag}
      onClick={onToggle}
      className={cn(
        "group relative p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all duration-300 border shadow-sm",
        isSelected 
          ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
          : "border-border bg-card hover:border-primary/50 hover:shadow-premium",
        isDragging ? "opacity-40 scale-95 border-dashed border-primary" : "opacity-100 scale-100"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="mt-1 text-muted-foreground group-hover:text-primary transition-colors">
          <GripVertical size={16} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm tracking-tight truncate">
              {batch.name}
            </h3>
            {isSelected && (
              <CheckCircle2 size={16} className="text-primary shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">
              <Users size={12} />
              <span>{batch.size}</span>
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{batch.branch}</span>
          </div>

          {/* Subjects */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {batch.subjects.slice(0, 2).map((subject) => (
              <span
                key={subject}
                className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold border border-primary/20"
              >
                {subject}
              </span>
            ))}
            {batch.subjects.length > 2 && (
              <span className="text-[10px] font-bold text-muted-foreground px-1">
                +{batch.subjects.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleViewClick}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            title="View Details"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchCard;
