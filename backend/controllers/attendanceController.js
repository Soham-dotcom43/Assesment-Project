const Attendance = require('../models/Attendance');
const { todayString, calculateWorkingHours, determineStatus } = require('../utils/attendanceHelpers');

// @desc  Check in for today
// @route POST /api/attendance/check-in
// @access Private (employee)
const checkIn = async (req, res) => {
  try {
    const date = todayString();
    const existing = await Attendance.findOne({ employee: req.user._id, date });
    if (existing && existing.checkIn) {
      return res.status(409).json({ message: 'You have already checked in today' });
    }

    const now = new Date();
    const record = existing
      ? Object.assign(existing, { checkIn: now })
      : new Attendance({ employee: req.user._id, date, checkIn: now });

    record.status = determineStatus(now, 0);
    await record.save();

    return res.status(201).json({ message: 'Checked in successfully', record });
  } catch (err) {
    return res.status(500).json({ message: 'Check-in failed', error: err.message });
  }
};

// @desc  Check out for today
// @route POST /api/attendance/check-out
// @access Private (employee)
const checkOut = async (req, res) => {
  try {
    const date = todayString();
    const record = await Attendance.findOne({ employee: req.user._id, date });

    if (!record || !record.checkIn) {
      return res.status(400).json({ message: 'You must check in before checking out' });
    }
    if (record.checkOut) {
      return res.status(409).json({ message: 'You have already checked out today' });
    }

    const now = new Date();
    record.checkOut = now;
    record.workingHours = calculateWorkingHours(record.checkIn, now);
    record.status = determineStatus(record.checkIn, record.workingHours);
    await record.save();

    return res.json({ message: 'Checked out successfully', record });
  } catch (err) {
    return res.status(500).json({ message: 'Check-out failed', error: err.message });
  }
};

// @desc  Get the logged-in employee's own attendance history
// @route GET /api/attendance/my-history?month=YYYY-MM
// @access Private (employee)
const myHistory = async (req, res) => {
  try {
    const { month } = req.query; // optional YYYY-MM filter
    const query = { employee: req.user._id };
    if (month) {
      query.date = { $regex: `^${month}` };
    }
    const records = await Attendance.find(query).sort({ date: -1 });
    return res.json({ records });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch attendance history', error: err.message });
  }
};

// @desc  Get today's attendance status for the logged-in employee
// @route GET /api/attendance/today
// @access Private (employee)
const todayStatus = async (req, res) => {
  try {
    const date = todayString();
    const record = await Attendance.findOne({ employee: req.user._id, date });
    return res.json({ record: record || null });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch today\'s status', error: err.message });
  }
};

// @desc  HR/Admin: get attendance for all employees, optionally filtered by date or department
// @route GET /api/attendance/all?date=YYYY-MM-DD
// @access Private (hr, admin)
const allAttendance = async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    const query = {};
    if (date) query.date = date;
    if (employeeId) query.employee = employeeId;

    const records = await Attendance.find(query)
      .populate('employee', 'name employeeId department designation')
      .sort({ date: -1 });

    return res.json({ records });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch attendance records', error: err.message });
  }
};

// @desc  HR/Admin: manually mark/adjust an attendance record (e.g. mark absent, fix hours)
// @route PUT /api/attendance/:id
// @access Private (hr, admin)
const updateAttendance = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });

    const { status, notes, checkIn, checkOut } = req.body;
    if (status) record.status = status;
    if (notes !== undefined) record.notes = notes;
    if (checkIn) record.checkIn = new Date(checkIn);
    if (checkOut) record.checkOut = new Date(checkOut);
    if (record.checkIn && record.checkOut) {
      record.workingHours = calculateWorkingHours(record.checkIn, record.checkOut);
    }

    await record.save();
    return res.json({ message: 'Attendance record updated', record });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update attendance record', error: err.message });
  }
};

module.exports = { checkIn, checkOut, myHistory, todayStatus, allAttendance, updateAttendance };
