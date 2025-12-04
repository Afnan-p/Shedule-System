import ScheduleItem from '../models/ScheduleItem.js';
import Batch from '../models/Batch.js';
import Teacher from '../models/Teacher.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Get start of week (Monday) for a given date
 */
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

/**
 * @desc    Get schedule for a week
 * @route   GET /api/schedule
 * @access  Private
 */
export const getSchedule = asyncHandler(async (req, res) => {
  const { weekStart, branch } = req.query;

  let weekStartDate;
  if (weekStart) {
    weekStartDate = getWeekStart(new Date(weekStart));
  } else {
    weekStartDate = getWeekStart(new Date());
  }

  // Build query
  const query = { weekStart: weekStartDate };
  
  // If branch filter is provided, filter by teacher's branch
  if (branch) {
    const teachers = await Teacher.find({ branch }).select('_id');
    const teacherIds = teachers.map(t => t._id);
    query.teacherId = { $in: teacherIds };
  }

  const scheduleItems = await ScheduleItem.find(query)
    .populate('teacherId', 'name subjects branch')
    .populate('batchIds', 'name size subjects branch')
    .populate('createdBy', 'name email')
    .sort({ day: 1, slot: 1 });

  res.status(200).json({
    success: true,
    data: {
      weekStart: weekStartDate,
      schedule: scheduleItems
    }
  });
});

/**
 * @desc    Check for schedule conflicts
 * @route   POST /api/schedule/check
 * @access  Private
 */
export const checkConflicts = asyncHandler(async (req, res) => {
  const { weekStart, day, slot, teacherId, batchIds } = req.body;

  const weekStartDate = getWeekStart(new Date(weekStart));

  const conflicts = {
    teacherConflict: false,
    batchConflicts: []
  };

  // Check if teacher is already assigned at this time slot
  const teacherConflict = await ScheduleItem.findOne({
    weekStart: weekStartDate,
    day,
    slot,
    teacherId
  });

  if (teacherConflict) {
    conflicts.teacherConflict = true;
  }

  // Check if any batch is already assigned at this time slot to another teacher
  for (const batchId of batchIds) {
    const batchConflict = await ScheduleItem.findOne({
      weekStart: weekStartDate,
      day,
      slot,
      batchIds: { $in: [batchId] },
      teacherId: { $ne: teacherId }
    });

    if (batchConflict) {
      conflicts.batchConflicts.push({
        batchId,
        conflictingTeacherId: batchConflict.teacherId,
        conflictingSlot: { day, slot }
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      hasConflicts: conflicts.teacherConflict || conflicts.batchConflicts.length > 0,
      conflicts
    }
  });
});

/**
 * @desc    Assign batches to teacher time slot
 * @route   POST /api/schedule/assign
 * @access  Private (Scheduler, Admin)
 */
export const assignSchedule = asyncHandler(async (req, res) => {
  const { weekStart, day, slot, teacherId, batchIds } = req.body;

  const weekStartDate = getWeekStart(new Date(weekStart));

  // Validate teacher exists
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    return res.status(404).json({
      success: false,
      error: 'Teacher not found',
      code: 'NOT_FOUND'
    });
  }

  // Validate batches exist
  const batches = await Batch.find({ _id: { $in: batchIds } });
  if (batches.length !== batchIds.length) {
    return res.status(404).json({
      success: false,
      error: 'One or more batches not found',
      code: 'NOT_FOUND'
    });
  }

  // Check if schedule item already exists for this teacher/day/slot
  let scheduleItem = await ScheduleItem.findOne({
    weekStart: weekStartDate,
    day,
    slot,
    teacherId
  });

  const existingBatchIds = scheduleItem
    ? scheduleItem.batchIds.map(id => id.toString())
    : [];
  const requestedBatchIds = batchIds.map(id => id.toString());
  const incomingBatchIds = requestedBatchIds.filter(
    id => !existingBatchIds.includes(id)
  );

  // Check batch conflicts only for batches not already scheduled with this teacher/slot
  for (const batchId of incomingBatchIds) {
    const batchConflict = await ScheduleItem.findOne({
      weekStart: weekStartDate,
      day,
      slot,
      batchIds: { $in: [batchId] },
      teacherId: { $ne: teacherId }
    });

    if (batchConflict) {
      return res.status(400).json({
        success: false,
        error: `Batch is already assigned to another teacher at this time slot`,
        code: 'BATCH_CONFLICT',
        data: { batchId, conflictingTeacherId: batchConflict.teacherId }
      });
    }
  }

  if (scheduleItem) {
    // Merge batchIds, avoiding duplicates
    const allBatchIds = [...new Set([...existingBatchIds, ...requestedBatchIds])];
    
    scheduleItem.batchIds = allBatchIds;
    scheduleItem.updatedAt = Date.now();
    await scheduleItem.save();
  } else {
    // Create new schedule item
    scheduleItem = await ScheduleItem.create({
      weekStart: weekStartDate,
      day,
      slot,
      teacherId,
      batchIds,
      createdBy: req.user.id
    });
  }

  scheduleItem = await ScheduleItem.findById(scheduleItem._id)
    .populate('teacherId', 'name subjects branch')
    .populate('batchIds', 'name size subjects branch');

  // Log audit
  await AuditLog.create({
    userId: req.user.id,
    action: 'assign',
    resourceType: 'schedule',
    payload: {
      weekStart: weekStartDate,
      day,
      slot,
      teacherId,
      batchIds,
      scheduleItemId: scheduleItem._id
    }
  });

  res.status(200).json({
    success: true,
    data: { scheduleItem }
  });
});

/**
 * @desc    Remove batches from teacher time slot
 * @route   POST /api/schedule/remove
 * @access  Private (Scheduler, Admin)
 */
export const removeSchedule = asyncHandler(async (req, res) => {
  const { weekStart, day, slot, teacherId, batchIds } = req.body;

  const weekStartDate = getWeekStart(new Date(weekStart));

  const scheduleItem = await ScheduleItem.findOne({
    weekStart: weekStartDate,
    day,
    slot,
    teacherId
  });

  if (!scheduleItem) {
    return res.status(404).json({
      success: false,
      error: 'Schedule item not found',
      code: 'NOT_FOUND'
    });
  }

  // If batchIds provided, remove only those batches, otherwise remove all
  if (batchIds && batchIds.length > 0) {
    scheduleItem.batchIds = scheduleItem.batchIds.filter(
      id => !batchIds.includes(id.toString())
    );

    if (scheduleItem.batchIds.length === 0) {
      // No batches left, delete the schedule item
      await scheduleItem.deleteOne();

      // Log audit
      await AuditLog.create({
        userId: req.user.id,
        action: 'remove',
        resourceType: 'schedule',
        payload: {
          weekStart: weekStartDate,
          day,
          slot,
          teacherId,
          batchIds,
          removed: true
        }
      });

      return res.status(200).json({
        success: true,
        data: { scheduleItem: null, removed: true }
      });
    }

    await scheduleItem.save();
  } else {
    // Remove entire schedule item
    await scheduleItem.deleteOne();

    // Log audit
    await AuditLog.create({
      userId: req.user.id,
      action: 'remove',
      resourceType: 'schedule',
      payload: {
        weekStart: weekStartDate,
        day,
        slot,
        teacherId,
        removed: true
      }
    });

    return res.status(200).json({
      success: true,
      data: { scheduleItem: null, removed: true }
    });
  }

  const updatedItem = await ScheduleItem.findById(scheduleItem._id)
    .populate('teacherId', 'name subjects branch')
    .populate('batchIds', 'name size subjects branch');

  // Log audit
  await AuditLog.create({
    userId: req.user.id,
    action: 'remove',
    resourceType: 'schedule',
    payload: {
      weekStart: weekStartDate,
      day,
      slot,
      teacherId,
      batchIds,
      remainingBatches: updatedItem.batchIds
    }
  });

  res.status(200).json({
    success: true,
    data: { scheduleItem: updatedItem, removed: false }
  });
});

/**
 * @desc    Move schedule item to a different slot/teacher
 * @route   POST /api/schedule/move
 * @access  Private (Scheduler, Admin)
 */
export const moveSchedule = asyncHandler(async (req, res) => {
  const { scheduleItemId, source = {}, target = {} } = req.body;

  if (!scheduleItemId || !target.day || !target.slot) {
    return res.status(400).json({
      success: false,
      error: 'scheduleItemId, target day, and target slot are required',
      code: 'VALIDATION_ERROR'
    });
  }

  const scheduleItem = await ScheduleItem.findById(scheduleItemId);

  if (!scheduleItem) {
    return res.status(404).json({
      success: false,
      error: 'Schedule item not found',
      code: 'NOT_FOUND'
    });
  }

  // Validate source info if provided to prevent stale moves
  const isSourceMismatched =
    (source.day && source.day !== scheduleItem.day) ||
    (source.slot && source.slot !== scheduleItem.slot) ||
    (source.teacherId &&
      scheduleItem.teacherId.toString() !== source.teacherId.toString());

  if (isSourceMismatched) {
    return res.status(409).json({
      success: false,
      error: 'Schedule item has been updated. Refresh and try again.',
      code: 'STALE_SCHEDULE'
    });
  }

  const allowedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (!allowedDays.includes(target.day)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid day provided',
      code: 'VALIDATION_ERROR'
    });
  }

  const slotRegex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
  if (!slotRegex.test(target.slot)) {
    return res.status(400).json({
      success: false,
      error: 'Slot must be in format HH:mm-HH:mm',
      code: 'VALIDATION_ERROR'
    });
  }

  const targetTeacherId = target.teacherId || scheduleItem.teacherId;
  const targetTeacher = await Teacher.findById(targetTeacherId);

  if (!targetTeacher) {
    return res.status(404).json({
      success: false,
      error: 'Target teacher not found',
      code: 'NOT_FOUND'
    });
  }

  // If nothing actually changes, return existing item
  if (
    scheduleItem.day === target.day &&
    scheduleItem.slot === target.slot &&
    scheduleItem.teacherId.toString() === targetTeacherId.toString()
  ) {
    const currentItem = await ScheduleItem.findById(scheduleItem._id)
      .populate('teacherId', 'name subjects branch')
      .populate('batchIds', 'name size subjects branch');

    return res.status(200).json({
      success: true,
      data: { scheduleItem: currentItem }
    });
  }

  const previousState = {
    day: scheduleItem.day,
    slot: scheduleItem.slot,
    teacherId: scheduleItem.teacherId
  };

  // Check if target slot is already taken by the target teacher
  const teacherConflict = await ScheduleItem.findOne({
    weekStart: scheduleItem.weekStart,
    day: target.day,
    slot: target.slot,
    teacherId: targetTeacherId,
    _id: { $ne: scheduleItem._id }
  });

  if (teacherConflict) {
    return res.status(400).json({
      success: false,
      error: 'Target teacher already has a schedule at this time slot',
      code: 'TEACHER_CONFLICT'
    });
  }

  // Check if any of the batches are already assigned at the target slot to another teacher
  const batchConflict = await ScheduleItem.findOne({
    weekStart: scheduleItem.weekStart,
    day: target.day,
    slot: target.slot,
    batchIds: { $in: scheduleItem.batchIds },
    teacherId: { $ne: targetTeacherId }
  });

  if (batchConflict) {
    return res.status(400).json({
      success: false,
      error: 'One or more batches are already assigned at the target slot',
      code: 'BATCH_CONFLICT'
    });
  }

  scheduleItem.day = target.day;
  scheduleItem.slot = target.slot;
  scheduleItem.teacherId = targetTeacherId;
  scheduleItem.updatedAt = Date.now();
  await scheduleItem.save();

  const updatedItem = await ScheduleItem.findById(scheduleItem._id)
    .populate('teacherId', 'name subjects branch')
    .populate('batchIds', 'name size subjects branch');

  await AuditLog.create({
    userId: req.user.id,
    action: 'move',
    resourceType: 'schedule',
    payload: {
      scheduleItemId: scheduleItem._id,
      weekStart: scheduleItem.weekStart,
      from: {
        day: source.day || previousState.day,
        slot: source.slot || previousState.slot,
        teacherId: source.teacherId || previousState.teacherId
      },
      to: {
        day: target.day,
        slot: target.slot,
        teacherId: targetTeacherId
      }
    }
  });

  res.status(200).json({
    success: true,
    data: { scheduleItem: updatedItem }
  });
});

/**
 * @desc    Auto-suggest schedule assignment
 * @route   POST /api/schedule/auto-suggest
 * @access  Private (Scheduler, Admin)
 */
export const autoSuggest = asyncHandler(async (req, res) => {
  const { weekStart, batchId } = req.body;

  const batch = await Batch.findById(batchId);
  if (!batch) {
    return res.status(404).json({
      success: false,
      error: 'Batch not found',
      code: 'NOT_FOUND'
    });
  }

  const weekStartDate = getWeekStart(new Date(weekStart));

  // Find teachers with matching subjects and branch
  const teachers = await Teacher.find({
    branch: batch.branch,
    subjects: { $in: batch.subjects }
  });

  // Get existing schedule for the week
  const existingSchedule = await ScheduleItem.find({
    weekStart: weekStartDate
  });

  const suggestions = [];

  for (const teacher of teachers) {
    for (const availability of teacher.availability) {
      // Check if this slot is free
      const isTaken = existingSchedule.some(
        item =>
          item.day === availability.day &&
          item.slot === availability.slot &&
          (item.teacherId.toString() === teacher._id.toString() ||
            item.batchIds.some(bid => bid.toString() === batchId))
      );

      if (!isTaken) {
        suggestions.push({
          teacherId: teacher._id,
          teacherName: teacher.name,
          day: availability.day,
          slot: availability.slot,
          matchScore: teacher.subjects.filter(s => batch.subjects.includes(s)).length
        });
      }
    }
  }

  // Sort by match score (descending)
  suggestions.sort((a, b) => b.matchScore - a.matchScore);

  res.status(200).json({
    success: true,
    data: {
      suggestions: suggestions.slice(0, 10) // Return top 10
    }
  });
});

