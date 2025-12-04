import { useEffect, useMemo, useState } from 'react';
import { X, Save, Clock4 } from 'lucide-react';
import toast from 'react-hot-toast';

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
      setTeacherId(scheduleItem.teacherId?._id || scheduleItem.teacherId);
    }
  }, [scheduleItem, open]);

  const slotPresets = useMemo(() => {
    const availabilitySlots =
      scheduleItem?.teacherId?.availability?.map((slot) => slot.slot) || [];
    const defaults = ['08:30-11:30', '11:30-14:30', '14:30-17:00'];
    return [...new Set([`${startTime}-${endTime}`, ...availabilitySlots, ...defaults])];
  }, [scheduleItem, startTime, endTime]);

  if (!open || !scheduleItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId || !startTime || !endTime) {
      toast.error('Please fill all fields');
      return;
    }
    if (startTime >= endTime) {
      toast.error('Start time must be before end time');
      return;
    }
    setSaving(true);
    try {
      await onSubmit?.({
        scheduleItemId: scheduleItem._id,
        source: {
          day: scheduleItem.day,
          slot: scheduleItem.slot,
          teacherId: scheduleItem.teacherId?._id || scheduleItem.teacherId
        },
        target: { day, slot: `${startTime}-${endTime}`, teacherId }
      });
      onClose?.();
    } catch (error) {
      console.error('Failed to update schedule:', error);
      // Error toast is handled by parent component
    } finally {
      setSaving(false);
    }
  };

  const teacherOptions = teacherId && !teachers.some((t) => t._id === teacherId)
    ? [
        {
          _id: teacherId,
          name: scheduleItem.teacherId?.name || 'Current teacher',
          branch: scheduleItem.teacherId?.branch || ''
        },
        ...teachers
      ]
    : teachers;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Clock4 className="w-5 h-5 text-blue-600" />
              <span>Change Schedule Time</span>
            </h2>
            <p className="text-sm text-gray-500">
              {scheduleItem.batchIds?.map((b) => b.name).join(', ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time span
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500">to</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {slotPresets.map((preset) => {
                const [presetStart, presetEnd] = preset.split('-');
                const isActive = presetStart === startTime && presetEnd === endTime;
                return (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => {
                      setStartTime(presetStart);
                      setEndTime(presetEnd);
                    }}
                    className={`px-3 py-1 rounded-full border text-sm transition ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {presetStart} – {presetEnd}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {teacherOptions.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name} • {teacher.branch}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="flex items-center justify-end px-6 py-4 border-t space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSlotModal;

