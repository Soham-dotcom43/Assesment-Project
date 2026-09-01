const User = require('../models/User');

// @desc  HR/Admin: list all employees
// @route GET /api/employees
// @access Private (hr, admin)
const listEmployees = async (req, res) => {
  try {
    const { department, search } = req.query;
    const query = {};
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    const employees = await User.find(query).select('-password').sort({ createdAt: -1 });
    return res.json({ employees });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch employees', error: err.message });
  }
};

// @desc  HR/Admin: create an employee/HR account directly
// @route POST /api/employees
// @access Private (hr, admin)
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, phone, leaveBalance } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

    // Only admins can create other hr/admin accounts
    const assignedRole = role && req.user.role === 'admin' ? role : 'employee';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department,
      designation,
      phone,
      leaveBalance: leaveBalance ?? Number(process.env.DEFAULT_ANNUAL_LEAVE_DAYS || 18),
    });

    return res.status(201).json({ message: 'Employee created', employee: user.toSafeObject() });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create employee', error: err.message });
  }
};

// @desc  HR/Admin: get a single employee's profile
// @route GET /api/employees/:id
// @access Private (hr, admin)
const getEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    return res.json({ employee });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch employee', error: err.message });
  }
};

// @desc  HR/Admin: update an employee's details
// @route PUT /api/employees/:id
// @access Private (hr, admin)
const updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const fields = ['name', 'department', 'designation', 'phone', 'isActive', 'leaveBalance'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) employee[field] = req.body[field];
    });

    // Only admins can change roles
    if (req.body.role && req.user.role === 'admin') {
      employee.role = req.body.role;
    }

    await employee.save();
    return res.json({ message: 'Employee updated', employee: employee.toSafeObject() });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update employee', error: err.message });
  }
};

// @desc  HR/Admin: deactivate (soft-delete) an employee
// @route DELETE /api/employees/:id
// @access Private (admin)
const deactivateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    employee.isActive = false;
    await employee.save();
    return res.json({ message: 'Employee deactivated' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to deactivate employee', error: err.message });
  }
};

// @desc  Employee updates their own profile (limited fields)
// @route PUT /api/employees/me/profile
// @access Private
const updateOwnProfile = async (req, res) => {
  try {
    const employee = await User.findById(req.user._id);
    const fields = ['phone', 'profileImage'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) employee[field] = req.body[field];
    });
    if (req.body.password) {
      employee.password = req.body.password;
    }
    await employee.save();
    return res.json({ message: 'Profile updated', user: employee.toSafeObject() });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

module.exports = {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deactivateEmployee,
  updateOwnProfile,
};
