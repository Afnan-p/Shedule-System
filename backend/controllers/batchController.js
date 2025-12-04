import Batch from '../models/Batch.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get all batches
 * @route   GET /api/batches
 * @access  Private
 */
export const getBatches = asyncHandler(async (req, res) => {
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

  const batches = await Batch.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ name: 1 });

  const total = await Batch.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      batches,
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
 * @desc    Get single batch
 * @route   GET /api/batches/:id
 * @access  Private
 */
export const getBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return res.status(404).json({
      success: false,
      error: 'Batch not found',
      code: 'NOT_FOUND'
    });
  }

  res.status(200).json({
    success: true,
    data: { batch }
  });
});

/**
 * @desc    Create batch
 * @route   POST /api/batches
 * @access  Private (Scheduler, Admin)
 */
export const createBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.create(req.body);

  // Log audit
  await AuditLog.create({
    userId: req.user.id,
    action: 'create',
    resourceType: 'batch',
    payload: { batchId: batch._id, name: batch.name, branch: batch.branch }
  });

  res.status(201).json({
    success: true,
    data: { batch }
  });
});

/**
 * @desc    Update batch
 * @route   PUT /api/batches/:id
 * @access  Private (Scheduler, Admin)
 */
export const updateBatch = asyncHandler(async (req, res) => {
  let batch = await Batch.findById(req.params.id);

  if (!batch) {
    return res.status(404).json({
      success: false,
      error: 'Batch not found',
      code: 'NOT_FOUND'
    });
  }

  batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log audit
  await AuditLog.create({
    userId: req.user.id,
    action: 'update',
    resourceType: 'batch',
    payload: { batchId: batch._id, changes: req.body }
  });

  res.status(200).json({
    success: true,
    data: { batch }
  });
});

/**
 * @desc    Delete batch
 * @route   DELETE /api/batches/:id
 * @access  Private (Admin only)
 */
export const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return res.status(404).json({
      success: false,
      error: 'Batch not found',
      code: 'NOT_FOUND'
    });
  }

  await batch.deleteOne();

  // Log audit
  await AuditLog.create({
    userId: req.user.id,
    action: 'delete',
    resourceType: 'batch',
    payload: { batchId: batch._id, name: batch.name }
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Add student to batch
 * @route   POST /api/batches/:id/students
 * @access  Private (Scheduler, Admin)
 */
export const addStudent = asyncHandler(async (req, res) => {
  const { name, email, rollNumber, phone } = req.body;

  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return res.status(404).json({
      success: false,
      error: 'Batch not found',
      code: 'NOT_FOUND'
    });
  }

  // Add student
  batch.students.push({
    name,
    email: email || '',
    rollNumber: rollNumber || '',
    phone: phone || ''
  });

  // Update size
  batch.size = batch.students.length;

  await batch.save();

  // Log audit
  await AuditLog.create({
    userId: req.user.id,
    action: 'update',
    resourceType: 'batch',
    payload: { batchId: batch._id, action: 'add_student', studentName: name }
  });

  res.status(200).json({
    success: true,
    data: { batch }
  });
});

/**
 * @desc    Remove student from batch
 * @route   DELETE /api/batches/:id/students/:studentId
 * @access  Private (Scheduler, Admin)
 */
export const removeStudent = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return res.status(404).json({
      success: false,
      error: 'Batch not found',
      code: 'NOT_FOUND'
    });
  }

  const student = batch.students.id(req.params.studentId);

  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Student not found',
      code: 'NOT_FOUND'
    });
  }

  const studentName = student.name;
  
  // Remove student
  batch.students.pull(req.params.studentId);
  
  // Update size
  batch.size = batch.students.length;

  await batch.save();

  // Log audit
  await AuditLog.create({
    userId: req.user.id,
    action: 'update',
    resourceType: 'batch',
    payload: { batchId: batch._id, action: 'remove_student', studentName }
  });

  res.status(200).json({
    success: true,
    data: { batch }
  });
});

/**
 * @desc    Update student in batch
 * @route   PUT /api/batches/:id/students/:studentId
 * @access  Private (Scheduler, Admin)
 */
export const updateStudent = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return res.status(404).json({
      success: false,
      error: 'Batch not found',
      code: 'NOT_FOUND'
    });
  }

  const student = batch.students.id(req.params.studentId);

  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Student not found',
      code: 'NOT_FOUND'
    });
  }

  // Update student fields
  if (req.body.name) student.name = req.body.name;
  if (req.body.email !== undefined) student.email = req.body.email || '';
  if (req.body.rollNumber !== undefined) student.rollNumber = req.body.rollNumber || '';
  if (req.body.phone !== undefined) student.phone = req.body.phone || '';

  await batch.save();

  // Log audit
  await AuditLog.create({
    userId: req.user.id,
    action: 'update',
    resourceType: 'batch',
    payload: { batchId: batch._id, action: 'update_student', studentId: req.params.studentId }
  });

  res.status(200).json({
    success: true,
    data: { batch }
  });
});

