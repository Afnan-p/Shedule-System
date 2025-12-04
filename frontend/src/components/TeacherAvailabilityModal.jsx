import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Edit2 } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const TeacherAvailabilityModal = ({ teacher, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newSlot, setNewSlot] = useState({ day: 'Mon', slot: '08:30-11:30' });

  useEffect(() => {
    if (teacher) {
      setAvailability(teacher.availability || []);
    }
  }, [teacher]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put(`/teachers/${teacher._id}`, {
        availability
      });
      toast.success('Teacher availability updated successfully');
      const updatedTeacher = response.data?.data?.teacher || null;
      if (updatedTeacher) {
        setAvailability(updatedTeacher.availability || []);
      }
      if (onUpdate) onUpdate(updatedTeacher);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  const addSlot = () => {
    // Check if slot already exists
    const exists = availability.some(
      a => a.day === newSlot.day && a.slot === newSlot.slot
    );
    
    if (exists) {
      toast.error('This slot already exists');
      return;
    }

    setAvailability([...availability, { ...newSlot }]);
    setNewSlot({ day: 'Mon', slot: '08:30-11:30' });
  };

  const removeSlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
    setEditingIndex(null);
  };

  const startEdit = (index) => {
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  if (!teacher) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{teacher.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Teachers are fully available by default. Add slots below to block out time • {teacher.branch}
            </p>
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
          {/* Info */}
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Remove or add entries below to mark when this teacher is <span className="font-semibold">unavailable</span>. No entries means they can teach any time.
          </div>

          {/* Current Unavailability */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blocked Time Slots</h3>
            
            {availability.length === 0 ? (
              <div className="text-center text-gray-500 py-8 border border-dashed border-gray-300 rounded-lg">
                No blocked slots — this teacher is fully available.
              </div>
            ) : (
              <div className="space-y-2">
                {availability.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    {editingIndex === index ? (
                      <div className="flex items-center space-x-3 flex-1">
                        <select
                          value={slot.day}
                          onChange={(e) => updateSlot(index, 'day', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {days.map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={slot.slot}
                          onChange={(e) => updateSlot(index, 'slot', e.target.value)}
                          placeholder="08:30-11:30"
                          pattern="^\d{2}:\d{2}-\d{2}:\d{2}$"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-gray-900 min-w-[60px]">{slot.day}</span>
                          <span className="text-gray-700">{slot.slot}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(index)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeSlot(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Slot */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Unavailable Slot</h3>
            <div className="flex items-center space-x-3">
              <select
                value={newSlot.day}
                onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <input
                type="text"
                value={newSlot.slot}
                onChange={(e) => setNewSlot({ ...newSlot, slot: e.target.value })}
                placeholder="08:30-11:30"
                pattern="^\d{2}:\d{2}-\d{2}:\d{2}$"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
              />
              <button
                onClick={addSlot}
                className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Format: HH:mm-HH:mm (e.g., 08:30-11:30, 14:30-17:00)
            </p>
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
            <span>Save Availability</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherAvailabilityModal;






