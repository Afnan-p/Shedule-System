import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Undo2,
  Redo2,
  LogOut,
  Settings,
  UserPlus,
  LayoutDashboard,
  Calendar,
  History
} from 'lucide-react';
import dayjs from 'dayjs';
import { Button } from './ui/Button';
import { cn } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const exportMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const weekStartStr = dayjs(weekStart).format('MMM DD');
  const weekEndStr = dayjs(weekStart).add(6, 'day').format('MMM DD, YYYY');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 glass border-b px-6 py-3 flex items-center justify-between">
      {/* Left: Brand & Navigation */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="bg-primary p-2 rounded-lg shadow-premium">
            <LayoutDashboard size={20} className="text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden md:block">Schedule<span className="text-primary">Pro</span></span>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center bg-muted/50 rounded-full p-1 border shadow-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onWeekChange(-1)}
            className="rounded-full h-8 w-8"
          >
            <ChevronLeft size={18} />
          </Button>
          <div className="px-4 flex items-center space-x-2 text-sm font-medium min-w-[200px] justify-center">
            <Calendar size={14} className="text-muted-foreground" />
            <span>{weekStartStr} — {weekEndStr}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onWeekChange(1)}
            className="rounded-full h-8 w-8"
          >
            <ChevronRight size={18} />
          </Button>
        </div>

        {/* Branch Selector */}
        <div className="hidden lg:block">
          <select
            value={selectedBranch}
            onChange={(e) => onBranchChange(e.target.value)}
            className="bg-background/50 border rounded-full px-4 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer hover:bg-muted/50"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center space-x-3">
        {/* Undo/Redo Group */}
        <div className="flex items-center border rounded-full p-0.5 bg-muted/30">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onUndo} 
            disabled={!canUndo}
            className="rounded-full h-8 w-8"
            title="Undo"
          >
            <Undo2 size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRedo} 
            disabled={!canRedo}
            className="rounded-full h-8 w-8"
            title="Redo"
          >
            <Redo2 size={16} />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onConfigClick} className="rounded-full gap-2 border-slate-200">
            <Settings size={14} />
            <span className="hidden lg:inline">Time Slots</span>
          </Button>
          
          <Button variant="secondary" size="sm" onClick={onAddTeacher} className="rounded-full gap-2">
            <UserPlus size={14} />
            <span className="hidden lg:inline">Add Teacher</span>
          </Button>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <Button 
              size="sm" 
              onClick={() => setShowExportMenu(!showExportMenu)} 
              className="rounded-full gap-2 shadow-premium"
            >
              <Download size={14} />
              <span className="hidden lg:inline">Export</span>
            </Button>
            
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-premium overflow-hidden"
                >
                  <button
                    onClick={() => { onExport('csv'); setShowExportMenu(false); }}
                    className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors text-sm font-medium flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Export as CSV</span>
                  </button>
                  <button
                    onClick={() => { onExport('pdf'); setShowExportMenu(false); }}
                    className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors text-sm font-medium flex items-center space-x-2 border-t"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Export as PDF</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="h-6 w-px bg-border mx-1"></div>

        {/* User Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-1 pr-3 rounded-full hover:bg-muted transition-all duration-200 focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shadow-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold leading-none">{user?.name}</p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">{user?.role}</p>
            </div>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 glass rounded-2xl shadow-premium overflow-hidden py-1"
              >
                <div className="px-4 py-3 border-b mb-1">
                  <p className="text-sm font-bold truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors text-sm font-medium flex items-center space-x-3">
                  <History size={16} className="text-muted-foreground" />
                  <span>Activity Logs</span>
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors text-sm font-medium flex items-center space-x-3">
                  <Settings size={16} className="text-muted-foreground" />
                  <span>Profile Settings</span>
                </button>
                <div className="border-t my-1"></div>
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2.5 text-left hover:bg-destructive/10 text-destructive transition-colors text-sm font-bold flex items-center space-x-3"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
