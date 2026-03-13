const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    match: [/^\+91\d{10}$/, 'Please enter a valid Indian phone number']
  },
  name: {
    type: String,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: ['farmer', 'worker'],
    default: null
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    district: { type: String, trim: true },
    village: { type: String, trim: true },
    pincode: { type: String, match: /^\d{6}$/ },
    state: { type: String, trim: true }
  },
  skills: [{
    type: String,
    enum: ['sowing', 'harvesting', 'weeding', 'hoeing', 'irrigation', 'spraying', 'plowing', 'other']
  }],
  profilePhoto: {
    type: String,
    default: ''
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalJobsCompleted: {
    type: Number,
    default: 0
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  refreshToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

userSchema.index({ 'location': '2dsphere' });
userSchema.index({ phone: 1 });

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.otp;
  delete user.refreshToken;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
