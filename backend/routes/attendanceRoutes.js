const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  myHistory,
  todayStatus,
  allAttendance,
  updateAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my-history', myHistory);
router.get('/today', todayStatus);

router.get('/all', authorize('hr', 'admin'), allAttendance);
router.put('/:id', authorize('hr', 'admin'), updateAttendance);

module.exports = router;
