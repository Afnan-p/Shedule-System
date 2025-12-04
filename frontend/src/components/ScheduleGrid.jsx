import { useState, useMemo, useEffect } from 'react';
import TeacherCard from './TeacherCard';
import dayjs from 'dayjs';
import { api } from '../utils/api';
import { getTeacherId } from '../utils/scheduleHelpers';

const ScheduleGrid = ({
  teachers,
  schedule,
  weekStart,
  onDrop,
  onRemoveBatch,
  onMoveSchedule,
  onScheduleEdit,
  onEditTeacher,
  onDeleteTeacher,
  onAssignBatch,
  loading,
  branch,
  configUpdated,
  onEditAvailability,
  user
}) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const [scheduleConfig, setScheduleConfig] = useState(null);

  useEffect(() => {
    if (branch) {
      fetchConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch, configUpdated]);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/schedule-config', { params: { branch } });
      if (response.data.data.config) {
        setScheduleConfig(response.data.data.config);
      }
    } catch (error) {
      console.error('Failed to fetch schedule config:', error);
      // Use default config
      setScheduleConfig({
        dayGroups: [
          {
            name: 'Mon-Wed-Fri',
            days: ['Mon', 'Wed', 'Fri'],
            timeSlots: [
              { start: '08:30', end: '11:30' },
              { start: '11:30', end: '14:30' },
              { start: '14:30', end: '17:00' }
            ]
          },
          {
            name: 'Tue-Thu-Sat',
            days: ['Tue', 'Thu', 'Sat'],
            timeSlots: [
              { start: '08:30', end: '11:30' },
              { start: '11:30', end: '14:30' },
              { start: '14:30', end: '17:00' }
            ]
          }
        ],
        defaultTimeSlots: [
          { start: '08:30', end: '11:30' },
          { start: '11:30', end: '14:30' },
          { start: '14:30', end: '17:00' }
        ]
      });
    }
  };

  // Get time slots for a specific day
  const getTimeSlotsForDay = (day) => {
    if (!scheduleConfig) {
      // Default slots
      return ['08:30-11:30', '11:30-14:30', '14:30-17:00'];
    }

    // Find day group that contains this day
    const dayGroup = scheduleConfig.dayGroups?.find(group => group.days.includes(day));
    
    if (dayGroup && dayGroup.timeSlots?.length > 0) {
      return dayGroup.timeSlots.map(slot => `${slot.start}-${slot.end}`);
    }
    
    // Fallback to default time slots
    if (scheduleConfig.defaultTimeSlots?.length > 0) {
      return scheduleConfig.defaultTimeSlots.map(slot => `${slot.start}-${slot.end}`);
    }

    return ['08:30-11:30', '11:30-14:30', '14:30-17:00'];
  };

  // Group schedule by teacher, day, and slot
  const scheduleMap = useMemo(() => {
    const map = {};
    schedule.forEach((item) => {
      const teacherId = getTeacherId(item.teacherId);
      if (teacherId) {
        const key = `${teacherId}-${item.day}-${item.slot}`;
        map[key] = item;
      }
    });
    return map;
  }, [schedule]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const canManage = user?.role === 'admin' || user?.role === 'scheduler';

  return (
    <div className="overflow-x-auto space-y-4">
      {canManage && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 flex items-center justify-between shadow-sm">
          <p>
            Drag one or more selected batches into any slot, or use the “+ Assign” button
            to add several batches in one go.
          </p>
          <span className="font-semibold">{dayjs(weekStart).format('MMM DD')} week</span>
        </div>
      )}
      <div className="min-w-full">
        {/* Header row */}
        <div className="sticky top-0 bg-gray-100 z-10 border-b border-gray-300">
          <div className="flex">
            <div className="w-48 border-r border-gray-300 p-2 font-semibold text-sm">
              Teacher
            </div>
            {days.map((day) => {
              const dayTimeSlots = getTimeSlotsForDay(day);
              return (
                <div key={day} className="flex-1 border-r border-gray-300 last:border-r-0">
                  <div className="p-2 text-center font-semibold text-sm border-b border-gray-300">
                    {day}
                  </div>
                  <div className="flex flex-col">
                    {dayTimeSlots.map((slot) => (
                      <div
                        key={slot}
                        className="p-1 text-xs text-center border-b border-gray-200 last:border-b-0"
                        title={slot}
                      >
                        {slot.replace('-', ' – ')}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Teacher rows */}
        <div className="space-y-4 py-4">
          {teachers.map((teacher) => (
            <TeacherCard
              key={teacher._id}
              teacher={teacher}
              days={days}
              getTimeSlotsForDay={getTimeSlotsForDay}
              scheduleMap={scheduleMap}
              onDrop={onDrop}
              onRemoveBatch={onRemoveBatch}
              onMoveSchedule={onMoveSchedule}
              onScheduleEdit={onScheduleEdit}
              onEditTeacher={onEditTeacher}
              onDeleteTeacher={onDeleteTeacher}
              onAssignBatch={onAssignBatch}
              onEditAvailability={onEditAvailability}
              user={user}
              canManageSchedule={canManage}
            />
          ))}
        </div>

        {teachers.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No teachers found. Please add teachers or adjust filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleGrid;

