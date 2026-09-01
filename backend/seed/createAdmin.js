// Run with: npm run seed:admin
// Creates (or updates) a single admin account from the ADMIN_* values in .env
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'admin@innereye.com').toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin already exists: ${email}`);
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || 'System Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
      department: 'Administration',
      designation: 'System Administrator',
      leaveBalance: 999,
    });
    console.log(`Admin created: ${email} / password from .env`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
