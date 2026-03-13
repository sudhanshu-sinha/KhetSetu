const Job = require('../models/Job');

/**
 * Create a new job
 * POST /api/jobs
 */
exports.createJob = async (req, res, next) => {
  try {
    const { title, description, category, wageType, wageAmount, location, startDate, endDate, workersNeeded } = req.body;

    // Handle coordinates — default to [0, 0] if not provided
    const coords = location?.coordinates?.length === 2
      ? location.coordinates.map(Number)
      : [0, 0];

    const job = new Job({
      title,
      description,
      category,
      wageType,
      wageAmount: parseFloat(wageAmount),
      location: {
        type: 'Point',
        coordinates: coords,
        district: location?.district || '',
        village: location?.village || '',
        pincode: location?.pincode || '',
        state: location?.state || ''
      },
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      workersNeeded: parseInt(workersNeeded) || 1,
      postedBy: req.userId
    });

    await job.save();

    // Emit new job event via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('new-job', {
        jobId: job._id,
        title: job.title,
        category: job.category,
        location: job.location
      });
    }

    res.status(201).json({ success: true, job });
  } catch (error) {
    // Send mongoose validation errors in a readable format
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      return res.status(400).json({ error: 'Validation failed', details });
    }
    next(error);
  }
};

/**
 * Get jobs near a location
 * GET /api/jobs/nearby?lat=XX&lng=XX&radius=50&category=harvesting
 */
exports.getNearbyJobs = async (req, res, next) => {
  try {
    const { lat, lng, radius = 50, category, page = 1, limit = 20 } = req.query;

    const query = {
      status: 'open',
      'location': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      }
    };

    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const jobs = await Job.find(query)
      .populate('postedBy', 'name phone location averageRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all open jobs (no location filter)
 * GET /api/jobs?category=XX&page=1&limit=20
 */
exports.getJobs = async (req, res, next) => {
  try {
    const { category, status = 'open', page = 1, limit = 20 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const jobs = await Job.find(query)
      .populate('postedBy', 'name phone location averageRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single job by ID
 * GET /api/jobs/:id
 */
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name phone location averageRating profilePhoto');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

/**
 * Get jobs posted by current farmer
 * GET /api/jobs/my-jobs
 */
exports.getMyJobs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { postedBy: req.userId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a job
 * PUT /api/jobs/:id
 */
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.postedBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this job' });
    }

    const allowed = ['title', 'description', 'category', 'wageType', 'wageAmount', 'startDate', 'endDate', 'workersNeeded', 'status'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();
    res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a job
 * DELETE /api/jobs/:id
 */
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.postedBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    next(error);
  }
};
