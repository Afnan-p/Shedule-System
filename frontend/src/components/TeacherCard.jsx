import { BookOpen, Edit3, Trash2, CalendarClock } from 'lucide-react';
import TimeSlot from './TimeSlot';

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
    <div className="flex bg-white border border-gray-500 rounded-2xl shadow-sm overflow-hidden" >
      {/* Teacher info column */}
      <div className="w-52 border-r border-gray-100 p-4 bg-gradient-to-b from-gray-50 to-white relative" >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm">{teacher.name}</h3>
        <div className="mt-1 flex flex-wrap gap-1">
          {teacher.subjects.slice(0, 2).map((subject) => (
            <span
              key={subject}
              className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded flex items-center"
            >
              <BookOpen className="w-3 h-3 mr-1" />
              {subject}
            </span>
          ))}
          {teacher.subjects.length > 2 && (
            <span className="text-xs text-gray-500">+{teacher.subjects.length - 2}</span>
          )}
        </div>
            <div className="mt-1 text-xs text-gray-500">{teacher.branch}</div>
          </div>
          {canEdit && (
            <div className="flex items-center space-x-1 ml-2">
              {onEditTeacher && (
                <button
                  onClick={() => onEditTeacher(teacher)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Edit teacher details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              {onEditAvailability && (
                <button
                  onClick={() => onEditAvailability(teacher)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Edit availability"
                >
                  <CalendarClock className="w-4 h-4" />
                </button>
              )}
              {canDelete && onDeleteTeacher && (
                <button
                  onClick={() => onDeleteTeacher(teacher)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete teacher"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Day columns */}
      {days.map((day) => {
        const dayTimeSlots = getTimeSlotsForDay(day);
        return (
          <div key={day} className="flex-1 border-r border-gray-100 last:border-r-0 bg-gray-50">
            <div className="flex flex-col">
              {dayTimeSlots.map((slot) => {
                const key = `${teacher._id}-${day}-${slot}`;
                const scheduleItem = scheduleMap[key];

                // Teachers are fully available by default; entries mark unavailable times
                const isUnavailable = teacher.availability?.some(
                  (entry) => entry.day === day && entry.slot === slot
                );
                const isAvailable = !isUnavailable;

                return (
                  <TimeSlot
                    key={slot}
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
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeacherCard;

