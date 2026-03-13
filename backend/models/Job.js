const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['sowing', 'harvesting', 'weeding', 'hoeing', 'irrigation', 'spraying', 'plowing', 'other']
  },
  categoryHi: {
    type: String,
    enum: ['बुवाई', 'कटाई', 'निराई', 'गुड़ाई', 'सिंचाई', 'छिड़काव', 'जुताई', 'अन्य']
  },
  wageType: {
    type: String,
    required: true,
    enum: ['daily', 'hourly', 'acre', 'fixed']
  },
  wageAmount: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    district: { type: String, trim: true },
    village: { type: String, trim: true },
    pincode: { type: String },
    state: { type: String, trim: true }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  workersNeeded: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  workersHired: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 2dsphere index for geospatial queries
jobSchema.index({ 'location': '2dsphere' });
jobSchema.index({ status: 1, category: 1 });
jobSchema.index({ postedBy: 1 });

// Map English category to Hindi before save
const categoryMap = {
  sowing: 'बुवाई',
  harvesting: 'कटाई',
  weeding: 'निराई',
  hoeing: 'गुड़ाई',
  irrigation: 'सिंचाई',
  spraying: 'छिड़काव',
  plowing: 'जुताई',
  other: 'अन्य'
};

jobSchema.pre('save', function(next) {
  if (this.isModified('category')) {
    this.categoryHi = categoryMap[this.category] || 'अन्य';
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);
