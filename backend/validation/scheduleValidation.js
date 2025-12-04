import Joi from 'joi';

export const assignScheduleSchema = Joi.object({
  weekStart: Joi.date().required(),
  day: Joi.string().valid('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun').required(),
  slot: Joi.string().pattern(/^\d{2}:\d{2}-\d{2}:\d{2}$/).required(),
  teacherId: Joi.string().required(),
  batchIds: Joi.array().items(Joi.string()).min(1).required()
});

export const removeScheduleSchema = Joi.object({
  weekStart: Joi.date().required(),
  day: Joi.string().valid('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun').required(),
  slot: Joi.string().pattern(/^\d{2}:\d{2}-\d{2}:\d{2}$/).required(),
  teacherId: Joi.string().required(),
  batchIds: Joi.array().items(Joi.string()).optional()
});

export const checkConflictsSchema = Joi.object({
  weekStart: Joi.date().required(),
  day: Joi.string().valid('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun').required(),
  slot: Joi.string().pattern(/^\d{2}:\d{2}-\d{2}:\d{2}$/).required(),
  teacherId: Joi.string().required(),
  batchIds: Joi.array().items(Joi.string()).min(1).required()
});









