import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { getTeacherId, getBatchIds } from '../utils/scheduleHelpers';

dayjs.extend(isoWeek);

/**
 * Get start of week (Monday)
 */
const getWeekStart = (date) => {
  return dayjs(date).startOf('isoWeek').toDate();
};

export const useSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [loading, setLoading] = useState(false);
  const [actionHistory, setActionHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const fetchSchedule = useCallback(async (week, branch) => {
    setLoading(true);
    try {
      const params = { weekStart: dayjs(week).format('YYYY-MM-DD') };
      if (branch) params.branch = branch;
      
      const response = await api.get('/schedule', { params });
      setSchedule(response.data.data.schedule || []);
    } catch (error) {
      toast.error('Failed to fetch schedule');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const assignSchedule = async (day, slot, teacherId, batchIds) => {
    try {
      const response = await api.post('/schedule/assign', {
        weekStart: dayjs(weekStart).format('YYYY-MM-DD'),
        day,
        slot,
        teacherId,
        batchIds
      });

      const newItem = response.data.data.scheduleItem;
      
      // Update existing schedule item or add new one
      setSchedule((prev) => {
        const existingIndex = prev.findIndex(
          item =>
            item.day === day &&
            item.slot === slot &&
            getTeacherId(item.teacherId) === teacherId
        );
        
        if (existingIndex >= 0) {
          // Update existing item
          const updated = [...prev];
          updated[existingIndex] = newItem;
          return updated;
        } else {
          // Add new item
          return [...prev, newItem];
        }
      });

      // Add to history for undo
      addToHistory({
        type: 'assign',
        day,
        slot,
        teacherId,
        batchIds,
        scheduleItem: newItem
      });

      const batchCount = batchIds.length;
      toast.success(
        batchCount > 1 
          ? `${batchCount} batches assigned successfully` 
          : 'Schedule assigned successfully'
      );
      return newItem;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to assign schedule';
      toast.error(errorMsg);
      throw error;
    }
  };

  const removeSchedule = async (day, slot, teacherId, batchIds) => {
    try {
      // Get response to check if item was removed
      const response = await api.post('/schedule/remove', {
        weekStart: dayjs(weekStart).format('YYYY-MM-DD'),
        day,
        slot,
        teacherId,
        batchIds
      });

      if (response.data.data.removed) {
        // Item was completely removed
        setSchedule((prev) =>
          prev.filter(
            (item) =>
              !(
                item.day === day &&
                item.slot === slot &&
                getTeacherId(item.teacherId) === teacherId
              )
          )
        );
      } else if (response.data.data.scheduleItem) {
        // Item was updated (some batches removed)
        setSchedule((prev) =>
          prev.map((item) =>
            item._id === response.data.data.scheduleItem._id
              ? response.data.data.scheduleItem
              : item
          )
        );
      } else if (batchIds && batchIds.length > 0) {
        // Fallback: Remove specific batches locally
        setSchedule((prev) =>
          prev.map((item) => {
            if (
              item.day === day &&
              item.slot === slot &&
              getTeacherId(item.teacherId) === teacherId
            ) {
              const itemBatchIds = getBatchIds(item.batchIds);
              const remainingBatches = item.batchIds.filter(
                (b) => {
                  const bid = typeof b === 'object' ? b._id : b;
                  return !batchIds.includes(bid);
                }
              );
              if (remainingBatches.length === 0) {
                return null;
              }
              return { ...item, batchIds: remainingBatches };
            }
            return item;
          }).filter(Boolean)
        );
      } else {
        // Fallback: Remove entire slot locally
        setSchedule((prev) =>
          prev.filter(
            (item) =>
              !(
                item.day === day &&
                item.slot === slot &&
                getTeacherId(item.teacherId) === teacherId
              )
          )
        );
      }

      // Add to history for undo
      addToHistory({
        type: 'remove',
        day,
        slot,
        teacherId,
        batchIds,
        previousSchedule: schedule
      });

      toast.success('Schedule removed successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove schedule');
      throw error;
    }
  };

  const moveSchedule = async ({ scheduleItemId, source, target }) => {
    try {
      const response = await api.post('/schedule/move', {
        weekStart: dayjs(weekStart).format('YYYY-MM-DD'),
        scheduleItemId,
        source,
        target
      });

      const updatedItem = response.data.data.scheduleItem;

      setSchedule((prev) =>
        prev.map((item) =>
          item._id === updatedItem._id ? updatedItem : item
        )
      );

      toast.success('Schedule updated');
      return updatedItem;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update schedule');
      throw error;
    }
  };

  const checkConflicts = async (day, slot, teacherId, batchIds) => {
    try {
      const response = await api.post('/schedule/check', {
        weekStart: dayjs(weekStart).format('YYYY-MM-DD'),
        day,
        slot,
        teacherId,
        batchIds
      });
      return response.data.data;
    } catch (error) {
      console.error('Conflict check failed:', error);
      return { hasConflicts: false, conflicts: {} };
    }
  };

  const addToHistory = (action) => {
    const newHistory = actionHistory.slice(0, historyIndex + 1);
    newHistory.push(action);
    setActionHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = async () => {
    if (historyIndex < 0) {
      toast.error('Nothing to undo');
      return;
    }

    const action = actionHistory[historyIndex];
    
    try {
      if (action.type === 'assign') {
        await removeSchedule(
          action.day,
          action.slot,
          action.teacherId,
          action.batchIds
        );
      } else if (action.type === 'remove') {
        await assignSchedule(
          action.day,
          action.slot,
          action.teacherId,
          action.batchIds
        );
      }
      setHistoryIndex(historyIndex - 1);
    } catch (error) {
      toast.error('Failed to undo');
    }
  };

  const redo = async () => {
    if (historyIndex >= actionHistory.length - 1) {
      toast.error('Nothing to redo');
      return;
    }

    const action = actionHistory[historyIndex + 1];
    
    try {
      if (action.type === 'assign') {
        await assignSchedule(
          action.day,
          action.slot,
          action.teacherId,
          action.batchIds
        );
      } else if (action.type === 'remove') {
        await removeSchedule(
          action.day,
          action.slot,
          action.teacherId,
          action.batchIds
        );
      }
      setHistoryIndex(historyIndex + 1);
    } catch (error) {
      toast.error('Failed to redo');
    }
  };

  const changeWeek = (offset) => {
    const newWeek = dayjs(weekStart).add(offset, 'week').toDate();
    setWeekStart(newWeek);
    setActionHistory([]);
    setHistoryIndex(-1);
  };

  return {
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
    canUndo: historyIndex >= 0,
    canRedo: historyIndex < actionHistory.length - 1
  };
};

