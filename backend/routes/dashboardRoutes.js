const express = require('express');
const router = express.Router();
const { hrSummary, employeeSummary } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/me', employeeSummary);
router.get('/hr', authorize('hr', 'admin'), hrSummary);

module.exports = router;
