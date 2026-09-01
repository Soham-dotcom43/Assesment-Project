const express = require('express');
const router = express.Router();
const {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deactivateEmployee,
  updateOwnProfile,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.put('/me/profile', updateOwnProfile);

router.get('/', authorize('hr', 'admin'), listEmployees);
router.post('/', authorize('hr', 'admin'), createEmployee);
router.get('/:id', authorize('hr', 'admin'), getEmployee);
router.put('/:id', authorize('hr', 'admin'), updateEmployee);
router.delete('/:id', authorize('admin'), deactivateEmployee);

module.exports = router;
