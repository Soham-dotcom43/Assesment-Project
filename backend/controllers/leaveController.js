const Leave = require('../models/Leave');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

const daysBetween = (start, end) => {
  const ms = new Date(end) - new Date(start);
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1; // inclusive of both days
};

// @desc  Employee applies for leave
// @route POST /api/leaves
// @access Private (employee)
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'startDate, endDate and reason are required' });
    }
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'endDate cannot be before startDate' });
    }

    const days = daysBetween(startDate, endDate);
    const employee = await User.findById(req.user._id);

    if (leaveType !== 'unpaid' && employee.leaveBalance < days) {
      return res.status(400).json({
        message: `Insufficient leave balance. Available: ${employee.leaveBalance} day(s), requested: ${days} day(s)`,
      });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType: leaveType || 'casual',
      startDate,
      endDate,
      days,
      reason,
    });

    return res.status(201).json({ message: 'Leave request submitted', leave });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to submit leave request', error: err.message });
  }
};

// @desc  Employee views their own leave requests
// @route GET /api/leaves/my
// @access Private (employee)
const myLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });
    return res.json({ leaves });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch leave requests', error: err.message });
  }
};

// @desc  HR/Admin: list all leave requests, optionally filtered by status
// @route GET /api/leaves?status=pending
// @access Private (hr, admin)
const allLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const leaves = await Leave.find(query)
      .populate('employee', 'name employeeId department designation leaveBalance')
      .sort({ createdAt: -1 });

    return res.json({ leaves });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch leave requests', error: err.message });
  }
};

// @desc  HR/Admin: approve or reject a leave request
// @route PUT /api/leaves/:id/review
// @access Private (hr, admin)
const reviewLeave = async (req, res) => {
  try {
    const { decision, reviewNote } = req.body; // decision: 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    if (leave.status !== 'pending') {
      return res.status(409).json({ message: `This request has already been ${leave.status}` });
    }

    leave.status = decision;
    leave.reviewedBy = req.user._id;
    leave.reviewNote = reviewNote || '';
    await leave.save();

    if (decision === 'approved') {
      const employee = await User.findById(leave.employee);
      if (leave.leaveType !== 'unpaid') {
        employee.leaveBalance = Math.max(0, employee.leaveBalance - leave.days);
        await employee.save();
      }

      // Mark each day of the leave as "on-leave" in attendance so reports stay consistent
      const cursor = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      while (cursor <= end) {
        const yyyy = cursor.getFullYear();
        const mm = String(cursor.getMonth() + 1).padStart(2, '0');
        const dd = String(cursor.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        await Attendance.findOneAndUpdate(
          { employee: leave.employee, date: dateStr },
          { employee: leave.employee, date: dateStr, status: 'on-leave' },
          { upsert: true, new: true }
        );
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return res.json({ message: `Leave request ${decision}`, leave });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to review leave request', error: err.message });
  }
};

// @desc  Employee cancels their own pending leave request
// @route PUT /api/leaves/:id/cancel
// @access Private (employee)
const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, employee: req.user._id });
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    if (leave.status !== 'pending') {
      return res.status(409).json({ message: 'Only pending requests can be cancelled' });
    }
    leave.status = 'cancelled';
    await leave.save();
    return res.json({ message: 'Leave request cancelled', leave });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to cancel leave request', error: err.message });
  }
};

module.exports = { applyLeave, myLeaves, allLeaves, reviewLeave, cancelLeave };
