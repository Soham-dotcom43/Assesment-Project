const express = require('express');
const router = express.Router();
const {
  applyLeave,
  myLeaves,
  allLeaves,
  reviewLeave,
  cancelLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', applyLeave);
router.get('/my', myLeaves);
router.put('/:id/cancel', cancelLeave);

router.get('/', authorize('hr', 'admin'), allLeaves);
router.put('/:id/review', authorize('hr', 'admin'), reviewLeave);

module.exports = router;
