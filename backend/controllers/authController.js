const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc  Register a new employee (self-signup defaults to 'employee' role)
// @route POST /api/auth/register
// @access Public
const register = async (req, res) => {
  try {
    const { name, email, password, department, designation, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      department,
      designation,
      phone,
      role: 'employee',
      leaveBalance: Number(process.env.DEFAULT_ANNUAL_LEAVE_DAYS || 18),
    });

    return res.status(201).json({
      user: user.toSafeObject(),
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// @desc  Authenticate user & return token
// @route POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    return res.json({
      user: user.toSafeObject(),
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// @desc  Get the logged-in user's profile
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

module.exports = { register, login, getMe };
