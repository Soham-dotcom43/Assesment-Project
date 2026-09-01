const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // stored as YYYY-MM-DD for easy uniqueness/queries
    checkIn: { type: Date },
    checkOut: { type: Date },
    workingHours: { type: Number, default: 0 }, // in hours, decimal
    status: {
      type: String,
      enum: ['present', 'late', 'half-day', 'absent', 'on-leave'],
      default: 'present',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// One attendance record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
