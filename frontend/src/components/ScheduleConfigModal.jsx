import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const ScheduleConfigModal = ({ branch, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    branch: branch || '',
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

  useEffect(() => {
    fetchConfig();
  }, [branch]);

  const fetchConfig = async () => {
    if (!branch) return;
    
    setLoading(true);
    try {
      const response = await api.get('/schedule-config', { params: { branch } });
      if (response.data.data.config) {
        setConfig(response.data.data.config);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/schedule-config', config);
      toast.success('Schedule configuration saved successfully');
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const addDayGroup = () => {
    setConfig({
      ...config,
      dayGroups: [
        ...config.dayGroups,
        {
          name: `Group ${config.dayGroups.length + 1}`,
          days: [],
          timeSlots: [{ start: '08:30', end: '11:30' }]
        }
      ]
    });
  };

  const removeDayGroup = (index) => {
    setConfig({
      ...config,
      dayGroups: config.dayGroups.filter((_, i) => i !== index)
    });
  };

  const updateDayGroup = (index, field, value) => {
    const updated = [...config.dayGroups];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, dayGroups: updated });
  };

  const addTimeSlot = (dayGroupIndex) => {
    const updated = [...config.dayGroups];
    updated[dayGroupIndex].timeSlots.push({ start: '08:30', end: '11:30' });
    setConfig({ ...config, dayGroups: updated });
  };

  const removeTimeSlot = (dayGroupIndex, slotIndex) => {
    const updated = [...config.dayGroups];
    updated[dayGroupIndex].timeSlots = updated[dayGroupIndex].timeSlots.filter(
      (_, i) => i !== slotIndex
    );
    setConfig({ ...config, dayGroups: updated });
  };

  const updateTimeSlot = (dayGroupIndex, slotIndex, field, value) => {
    const updated = [...config.dayGroups];
    updated[dayGroupIndex].timeSlots[slotIndex][field] = value;
    setConfig({ ...config, dayGroups: updated });
  };

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Schedule Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">Branch: {branch}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Day Groups */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Day Groups</h3>
                <button
                  onClick={addDayGroup}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Group</span>
                </button>
              </div>

              <div className="space-y-4">
                {config.dayGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) => updateDayGroup(groupIndex, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Group Name"
                        />
                      </div>
                      <button
                        onClick={() => removeDayGroup(groupIndex)}
                        className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Days Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Days
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {allDays.map((day) => (
                          <label
                            key={day}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={group.days.includes(day)}
                              onChange={(e) => {
                                const days = e.target.checked
                                  ? [...group.days, day]
                                  : group.days.filter(d => d !== day);
                                updateDayGroup(groupIndex, 'days', days);
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Time Slots
                        </label>
                        <button
                          onClick={() => addTimeSlot(groupIndex)}
                          className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Slot</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        {group.timeSlots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateTimeSlot(groupIndex, slotIndex, 'start', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) => updateTimeSlot(groupIndex, slotIndex, 'end', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => removeTimeSlot(groupIndex, slotIndex)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleConfigModal;










