import ScheduleConfig from '../models/ScheduleConfig.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

/**
 * @desc    Get schedule configuration
 * @route   GET /api/schedule-config
 * @access  Private
 */
export const getConfig = asyncHandler(async (req, res) => {
  const { branch } = req.query;

  let config;
  
  if (branch) {
    config = await ScheduleConfig.findOne({ branch });
  } else {
    // Get all configs
    config = await ScheduleConfig.find();
  }

  // If no config exists, create default
  if (!config || (branch && config.length === 0)) {
    const defaultConfig = {
      branch: branch || 'default',
      dayGroups: [
        {
          name: 'Mon-Wed-Fri',
          days: ['Mon', 'Wed', 'Fri'],
          timeSlots: [
            { start: '08:30', end: '11:30' },
            { start: '11:30', end: '14:30' },
            { start: '14:30', end: '17:00' }
          ]
        },
        {
          name: 'Tue-Thu-Sat',
          days: ['Tue', 'Thu', 'Sat'],
          timeSlots: [
            { start: '08:30', end: '11:30' },
            { start: '11:30', end: '14:30' },
            { start: '14:30', end: '17:00' }
          ]
        }
      ],
      defaultTimeSlots: [
        { start: '08:30', end: '11:30' },
        { start: '11:30', end: '14:30' },
        { start: '14:30', end: '17:00' }
      ]
    };

    if (branch) {
      config = await ScheduleConfig.create(defaultConfig);
    } else {
      config = [await ScheduleConfig.create(defaultConfig)];
    }
  }

  res.status(200).json({
    success: true,
    data: { config }
  });
});

/**
 * @desc    Update schedule configuration
 * @route   PUT /api/schedule-config
 * @access  Private (Admin, Scheduler)
 */
export const updateConfig = asyncHandler(async (req, res) => {
  const { branch, dayGroups, defaultTimeSlots } = req.body;

  let config = await ScheduleConfig.findOne({ branch });

  if (!config) {
    // Create new config
    config = await ScheduleConfig.create({
      branch,
      dayGroups: dayGroups || [],
      defaultTimeSlots: defaultTimeSlots || []
    });
  } else {
    // Update existing config
    if (dayGroups) config.dayGroups = dayGroups;
    if (defaultTimeSlots) config.defaultTimeSlots = defaultTimeSlots;
    await config.save();
  }

  res.status(200).json({
    success: true,
    data: { config }
  });
});









