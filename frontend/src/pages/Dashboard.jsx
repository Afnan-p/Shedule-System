import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSchedule } from '../hooks/useSchedule';
import { api } from '../utils/api';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import ScheduleGrid from '../components/ScheduleGrid';
import BatchDetailsModal from '../components/BatchDetailsModal';
import ScheduleConfigModal from '../components/ScheduleConfigModal';
import TeacherAvailabilityModal from '../components/TeacherAvailabilityModal';
import TeacherFormModal from '../components/TeacherFormModal';
import ScheduleSlotModal from '../components/ScheduleSlotModal';
import AssignBatchesModal from '../components/AssignBatchesModal';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { getTeacherId, getBatchIds } from '../utils/scheduleHelpers';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const {
    schedule,
    weekStart,
    loading,
    fetchSchedule,
    assignSchedule,
    removeSchedule,
    moveSchedule,
    checkConflicts,
    changeWeek,
    undo,
    redo,
    canUndo,
    canRedo
  } = useSchedule();

  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [configUpdated, setConfigUpdated] = useState(0);
  const [editingScheduleItem, setEditingScheduleItem] = useState(null);
  const [assignContext, setAssignContext] = useState(null);

  useEffect(() => {
    fetchData();
    fetchSchedule(weekStart, selectedBranch);
  }, [weekStart, selectedBranch]);

  const fetchData = async () => {
    try {
      const [batchesRes, teachersRes] = await Promise.all([
        api.get('/batches', { params: { branch: selectedBranch, limit: 100 } }),
        api.get('/teachers', { params: { branch: selectedBranch, limit: 100 } })
      ]);

      setBatches(batchesRes.data.data.batches || []);
      setTeachers(teachersRes.data.data.teachers || []);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    }
  };

  const handleDrop = async (day, slot, teacherId, droppedBatchIds) => {
    try {
      // Check if there's already a schedule item for this slot
      const existingSlot = schedule.find(
        item =>
          item.day === day &&
          item.slot === slot &&
          getTeacherId(item.teacherId) === teacherId
      );

      // If adding to existing slot, only check batch conflicts (batches assigned to another teacher)
      // If new slot, check all conflicts
      if (!existingSlot) {
        const conflictCheck = await checkConflicts(day, slot, teacherId, droppedBatchIds);
        
        if (conflictCheck.hasConflicts) {
          if (conflictCheck.conflicts.teacherConflict) {
            toast.error('Teacher is already assigned at this time slot');
            return;
          }
          if (conflictCheck.conflicts.batchConflicts?.length > 0) {
            toast.error('One or more batches are already assigned to another teacher');
            return;
          }
        }
      } else {
        // For existing slot, only check if batches are assigned to another teacher
        const existingBatchIds = getBatchIds(existingSlot.batchIds);
        const newBatchIds = droppedBatchIds.filter(id => !existingBatchIds.includes(id));
        
        if (newBatchIds.length > 0) {
          const conflictCheck = await checkConflicts(day, slot, teacherId, newBatchIds);
          if (conflictCheck.conflicts.batchConflicts?.length > 0) {
            toast.error('One or more batches are already assigned to another teacher');
            return;
          }
        }
      }

      await assignSchedule(day, slot, teacherId, droppedBatchIds);
      setSelectedBatches([]);
    } catch (error) {
      console.error('Drop failed:', error);
    }
  };

  const handleRemoveBatch = async (day, slot, teacherId, batchId) => {
    try {
      await removeSchedule(day, slot, teacherId, [batchId]);
    } catch (error) {
      console.error('Remove failed:', error);
    }
  };

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !subjectFilter || batch.subjects.includes(subjectFilter);
    return matchesSearch && matchesSubject;
  });

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSubject = !subjectFilter || teacher.subjects.includes(subjectFilter);
    return matchesSubject;
  });

  const allSubjects = [...new Set([
    ...batches.flatMap(b => b.subjects),
    ...teachers.flatMap(t => t.subjects)
  ])];

  const allBranches = [...new Set([
    ...batches.map(b => b.branch),
    ...teachers.map(t => t.branch)
  ])];

  const handleViewBatch = (batch) => {
    setSelectedBatch(batch);
    setShowBatchModal(true);
  };

  const handleBatchUpdate = () => {
    fetchData();
  };

  const handleTeacherAvailabilityEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setShowTeacherModal(true);
  };

  const upsertTeacher = (teacherRecord) => {
    if (!teacherRecord) return;
    setTeachers((prev) => {
      const exists = prev.some((teacher) => teacher._id === teacherRecord._id);
      if (exists) {
        return prev.map((teacher) =>
          teacher._id === teacherRecord._id ? teacherRecord : teacher
        );
      }
      return [...prev, teacherRecord];
    });
  };

  const handleTeacherUpdate = async (updatedTeacher = null) => {
    if (updatedTeacher) {
      upsertTeacher(updatedTeacher);
      if (selectedTeacher?._id === updatedTeacher._id) {
        setSelectedTeacher(updatedTeacher);
      }
      if (editingTeacher?._id === updatedTeacher._id) {
        setEditingTeacher(updatedTeacher);
      }
      // Refresh schedule when availability changes to update UI
      await fetchSchedule(weekStart, selectedBranch);
    } else {
      await fetchData();
      await fetchSchedule(weekStart, selectedBranch);
    }
  };

  const handleTeacherFormOpen = (teacher = null) => {
    setEditingTeacher(teacher);
    setShowTeacherForm(true);
  };

  const removeTeacherLocally = (teacherId) => {
    if (!teacherId) return;
    setTeachers((prev) => prev.filter((teacher) => teacher._id !== teacherId));
    if (selectedTeacher?._id === teacherId) {
      setSelectedTeacher(null);
      setShowTeacherModal(false);
    }
    if (editingTeacher?._id === teacherId) {
      setEditingTeacher(null);
      setShowTeacherForm(false);
    }
  };

  const handleTeacherDelete = async (teacher) => {
    const confirmed = window.confirm(`Delete ${teacher.name}?`);
    if (!confirmed) return;
    try {
      await api.delete(`/teachers/${teacher._id}`);
      toast.success('Teacher deleted');
      removeTeacherLocally(teacher._id);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete teacher');
    }
  };

  const handleScheduleEditOpen = (item) => {
    setEditingScheduleItem(item);
  };

  const handleScheduleMove = async (payload) => {
    try {
      await moveSchedule(payload);
      setEditingScheduleItem(null);
      // Refresh schedule to ensure UI is updated
      await fetchSchedule(weekStart, selectedBranch);
    } catch (error) {
      console.error('Move schedule failed:', error);
      // Don't close modal on error so user can retry
    }
  };

  const handleAssignRequest = ({ day, slot, teacherId }) => {
    setAssignContext({ day, slot, teacherId });
  };

  const handleAssignBatches = async (batchIds) => {
    if (!assignContext || batchIds.length === 0) return;
    try {
      // Check if there's already a schedule item for this slot
      const existingSlot = schedule.find(
        item =>
          item.day === assignContext.day &&
          item.slot === assignContext.slot &&
          getTeacherId(item.teacherId) === assignContext.teacherId
      );

      // Get existing batch IDs
      const existingBatchIds = existingSlot
        ? getBatchIds(existingSlot.batchIds)
        : [];

      // Merge with existing batches (remove duplicates)
      const allBatchIds = [...new Set([...existingBatchIds, ...batchIds])];
      
      // Only check conflicts for newly added batches
      const newBatchIds = batchIds.filter(id => !existingBatchIds.includes(id));
      
      if (newBatchIds.length > 0) {
        // Check conflicts for new batches
        const conflictCheck = await checkConflicts(
          assignContext.day,
          assignContext.slot,
          assignContext.teacherId,
          newBatchIds
        );
        
        if (conflictCheck.hasConflicts) {
          if (conflictCheck.conflicts.teacherConflict) {
            toast.error('Teacher is already assigned at this time slot');
            return;
          }
          if (conflictCheck.conflicts.batchConflicts?.length > 0) {
            toast.error('One or more batches are already assigned to another teacher');
            return;
          }
        }
      }

      // Assign all batches (including existing ones)
      await assignSchedule(
        assignContext.day,
        assignContext.slot,
        assignContext.teacherId,
        allBatchIds
      );
      setAssignContext(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await api.get(`/schedule/export/${format}`, {
        params: {
          weekStart: dayjs(weekStart).format('YYYY-MM-DD'),
          branch: selectedBranch || ''
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `schedule-${dayjs(weekStart).format('YYYY-MM-DD')}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported schedule as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error.response?.data?.error || 'Failed to export schedule');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar
        user={user}
        onLogout={logout}
        weekStart={weekStart}
        onWeekChange={changeWeek}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        branches={allBranches}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        onAddTeacher={() => handleTeacherFormOpen(null)}
        onExport={handleExport}
        onConfigClick={() => setShowConfigModal(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          batches={filteredBatches}
          selectedBatches={selectedBatches}
          onBatchSelect={setSelectedBatches}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          subjectFilter={subjectFilter}
          onSubjectFilterChange={setSubjectFilter}
          subjects={allSubjects}
          onViewBatch={handleViewBatch}
        />

        <div className="flex-1 overflow-auto p-4">
          <ScheduleGrid
            teachers={filteredTeachers}
            schedule={schedule}
            weekStart={weekStart}
            onDrop={handleDrop}
            onRemoveBatch={handleRemoveBatch}
            onMoveSchedule={handleScheduleMove}
            onScheduleEdit={handleScheduleEditOpen}
            onEditTeacher={handleTeacherFormOpen}
            onDeleteTeacher={handleTeacherDelete}
            onAssignBatch={handleAssignRequest}
            loading={loading}
            branch={selectedBranch}
            configUpdated={configUpdated}
            onEditAvailability={handleTeacherAvailabilityEdit}
            user={user}
          />
        </div>
      </div>

      {/* Batch Details Modal */}
      {showBatchModal && selectedBatch && (
        <BatchDetailsModal
          batch={selectedBatch}
          user={user}
          onClose={() => {
            setShowBatchModal(false);
            setSelectedBatch(null);
          }}
          onUpdate={handleBatchUpdate}
        />
      )}

      {/* Schedule Config Modal */}
      {showConfigModal && (
        <ScheduleConfigModal
          branch={selectedBranch || user?.branch}
          onClose={() => setShowConfigModal(false)}
          onUpdate={() => {
            setConfigUpdated(prev => prev + 1);
            fetchSchedule(weekStart, selectedBranch);
          }}
        />
      )}

      {/* Teacher Availability Modal */}
      {showTeacherModal && selectedTeacher && (
        <TeacherAvailabilityModal
          teacher={selectedTeacher}
          onClose={() => {
            setShowTeacherModal(false);
            setSelectedTeacher(null);
          }}
          onUpdate={handleTeacherUpdate}
        />
      )}

      {showTeacherForm && (
        <TeacherFormModal
          open={showTeacherForm}
          teacher={editingTeacher}
          onClose={() => setShowTeacherForm(false)}
          onSaved={handleTeacherUpdate}
          onDeleted={removeTeacherLocally}
        />
      )}

      {editingScheduleItem && (
        <ScheduleSlotModal
          open={Boolean(editingScheduleItem)}
          scheduleItem={editingScheduleItem}
          teachers={teachers}
          onClose={() => setEditingScheduleItem(null)}
          onSubmit={handleScheduleMove}
        />
      )}

      {assignContext && (
        <AssignBatchesModal
          open={Boolean(assignContext)}
          day={assignContext.day}
          slot={assignContext.slot}
          teacher={teachers.find((t) => t._id === assignContext.teacherId)}
          batches={filteredBatches}
          schedule={schedule}
          onClose={() => setAssignContext(null)}
          onConfirm={handleAssignBatches}
        />
      )}
    </div>
  );
};

export default Dashboard;

