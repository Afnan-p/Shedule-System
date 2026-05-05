import { X, Menu, Search, Filter, CheckCircle2, Circle } from 'lucide-react';
import BatchCard from './BatchCard';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

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
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground shadow-premium rounded-full"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ 
          width: open ? '340px' : '0px',
          opacity: open ? 1 : 0
        }}
        className="relative h-full bg-background border-r flex flex-col overflow-hidden transition-all duration-300 ease-in-out z-40"
      >
        <div className="w-[340px] flex flex-col h-full">
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Batches</h2>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                {batches.length} Available
              </p>
            </div>
            {selectedBatches.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                Clear ({selectedBatches.length})
              </Button>
            )}
          </div>

          {/* Search & Filters */}
          <div className="px-6 pb-6 space-y-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all rounded-xl"
              />
            </div>

            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <select
                  value={subjectFilter}
                  onChange={(e) => onSubjectFilterChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-muted-foreground/20 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none appearance-none transition-all cursor-pointer hover:bg-muted/50"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <Button variant="outline" size="sm" onClick={selectAll} className="rounded-xl border-slate-200">
                Select All
              </Button>
            </div>
          </div>

          {/* Batch Cards List */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {batches.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <Search size={32} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No batches found</p>
                  <Button variant="link" onClick={() => onSearchChange('')} className="mt-1">
                    Clear search
                  </Button>
                </motion.div>
              ) : (
                batches.map((batch, index) => (
                  <motion.div
                    key={batch._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <BatchCard
                      batch={batch}
                      isSelected={selectedBatches.includes(batch._id)}
                      onToggle={() => toggleBatchSelection(batch._id)}
                      onView={onViewBatch}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
