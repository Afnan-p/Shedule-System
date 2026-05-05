import { BookOpen, Edit3, Trash2, CalendarClock, MoreVertical } from 'lucide-react';
import TimeSlot from './TimeSlot';
import { cn } from './ui/Button';
import { motion } from 'framer-motion';

const TeacherCard = ({
  teacher,
  days,
  getTimeSlotsForDay,
  scheduleMap,
  onDrop,
  onRemoveBatch,
  onMoveSchedule,
  onScheduleEdit,
  onEditTeacher,
  onDeleteTeacher,
  onEditAvailability,
  onAssignBatch,
  user,
  canManageSchedule
}) => {
  const canEdit = user?.role === 'admin' || user?.role === 'scheduler';
  const canDelete = user?.role === 'admin';

  return (
    <div className="flex bg-card border rounded-2xl shadow-sm overflow-hidden group/teacher transition-all duration-300 hover:shadow-premium border-border/60 hover:border-primary/20">
      {/* Teacher info column */}
      <div className="w-56 border-r border-border/40 p-4 bg-muted/5 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm shrink-0">
              {teacher.name?.[0]?.toUpperCase() || 'T'}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm tracking-tight truncate">{teacher.name}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{teacher.branch}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {teacher.subjects.slice(0, 2).map((subject) => (
              <span
                key={subject}
                className="text-[10px] px-2 py-0.5 bg-primary/5 text-primary rounded-full font-bold flex items-center border border-primary/10"
              >
                <BookOpen size={10} className="mr-1" />
                {subject}
              </span>
            ))}
            {teacher.subjects.length > 2 && (
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                +{teacher.subjects.length - 2}
              </span>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-1 pt-4 opacity-0 group-hover/teacher:opacity-100 transition-opacity">
            <button
              onClick={() => onEditTeacher(teacher)}
              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              title="Edit teacher"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onEditAvailability(teacher)}
              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              title="Availability"
            >
              <CalendarClock size={14} />
            </button>
            {canDelete && (
              <button
                onClick={() => onDeleteTeacher(teacher)}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Day columns */}
      <div className="flex flex-1 overflow-x-auto">
        {days.map((day) => {
          const dayTimeSlots = getTimeSlotsForDay(day);
          return (
            <div key={day} className="flex-1 min-w-[120px] border-r border-border/30 last:border-r-0">
              <div className="flex flex-col h-full">
                {dayTimeSlots.map((slot) => {
                  const key = `${teacher._id}-${day}-${slot}`;
                  const scheduleItem = scheduleMap[key];

                  // Teachers are fully available by default; entries mark unavailable times
                  const isUnavailable = teacher.availability?.some(
                    (entry) => entry.day === day && entry.slot === slot
                  );
                  const isAvailable = !isUnavailable;

                  return (
                    <div key={slot} className="flex-1 border-b border-border/20 last:border-b-0 min-h-[80px]">
                      <TimeSlot
                        day={day}
                        slot={slot}
                        teacherId={teacher._id}
                        scheduleItem={scheduleItem}
                        isAvailable={isAvailable}
                        onDrop={onDrop}
                        onRemoveBatch={onRemoveBatch}
                        onMoveSchedule={onMoveSchedule}
                        onScheduleEdit={onScheduleEdit}
                        onAssignRequest={onAssignBatch}
                        canManageSchedule={canManageSchedule}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherCard;
