import Teacher from '../models/Teacher.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get all teachers
 * @route   GET /api/teachers
 * @access  Private
 */
export const getTeachers = asyncHandler(async (req, res) => {
  const { branch, subject, search, page = 1, limit = 50 } = req.query;

  // Build query
  const query = {};
  
  if (branch) {
    query.branch = branch;
  }
  
  if (subject) {
    query.subjects = { $in: [subject] };
  }
  
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const teachers = await Teacher.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ name: 1 });

  const total = await Teacher.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      teachers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

/**
 * @desc    Get single teacher
 * @route   GET /api/teachers/:id
 * @access  Private
 */
export const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    return res.status(404).json({
      success: false,
      error: 'Teacher not found',
      code: 'NOT_FOUND'
    });
  }

  res.status(200).json({
    success: true,
    data: { teacher }
  });
});

/**
 * @desc    Create teacher
 * @route   POST /api/teachers
 * @access  Private (Scheduler, Admin)
 */
export const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.create(req.body);

  // Log audit
  await AuditLog.create({
    userId: req.user.id,
    action: 'create',
    resourceType: 'teacher',
    payload: { teacherId: teacher._id, name: teacher.name, branch: teacher.branch }
  });

  res.status(201).json({
    success: true,
    data: { teacher }
  });
});

/**
 * @desc    Update teacher
 * @route   PUT /api/teachers/:id
 * @access  Private (Scheduler, Admin)
 */
export const updateTeacher = asyncHandler(async (req, res) => {
  let teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    return res.status(404).json({
      success: false,
      error: 'Teacher not found',
      code: 'NOT_FOUND'
    });
  }

  teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log audit
  await AuditLog.create({
    userId: req.user.id,
    action: 'update',
    resourceType: 'teacher',
    payload: { teacherId: teacher._id, changes: req.body }
  });

  res.status(200).json({
    success: true,
    data: { teacher }
  });
});

/**
 * @desc    Delete teacher
 * @route   DELETE /api/teachers/:id
 * @access  Private (Admin only)
 */
export const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    return res.status(404).json({
      success: false,
      error: 'Teacher not found',
      code: 'NOT_FOUND'
    });
  }

  await teacher.deleteOne();

  // Log audit
  await AuditLog.create({
    userId: req.user.id,
    action: 'delete',
    resourceType: 'teacher',
    payload: { teacherId: teacher._id, name: teacher.name }
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});


