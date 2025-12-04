import { useEffect, useMemo, useState } from 'react';
import { X, CheckSquare, Square, Search, Users } from 'lucide-react';

const AssignBatchesModal = ({
  open,
  day,
  slot,
  teacher,
  batches = [],
  schedule = [],
  onClose,
  onConfirm
}) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const scheduledBatchIds = useMemo(() => {
    const target = schedule.find(
      (item) =>
        item.teacherId?._id === teacher?._id && item.day === day && item.slot === slot
    );
    return target?.batchIds?.map((b) => (typeof b === 'object' ? b._id : b)) || [];
  }, [schedule, teacher, day, slot]);

  const toggleBatch = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((batchId) => batchId !== id) : [...prev, id]
    );
  };

  const filteredBatches = useMemo(() => {
    const lower = search.toLowerCase();
    return batches
      .filter((batch) => (teacher?.branch ? batch.branch === teacher.branch : true))
      .filter(
        (batch) =>
          batch.name.toLowerCase().includes(lower) ||
          batch.subjects.some((subject) => subject.toLowerCase().includes(lower))
      )
      .map((batch) => ({
        ...batch,
        isAssignedElsewhere: schedule.some(
          (item) =>
            item.day === day &&
            item.slot === slot &&
            item.teacherId?._id !== teacher?._id &&
            item.batchIds.some((b) => (typeof b === 'object' ? b._id : b) === batch._id)
        )
      }));
  }, [batches, search, teacher, schedule, day, slot]);

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setSearch('');
    }
  }, [open]);

  const handleConfirm = () => {
    const uniqueIds = Array.from(new Set([...scheduledBatchIds, ...selectedIds]));
    onConfirm?.(uniqueIds);
    setSelectedIds([]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Batches</h2>
            <p className="text-sm text-gray-500 mt-1">
              {teacher?.name} • {day} • {slot}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 border-b border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batches or subjects…"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="text-xs text-gray-500">
            Tip: select multiple batches and press “Assign batches” to drop them all
            at once.
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {filteredBatches.length === 0 ? (
            <div className="text-center text-gray-400 py-12 border border-dashed border-gray-200 rounded-xl">
              No batches match your query
            </div>
          ) : (
            filteredBatches.map((batch) => {
              const isScheduled = scheduledBatchIds.includes(batch._id);
              const isNewlySelected = selectedIds.includes(batch._id);
              const isSelected = isScheduled || isNewlySelected;
              const Icon = isSelected ? CheckSquare : Square;
              return (
                <button
                  key={batch._id}
                  onClick={() => toggleBatch(batch._id)}
                  disabled={batch.isAssignedElsewhere}
                  className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/40'
                  } ${batch.isAssignedElsewhere ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-5 h-5 ${
                        isSelected
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{batch.name}</p>
                      <p className="text-xs text-gray-500">
                        {batch.subjects.join(', ')} • {batch.branch}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{batch.size} students</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            {scheduledBatchIds.length} already assigned • {selectedIds.length} newly
            selected
          </div>
          <div className="space-x-2">
            <button
              onClick={() => {
                setSelectedIds([]);
                onClose?.();
              }}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={scheduledBatchIds.length + selectedIds.length === 0}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              Assign batches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignBatchesModal;

