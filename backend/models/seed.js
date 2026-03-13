const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./User');
const Job = require('./Job');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/khetsetu';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});

    // Create sample farmer
    const farmer = await User.create({
      phone: '+919876543210',
      name: 'राजेश कुमार',
      role: 'farmer',
      location: {
        type: 'Point',
        coordinates: [77.1025, 28.7041], // Delhi area
        district: 'नई दिल्ली',
        village: 'नरेला',
        pincode: '110040',
        state: 'दिल्ली'
      },
      isProfileComplete: true,
      averageRating: 4.5,
      totalRatings: 12
    });

    // Create sample workers
    const worker1 = await User.create({
      phone: '+919876543211',
      name: 'सुरेश यादव',
      role: 'worker',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139],
        district: 'गाज़ियाबाद',
        village: 'लोनी',
        pincode: '201102',
        state: 'उत्तर प्रदेश'
      },
      skills: ['harvesting', 'sowing', 'plowing'],
      isProfileComplete: true,
      averageRating: 4.2,
      totalRatings: 8,
      totalJobsCompleted: 15
    });

    const worker2 = await User.create({
      phone: '+919876543212',
      name: 'रामू प्रसाद',
      role: 'worker',
      location: {
        type: 'Point',
        coordinates: [77.0266, 28.4595],
        district: 'गुरुग्राम',
        village: 'सोहना',
        pincode: '122001',
        state: 'हरियाणा'
      },
      skills: ['weeding', 'hoeing', 'irrigation'],
      isProfileComplete: true,
      averageRating: 3.8,
      totalRatings: 5,
      totalJobsCompleted: 10
    });

    // Create sample jobs
    const jobs = await Job.insertMany([
      {
        title: 'गेहूं की कटाई के लिए मज़दूर चाहिए',
        description: 'मेरे 5 एकड़ खेत में गेहूं की कटाई के लिए 3 मज़दूर चाहिए। काम 3 दिन का है।',
        category: 'harvesting',
        wageType: 'daily',
        wageAmount: 500,
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041],
          district: 'नई दिल्ली',
          village: 'नरेला',
          pincode: '110040',
          state: 'दिल्ली'
        },
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        workersNeeded: 3,
        postedBy: farmer._id
      },
      {
        title: 'धान की बुवाई का काम',
        description: 'धान की बुवाई के लिए अनुभवी मज़दूर चाहिए। 10 एकड़ खेत है।',
        category: 'sowing',
        wageType: 'acre',
        wageAmount: 200,
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041],
          district: 'नई दिल्ली',
          village: 'नरेला',
          pincode: '110040',
          state: 'दिल्ली'
        },
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        workersNeeded: 5,
        postedBy: farmer._id
      },
      {
        title: 'खेत की निराई-गुड़ाई',
        description: 'सब्जियों के खेत की निराई-गुड़ाई करनी है। 2 दिन का काम।',
        category: 'weeding',
        wageType: 'daily',
        wageAmount: 400,
        location: {
          type: 'Point',
          coordinates: [77.1525, 28.6841],
          district: 'नई दिल्ली',
          village: 'बवाना',
          pincode: '110039',
          state: 'दिल्ली'
        },
        startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        workersNeeded: 2,
        postedBy: farmer._id
      }
    ]);

    console.log('✅ Seed data created successfully!');
    console.log(`   - ${1} farmer`);
    console.log(`   - ${2} workers`);
    console.log(`   - ${jobs.length} jobs`);
    console.log('\n📱 Test credentials (dev mode, OTP: 123456):');
    console.log(`   Farmer: +919876543210`);
    console.log(`   Worker: +919876543211, +919876543212`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
