import ScheduleItem from '../models/ScheduleItem.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import createCsvWriter from 'csv-writer';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

/**
 * Get start of week (Monday) for a given date
 */
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

/**
 * @desc    Export schedule to CSV
 * @route   GET /api/schedule/export/csv
 * @access  Private
 */
export const exportCSV = asyncHandler(async (req, res) => {
  const { weekStart, branch } = req.query;

  let weekStartDate;
  if (weekStart) {
    weekStartDate = getWeekStart(new Date(weekStart));
  } else {
    weekStartDate = getWeekStart(new Date());
  }

  const query = { weekStart: weekStartDate };
  
  if (branch && branch.trim() !== '') {
    const Teacher = (await import('../models/Teacher.js')).default;
    const teachers = await Teacher.find({ branch }).select('_id');
    const teacherIds = teachers.map(t => t._id);
    if (teacherIds.length > 0) {
      query.teacherId = { $in: teacherIds };
    }
  }

  const scheduleItems = await ScheduleItem.find(query)
    .populate('teacherId', 'name subjects branch')
    .populate('batchIds', 'name size subjects branch')
    .populate('createdBy', 'name email')
    .sort({ day: 1, slot: 1 });

  // Convert to CSV format with more details
  const csvData = scheduleItems
    .filter(item => item.teacherId && item.batchIds && item.batchIds.length > 0)
    .map(item => {
      const batchNames = item.batchIds.map(b => b.name);
      const batchSizes = item.batchIds.map(b => b.size);
      const totalStudents = item.batchIds.reduce((sum, b) => sum + b.size, 0);
      const subjects = [...new Set(item.batchIds.flatMap(b => b.subjects || []))];
      
      return {
        'Week Start': weekStartDate.toISOString().split('T')[0],
        'Day': item.day,
        'Time Slot': item.slot,
        'Teacher': item.teacherId?.name || 'N/A',
        'Teacher Branch': item.teacherId?.branch || 'N/A',
        'Teacher Subjects': (item.teacherId?.subjects || []).join(', '),
        'Batches': batchNames.join('; '),
        'Batch Count': item.batchIds.length,
        'Batch Sizes': batchSizes.join(', '),
        'Total Students': totalStudents,
        'Subjects': subjects.join(', '),
        'Created By': item.createdBy?.name || 'N/A',
        'Created At': item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'
      };
    });

  // Set headers
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=schedule-${weekStartDate.toISOString().split('T')[0]}.csv`);

  // Write CSV
  if (csvData.length === 0) {
    return res.send('Week Start,Day,Time Slot,Teacher,Teacher Branch,Teacher Subjects,Batches,Batch Count,Batch Sizes,Total Students,Subjects,Created By,Created At\n');
  }

  const headers = Object.keys(csvData[0]);
  res.write(headers.join(',') + '\n');
  
  csvData.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    res.write(values.join(',') + '\n');
  });

  res.end();
});

/**
 * @desc    Export schedule to PDF
 * @route   GET /api/schedule/export/pdf
 * @access  Private
 */
export const exportPDF = asyncHandler(async (req, res) => {
  const { weekStart, branch } = req.query;

  let weekStartDate;
  if (weekStart) {
    weekStartDate = getWeekStart(new Date(weekStart));
  } else {
    weekStartDate = getWeekStart(new Date());
  }

  const query = { weekStart: weekStartDate };
  
  if (branch && branch.trim() !== '') {
    const Teacher = (await import('../models/Teacher.js')).default;
    const teachers = await Teacher.find({ branch }).select('_id');
    const teacherIds = teachers.map(t => t._id);
    if (teacherIds.length > 0) {
      query.teacherId = { $in: teacherIds };
    }
  }

  const scheduleItems = await ScheduleItem.find(query)
    .populate('teacherId', 'name subjects branch')
    .populate('batchIds', 'name size subjects branch')
    .populate('createdBy', 'name email')
    .sort({ day: 1, slot: 1 });

  // Create PDF
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  
  // Set headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=schedule-${weekStartDate.toISOString().split('T')[0]}.pdf`);

  doc.pipe(res);

  // Title
  doc.fontSize(20).font('Helvetica-Bold').text('INSTITUTE SCHEDULE', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14).font('Helvetica').text(`Week Starting: ${weekStartDate.toISOString().split('T')[0]}`, { align: 'center' });
  if (branch) {
    doc.text(`Branch: ${branch}`, { align: 'center' });
  }
  doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown();
  
  // Summary
  doc.fontSize(10).fillColor('gray');
  doc.text(`Total Schedule Items: ${scheduleItems.length}`, { align: 'center' });
  const totalStudents = scheduleItems.reduce((sum, item) => 
    sum + item.batchIds.reduce((s, b) => s + b.size, 0), 0
  );
  doc.text(`Total Students Scheduled: ${totalStudents}`, { align: 'center' });
  doc.fillColor('black');
  doc.moveDown(2);

  // Group by day
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  for (const day of days) {
    const dayItems = scheduleItems.filter(item => item.day === day);
    
    if (dayItems.length > 0) {
      doc.fontSize(16).text(day, { underline: true });
      doc.moveDown(0.5);

      dayItems
        .filter(item => item.teacherId && item.batchIds && item.batchIds.length > 0)
        .forEach((item, idx) => {
          doc.fontSize(11).font('Helvetica-Bold');
          doc.text(`${idx + 1}. Time: ${item.slot}`, { continued: false });
          
          doc.font('Helvetica').fontSize(10);
          doc.text(`   Teacher: ${item.teacherId?.name || 'N/A'} (${item.teacherId?.branch || 'N/A'})`, { indent: 10 });
          doc.text(`   Subjects: ${(item.teacherId?.subjects || []).join(', ')}`, { indent: 10 });
          doc.text(`   Batches (${item.batchIds.length}): ${item.batchIds.map(b => b.name).join(', ')}`, { indent: 10 });
          doc.text(`   Total Students: ${item.batchIds.reduce((sum, b) => sum + b.size, 0)}`, { indent: 10 });
          
          const subjects = [...new Set(item.batchIds.flatMap(b => b.subjects || []))];
          if (subjects.length > 0) {
            doc.text(`   Batch Subjects: ${subjects.join(', ')}`, { indent: 10 });
          }
          
          doc.moveDown(0.5);
        });

      doc.moveDown();
    }
  }

  doc.end();
});

