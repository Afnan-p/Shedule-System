import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

/**
 * @desc    Get audit logs
 * @route   GET /api/audit
 * @access  Private (Admin, Scheduler)
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { weekStart, userId, action, resourceType, page = 1, limit = 50 } = req.query;

  // Build query
  const query = {};

  if (weekStart) {
    // Filter schedule-related logs for the week
    const weekStartDate = new Date(weekStart);
    query.$or = [
      {
        resourceType: 'schedule',
        'payload.weekStart': weekStartDate
      },
      {
        resourceType: { $ne: 'schedule' }
      }
    ];
  }

  if (userId) {
    query.userId = userId;
  }

  if (action) {
    query.action = action;
  }

  if (resourceType) {
    query.resourceType = resourceType;
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const logs = await AuditLog.find(query)
    .populate('userId', 'name email role')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await AuditLog.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});


