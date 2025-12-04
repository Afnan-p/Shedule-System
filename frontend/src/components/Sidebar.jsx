import { X, Menu, Search } from 'lucide-react';
import BatchCard from './BatchCard';

const Sidebar = ({
  open,
  onToggle,
  batches,
  selectedBatches,
  onBatchSelect,
  searchTerm,
  onSearchChange,
  subjectFilter,
  onSubjectFilterChange,
  subjects,
  onViewBatch
}) => {
  const toggleBatchSelection = (batchId) => {
    if (selectedBatches.includes(batchId)) {
      onBatchSelect(selectedBatches.filter(id => id !== batchId));
    } else {
      onBatchSelect([...selectedBatches, batchId]);
    }
  };

  const selectAll = () => {
    onBatchSelect(batches.map(b => b._id));
  };

  const clearSelection = () => {
    onBatchSelect([]);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-16 left-2 z-50 p-2 bg-white shadow-lg rounded-xl border border-gray-200"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <div
        className={`
          ${open ? 'translate-x-0' : '-translate-x-full'}
          fixed md:relative z-40
          w-80 h-full 
          bg-white/90 backdrop-blur-xl 
          border-r border-gray-200
          shadow-lg md:shadow-none
          transform transition-transform duration-300 ease-in-out
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white/60 backdrop-blur-md">
          <h2 className="text-lg font-semibold text-gray-900 tracking-wide">
            Batches
          </h2>
          <button
            onClick={onToggle}
            className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-gray-200 space-y-4 bg-white/50 backdrop-blur-md">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="
                w-full pl-10 pr-3 py-2 
                border border-gray-300 rounded-lg 
                bg-white/80 backdrop-blur 
                text-sm
                focus:ring-2 focus:ring-blue-500 
                outline-none transition
              "
            />
          </div>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => onSubjectFilterChange(e.target.value)}
            className="
              w-full px-3 py-2 
              border border-gray-300 rounded-lg 
              bg-white/80 backdrop-blur 
              text-sm
              focus:ring-2 focus:ring-blue-500 
              outline-none transition
            "
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          {/* Select Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={selectAll}
              className="
                flex-1 px-3 py-2 
                text-sm rounded-lg 
                bg-gray-100 hover:bg-gray-200 
                transition shadow-sm
              "
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="
                flex-1 px-3 py-2 
                text-sm rounded-lg 
                bg-gray-100 hover:bg-gray-200 
                transition shadow-sm
              "
            >
              Clear
            </button>
          </div>

          {/* Selected Count */}
          {selectedBatches.length > 0 && (
            <div className="text-xs text-blue-600 font-medium">
              {selectedBatches.length} batch(es) selected
            </div>
          )}
        </div>

        {/* Batch Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {batches.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              No batches found
            </div>
          ) : (
            batches.map((batch) => (
              <BatchCard
                key={batch._id}
                batch={batch}
                isSelected={selectedBatches.includes(batch._id)}
                onToggle={() => toggleBatchSelection(batch._id)}
                onView={onViewBatch}
                selectedBatches={selectedBatches}
                allBatches={batches}
              />
            ))
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
