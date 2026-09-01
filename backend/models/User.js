const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['employee', 'hr', 'admin'],
      default: 'employee',
    },
    department: { type: String, default: 'Unassigned' },
    designation: { type: String, default: 'Employee' },
    joiningDate: { type: Date, default: Date.now },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
    leaveBalance: { type: Number, default: 18 },
    profileImage: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate a human readable employee ID like EMP-0001
userSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model('User').countDocuments();
    this.employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
  }
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
