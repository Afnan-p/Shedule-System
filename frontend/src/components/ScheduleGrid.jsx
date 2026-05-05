import { useState, useMemo, useEffect } from 'react';
import TeacherCard from './TeacherCard';
import dayjs from 'dayjs';
import { api } from '../utils/api';
import { getTeacherId } from '../utils/scheduleHelpers';
import { Skeleton } from './ui/Skeleton';
import { Info, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

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
    if (branch) fetchConfig();
  }, [branch, configUpdated]);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/schedule-config', { params: { branch } });
      if (response.data.data.config) setScheduleConfig(response.data.data.config);
    } catch (error) {
      console.error('Failed to fetch schedule config:', error);
      setScheduleConfig({
        defaultTimeSlots: [
          { start: '08:30', end: '11:30' },
          { start: '11:30', end: '14:30' },
          { start: '14:30', end: '17:00' }
        ]
      });
    }
  };

  const getTimeSlotsForDay = (day) => {
    if (!scheduleConfig) return ['08:30-11:30', '11:30-14:30', '14:30-17:00'];
    const dayGroup = scheduleConfig.dayGroups?.find(group => group.days.includes(day));
    if (dayGroup && dayGroup.timeSlots?.length > 0) return dayGroup.timeSlots.map(slot => `${slot.start}-${slot.end}`);
    if (scheduleConfig.defaultTimeSlots?.length > 0) return scheduleConfig.defaultTimeSlots.map(slot => `${slot.start}-${slot.end}`);
    return ['08:30-11:30', '11:30-14:30', '14:30-17:00'];
  };

  const scheduleMap = useMemo(() => {
    const map = {};
    schedule.forEach((item) => {
      const tId = getTeacherId(item.teacherId);
      if (tId) map[`${tId}-${item.day}-${item.slot}`] = item;
    });
    return map;
  }, [schedule]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const canManage = user?.role === 'admin' || user?.role === 'scheduler';

  return (
    <div className="space-y-6">
      {canManage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass bg-primary/5 border-primary/20 rounded-2xl p-4 flex items-center gap-4 text-primary shadow-sm"
        >
          <div className="p-2 bg-primary/10 rounded-xl">
            <Info size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold tracking-tight">Pro Tip: Multi-Batch Dragging</p>
            <p className="text-xs font-medium opacity-80">Select multiple batches from the sidebar and drag them together to assign all at once.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full text-xs font-bold">
            <Calendar size={12} />
            <span>{dayjs(weekStart).format('MMMM D, YYYY')}</span>
          </div>
        </motion.div>
      )}

      <div className="bg-background rounded-3xl border border-border/60 shadow-premium overflow-hidden">
        {/* Table Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b flex">
          <div className="w-56 p-4 font-bold text-xs uppercase tracking-widest text-muted-foreground border-r border-border/40">
            Teacher Details
          </div>
          <div className="flex flex-1">
            {days.map((day) => {
              const dayTimeSlots = getTimeSlotsForDay(day);
              return (
                <div key={day} className="flex-1 min-w-[120px] border-r border-border/40 last:border-r-0">
                  <div className="p-3 text-center font-bold text-xs uppercase tracking-wider bg-muted/30 border-b">
                    {day}
                  </div>
                  <div className="flex flex-col">
                    {dayTimeSlots.map((slot) => (
                      <div key={slot} className="p-1.5 text-[9px] font-bold text-center text-muted-foreground/60 border-b border-border/20 last:border-b-0 uppercase">
                        {slot.replace('-', ' - ')}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Teacher rows */}
        <div className="divide-y divide-border/40">
          {teachers.map((teacher, index) => (
            <motion.div
              key={teacher._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-muted/5"
            >
              <TeacherCard
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
            </motion.div>
          ))}
        </div>

        {teachers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-muted p-6 rounded-full mb-4">
              <Calendar size={48} className="text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold">No Teachers Found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1">
              Try adjusting your filters or add a new teacher to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleGrid;
