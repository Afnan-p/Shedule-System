import { useDrag } from 'react-dnd';
import { Users, Eye } from 'lucide-react';

const BatchCard = ({ batch, isSelected, onToggle, onView, selectedBatches }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'batch',
    item: () => {
      const batchIdsToDrag =
        selectedBatches && selectedBatches.length > 1
          ? selectedBatches
          : [batch._id];

      return {
        batchId: batch._id,
        batch,
        batchIds: batchIdsToDrag,
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [batch, selectedBatches]);

  const handleViewClick = (e) => {
    e.stopPropagation();
    if (onView) onView(batch);
  };

  return (
    <div
      ref={drag}
      onClick={onToggle}
      className={`
        group relative p-4 rounded-xl cursor-move transition-all duration-300 shadow-sm 
        border hover:shadow-md backdrop-blur-sm
        ${isSelected ? 
          "border-blue-500 bg-blue-50" : 
          "border-gray-200 bg-white/90 hover:bg-gray-50/90"}
        ${isDragging ? "opacity-40 scale-[0.98]" : "opacity-100"}
      `}
    >

      {/* Glow Ring When Selected */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl border-2 border-blue-400 shadow-[0px_0px_12px_rgba(30,135,255,0.5)] pointer-events-none"></div>
      )}

      <div className="flex items-start justify-between space-x-3">
        {/* Left Section */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm tracking-wide ">
            {batch.name}
          </h3>

          {/* Students */}
          <div className="flex items-center space-x-2 mt-1">
            <Users className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-600">
              {batch.size} students
            </span>
          </div>

          {/* Subjects */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {batch.subjects.slice(0, 2).map((subject) => (
              <span
                key={subject}
                className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full font-medium shadow-sm"
              >
                {subject}
              </span>
            ))}
            {batch.subjects.length > 2 && (
              <span className="text-[10px] text-gray-500 font-medium">
                +{batch.subjects.length - 2}
              </span>
            )}
          </div>

          {/* Branch */}
          <div className="mt-2 text-[11px] text-gray-500 font-medium">
            {batch.branch}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-center space-y-2">
          {/* View Button */}
          {onView && (
            <button
              onClick={handleViewClick}
              className="
                p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-all
                hover:shadow-sm
              "
              title="View Students"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {/* Tick Icon When Selected */}
          {isSelected && (
            <div className="
              w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center 
              text-xs font-bold shadow-sm
            ">
              ✓
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchCard;
