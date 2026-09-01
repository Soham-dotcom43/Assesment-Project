const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { todayString } = require('../utils/attendanceHelpers');

// @desc  HR/Admin dashboard summary: headcount, today's attendance breakdown, pending leaves
// @route GET /api/dashboard/hr
// @access Private (hr, admin)
const hrSummary = async (req, res) => {
  try {
    const date = todayString();
    const totalEmployees = await User.countDocuments({ isActive: true });

    const todayRecords = await Attendance.find({ date });
    const presentCount = todayRecords.filter((r) => ['present', 'late', 'half-day'].includes(r.status)).length;
    const lateCount = todayRecords.filter((r) => r.status === 'late').length;
    const onLeaveCount = todayRecords.filter((r) => r.status === 'on-leave').length;
    const absentCount = totalEmployees - todayRecords.length;

    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

    const recentLeaves = await Leave.find({ status: 'pending' })
      .populate('employee', 'name employeeId department')
      .sort({ createdAt: -1 })
      .limit(5);

    // Department headcount breakdown
    const byDepartment = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.json({
      date,
      totalEmployees,
      presentToday: presentCount,
      lateToday: lateCount,
      onLeaveToday: onLeaveCount,
      absentToday: Math.max(0, absentCount),
      pendingLeaveRequests: pendingLeaves,
      recentLeaveRequests: recentLeaves,
      departmentBreakdown: byDepartment.map((d) => ({ department: d._id || 'Unassigned', count: d.count })),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load HR dashboard', error: err.message });
  }
};

// @desc  Employee dashboard summary: today's status, this month's stats, leave balance
// @route GET /api/dashboard/me
// @access Private
const employeeSummary = async (req, res) => {
  try {
    const date = todayString();
    const month = date.slice(0, 7); // YYYY-MM

    const todayRecord = await Attendance.findOne({ employee: req.user._id, date });
    const monthRecords = await Attendance.find({
      employee: req.user._id,
      date: { $regex: `^${month}` },
    });

    const presentDays = monthRecords.filter((r) => ['present', 'late', 'half-day'].includes(r.status)).length;
    const lateDays = monthRecords.filter((r) => r.status === 'late').length;
    const leaveDays = monthRecords.filter((r) => r.status === 'on-leave').length;
    const totalHours = monthRecords.reduce((sum, r) => sum + (r.workingHours || 0), 0);

    const pendingLeaveRequests = await Leave.countDocuments({ employee: req.user._id, status: 'pending' });

    return res.json({
      date,
      todayRecord: todayRecord || null,
      leaveBalance: req.user.leaveBalance,
      monthly: {
        month,
        presentDays,
        lateDays,
        leaveDays,
        totalHours: Math.round(totalHours * 100) / 100,
      },
      pendingLeaveRequests,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
};

module.exports = { hrSummary, employeeSummary };
