import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Save, XCircle } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const BatchDetailsModal = ({ batch, onClose, onUpdate, user }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    rollNumber: '',
    phone: ''
  });

  useEffect(() => {
    if (batch) {
      fetchBatchDetails();
    }
  }, [batch]);

  const fetchBatchDetails = async () => {
    if (!batch) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/batches/${batch._id}`);
      setStudents(response.data.data.batch.students || []);
    } catch (error) {
      toast.error('Failed to fetch batch details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    if (!newStudent.name.trim()) {
      toast.error('Student name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/batches/${batch._id}/students`, newStudent);
      setStudents(response.data.data.batch.students || []);
      setNewStudent({ name: '', email: '', rollNumber: '', phone: '' });
      setShowAddForm(false);
      toast.success('Student added successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete(`/batches/${batch._id}/students/${studentId}`);
      setStudents(response.data.data.batch.students || []);
      toast.success('Student removed successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove student');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (studentId, updatedData) => {
    setLoading(true);
    try {
      const response = await api.put(`/batches/${batch._id}/students/${studentId}`, updatedData);
      setStudents(response.data.data.batch.students || []);
      setEditingStudent(null);
      toast.success('Student updated successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'scheduler';

  if (!batch) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{batch.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {batch.branch} • {students.length} students
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
          {/* Subjects */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {batch.subjects.map((subject) => (
                <span
                  key={subject}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>

          {/* Students Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Students</h3>
              {canEdit && (
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Student</span>
                </button>
              )}
            </div>

            {/* Add Student Form */}
            {showAddForm && canEdit && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <form onSubmit={handleAddStudent}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Student Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        value={newStudent.rollNumber}
                        onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Roll Number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={newStudent.phone}
                        onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add Student
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewStudent({ name: '', email: '', rollNumber: '', phone: '' });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Students List */}
            {loading && students.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students added yet
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student, index) => (
                  <StudentRow
                    key={student._id || index}
                    student={student}
                    canEdit={canEdit}
                    isEditing={editingStudent === student._id}
                    onEdit={() => setEditingStudent(student._id)}
                    onCancel={() => setEditingStudent(null)}
                    onSave={(data) => handleUpdateStudent(student._id, data)}
                    onDelete={() => handleDeleteStudent(student._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentRow = ({ student, canEdit, isEditing, onEdit, onCancel, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    name: student.name || '',
    email: student.email || '',
    rollNumber: student.rollNumber || '',
    phone: student.phone || ''
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    onSave(formData);
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Name *"
          />
          <input
            type="text"
            value={formData.rollNumber}
            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Roll Number"
          />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
          />
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Phone"
          />
        </div>
        <div className="flex space-x-2 mt-3">
          <button
            onClick={handleSave}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button
            onClick={onCancel}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">{student.name || 'N/A'}</p>
            <p className="text-xs text-gray-500">Name</p>
          </div>
          <div>
            <p className="text-sm text-gray-700">{student.rollNumber || 'N/A'}</p>
            <p className="text-xs text-gray-500">Roll Number</p>
          </div>
          <div>
            <p className="text-sm text-gray-700">{student.email || 'N/A'}</p>
            <p className="text-xs text-gray-500">Email</p>
          </div>
          <div>
            <p className="text-sm text-gray-700">{student.phone || 'N/A'}</p>
            <p className="text-xs text-gray-500">Phone</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex space-x-2 ml-4">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchDetailsModal;









