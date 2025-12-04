/**
 * Utility functions for safe data access in schedule components
 */

/**
 * Safely get teacher ID from teacherId field (can be object or string)
 */
export const getTeacherId = (teacherId) => {
  if (!teacherId) return null;
  if (typeof teacherId === 'string') return teacherId;
  if (typeof teacherId === 'object' && teacherId._id) return teacherId._id;
  return teacherId.toString();
};

/**
 * Safely get batch ID from batch field (can be object or string)
 */
export const getBatchId = (batch) => {
  if (!batch) return null;
  if (typeof batch === 'string') return batch;
  if (typeof batch === 'object' && batch._id) return batch._id;
  return batch.toString();
};

/**
 * Safely get array of batch IDs from batchIds array
 */
export const getBatchIds = (batchIds) => {
  if (!Array.isArray(batchIds)) return [];
  return batchIds.map(batch => getBatchId(batch)).filter(Boolean);
};

/**
 * Check if two teacher IDs are equal (handles object and string)
 */
export const teacherIdsEqual = (id1, id2) => {
  const tid1 = getTeacherId(id1);
  const tid2 = getTeacherId(id2);
  if (!tid1 || !tid2) return false;
  return tid1.toString() === tid2.toString();
};

/**
 * Check if two batch IDs are equal (handles object and string)
 */
export const batchIdsEqual = (id1, id2) => {
  const bid1 = getBatchId(id1);
  const bid2 = getBatchId(id2);
  if (!bid1 || !bid2) return false;
  return bid1.toString() === bid2.toString();
};

