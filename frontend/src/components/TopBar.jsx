import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Undo2,
  Redo2,
  LogOut,
  Settings,
  UserPlus
} from 'lucide-react';
import dayjs from 'dayjs';

const TopBar = ({
  user,
  onLogout,
  weekStart,
  onWeekChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  branches,
  selectedBranch,
  onBranchChange,
  onExport,
  onConfigClick,
  onAddTeacher
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const weekStartStr = dayjs(weekStart).format('MMM DD, YYYY');
  const weekEndStr = dayjs(weekStart).add(6, 'day').format('MMM DD, YYYY');

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  return (
    <div className="
      backdrop-blur-md bg-white/80 
      border-b border-gray-200 
      px-6 py-3 
      shadow-sm sticky top-0 z-50
      flex items-center justify-between
    ">
      {/* LEFT SECTION */}
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-wide">
          Schedule Management
        </h1>

        {/* WEEK SELECTOR */}
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-xl shadow-inner">
          <button
            onClick={() => onWeekChange(-1)}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm font-medium text-gray-700 min-w-[200px] text-center">
            {weekStartStr} — {weekEndStr}
          </span>

          <button
            onClick={() => onWeekChange(1)}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* BRANCH SELECT */}
        <select
          value={selectedBranch}
          onChange={(e) => onBranchChange(e.target.value)}
          className="
            bg-white border border-gray-300 
            rounded-lg px-3 py-1.5 
            text-sm shadow-sm 
            focus:ring-2 focus:ring-blue-500 outline-none transition-all
          "
        >
          <option value="">All Branches</option>
          {branches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center space-x-3">

        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="
            p-2 rounded-lg transition-all 
            hover:bg-gray-100 
            disabled:opacity-40 disabled:cursor-not-allowed
          "
          title="Undo"
        >
          <Undo2 className="w-5 h-5 text-gray-700" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="
            p-2 rounded-lg transition-all 
            hover:bg-gray-100 
            disabled:opacity-40 disabled:cursor-not-allowed
          "
          title="Redo"
        >
          <Redo2 className="w-5 h-5 text-gray-700" />
        </button>

        {/* ADMIN BUTTONS */}
        {(user?.role === 'admin' || user?.role === 'scheduler') && (
          <>
            {/* TIME SLOT CONFIG */}
            <button
              onClick={onConfigClick}
              className="
                flex items-center space-x-1 px-4 py-1.5 
                bg-gray-800 text-white 
                rounded-lg text-sm shadow-md 
                hover:bg-gray-900 transition-all
              "
            >
              <Settings className="w-4 h-4" />
              <span>Time Slots</span>
            </button>

            {/* ADD TEACHER */}
            <button
              onClick={onAddTeacher}
              className="
                flex items-center space-x-1 px-4 py-1.5 
                bg-green-600 text-white rounded-lg text-sm 
                shadow-md hover:bg-green-700 transition-all
              "
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Teacher</span>
            </button>

            {/* EXPORT DROPDOWN */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="
                  flex items-center space-x-1 px-4 py-1.5 
                  bg-blue-600 text-white rounded-lg text-sm 
                  shadow-md hover:bg-blue-700 transition-all
                "
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>

              {showExportMenu && (
                <div className="
                  absolute right-0 mt-2 w-48 
                  bg-white border border-gray-200 rounded-xl shadow-lg 
                  animate-fadeSlide z-50
                ">
                  <button
                    onClick={() => { onExport('csv'); setShowExportMenu(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-xl text-sm"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => { onExport('pdf'); setShowExportMenu(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-xl text-sm"
                  >
                    Export as PDF
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* USER PROFILE + LOGOUT */}
        <div className="flex items-center space-x-3 border-l pl-4">
          <div className="text-sm leading-tight text-right">
            <div className="text-gray-800 font-medium">{user?.name}</div>
            <div className="text-gray-500 text-xs">{user?.role}</div>
          </div>

          <button
            onClick={onLogout}
            className="
              p-2 rounded-lg hover:bg-gray-100 transition-all
            "
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
