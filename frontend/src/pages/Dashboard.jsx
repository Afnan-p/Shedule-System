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
import ConfirmationModal from '../components/ui/ConfirmationModal';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { getTeacherId, getBatchIds } from '../utils/scheduleHelpers';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // Confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    }
  };

  const handleDrop = async (day, slot, teacherId, droppedBatchIds) => {
    try {
      const existingSlot = schedule.find(
        item => item.day === day && item.slot === slot && getTeacherId(item.teacherId) === teacherId
      );

      if (!existingSlot) {
        const conflictCheck = await checkConflicts(day, slot, teacherId, droppedBatchIds);
        if (conflictCheck.hasConflicts) {
          if (conflictCheck.conflicts.teacherConflict) return toast.error('Teacher is already assigned at this time slot');
          if (conflictCheck.conflicts.batchConflicts?.length > 0) return toast.error('One or more batches are already assigned to another teacher');
        }
      } else {
        const existingBatchIds = getBatchIds(existingSlot.batchIds);
        const newBatchIds = droppedBatchIds.filter(id => !existingBatchIds.includes(id));
        if (newBatchIds.length > 0) {
          const conflictCheck = await checkConflicts(day, slot, teacherId, newBatchIds);
          if (conflictCheck.conflicts.batchConflicts?.length > 0) return toast.error('One or more batches are already assigned to another teacher');
        }
      }

      await assignSchedule(day, slot, teacherId, droppedBatchIds);
      setSelectedBatches([]);
      toast.success('Batch(es) assigned successfully');
    } catch (error) {
      console.error('Drop failed:', error);
    }
  };

  const handleRemoveBatch = async (day, slot, teacherId, batchId) => {
    try {
      await removeSchedule(day, slot, teacherId, [batchId]);
      toast.success('Batch removed');
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

  const handleTeacherAvailabilityEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setShowTeacherModal(true);
  };

  const handleTeacherUpdate = async (updatedTeacher = null) => {
    if (updatedTeacher) {
      setTeachers(prev => {
        const exists = prev.some(t => t._id === updatedTeacher._id);
        return exists ? prev.map(t => t._id === updatedTeacher._id ? updatedTeacher : t) : [...prev, updatedTeacher];
      });
      if (selectedTeacher?._id === updatedTeacher._id) setSelectedTeacher(updatedTeacher);
      if (editingTeacher?._id === updatedTeacher._id) setEditingTeacher(updatedTeacher);
      await fetchSchedule(weekStart, selectedBranch);
    } else {
      await fetchData();
      await fetchSchedule(weekStart, selectedBranch);
    }
  };

  const handleTeacherDeleteRequest = (teacher) => {
    setTeacherToDelete(teacher);
    setDeleteConfirmOpen(true);
  };

  const handleTeacherDelete = async () => {
    if (!teacherToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/teachers/${teacherToDelete._id}`);
      toast.success('Teacher deleted successfully');
      setTeachers(prev => prev.filter(t => t._id !== teacherToDelete._id));
      setDeleteConfirmOpen(false);
      setTeacherToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete teacher');
    } finally {
      setIsDeleting(false);
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
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
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
        onAddTeacher={() => { setEditingTeacher(null); setShowTeacherForm(true); }}
        onExport={handleExport}
        onConfigClick={() => setShowConfigModal(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
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

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
          <div className="p-6 max-w-[1600px] mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground mt-1">Manage and optimize your institution's weekly schedule.</p>
            </header>

            <ScheduleGrid
              teachers={filteredTeachers}
              schedule={schedule}
              weekStart={weekStart}
              onDrop={handleDrop}
              onRemoveBatch={handleRemoveBatch}
              onMoveSchedule={async (p) => { await moveSchedule(p); setEditingScheduleItem(null); await fetchSchedule(weekStart, selectedBranch); }}
              onScheduleEdit={setEditingScheduleItem}
              onEditTeacher={(t) => { setEditingTeacher(t); setShowTeacherForm(true); }}
              onDeleteTeacher={handleTeacherDeleteRequest}
              onAssignBatch={setAssignContext}
              loading={loading}
              branch={selectedBranch}
              configUpdated={configUpdated}
              onEditAvailability={handleTeacherAvailabilityEdit}
              user={user}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showBatchModal && selectedBatch && (
          <BatchDetailsModal
            batch={selectedBatch}
            user={user}
            onClose={() => { setShowBatchModal(false); setSelectedBatch(null); }}
            onUpdate={fetchData}
          />
        )}
        
        {showConfigModal && (
          <ScheduleConfigModal
            branch={selectedBranch || user?.branch}
            onClose={() => setShowConfigModal(false)}
            onUpdate={() => { setConfigUpdated(prev => prev + 1); fetchSchedule(weekStart, selectedBranch); }}
          />
        )}

        {showTeacherModal && selectedTeacher && (
          <TeacherAvailabilityModal
            teacher={selectedTeacher}
            onClose={() => { setShowTeacherModal(false); setSelectedTeacher(null); }}
            onUpdate={handleTeacherUpdate}
          />
        )}

        {showTeacherForm && (
          <TeacherFormModal
            open={showTeacherForm}
            teacher={editingTeacher}
            onClose={() => setShowTeacherForm(false)}
            onSaved={handleTeacherUpdate}
            onDeleted={(id) => setTeachers(prev => prev.filter(t => t._id !== id))}
          />
        )}

        {editingScheduleItem && (
          <ScheduleSlotModal
            open={Boolean(editingScheduleItem)}
            scheduleItem={editingScheduleItem}
            teachers={teachers}
            onClose={() => setEditingScheduleItem(null)}
            onSubmit={async (p) => { await moveSchedule(p); setEditingScheduleItem(null); await fetchSchedule(weekStart, selectedBranch); }}
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
            onConfirm={async (batchIds) => {
              if (!assignContext || batchIds.length === 0) return;
              const existingSlot = schedule.find(item => item.day === assignContext.day && item.slot === assignContext.slot && getTeacherId(item.teacherId) === assignContext.teacherId);
              const allBatchIds = [...new Set([...(existingSlot ? getBatchIds(existingSlot.batchIds) : []), ...batchIds])];
              await assignSchedule(assignContext.day, assignContext.slot, assignContext.teacherId, allBatchIds);
              setAssignContext(null);
              toast.success('Batches assigned');
            }}
          />
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleTeacherDelete}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${teacherToDelete?.name}? All their assigned schedules will be affected.`}
        loading={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
