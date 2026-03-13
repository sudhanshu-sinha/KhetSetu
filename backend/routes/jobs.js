const express = require('express');
const router = express.Router();
const { createJob, getNearbyJobs, getJobs, getJobById, getMyJobs, updateJob, deleteJob } = require('../controllers/jobController');
const { auth, requireRole } = require('../middleware/auth');
const { jobRules, nearbyRules, idParamRule, validate } = require('../middleware/validate');

// Public routes
router.get('/', getJobs);
router.get('/nearby', nearbyRules, validate, getNearbyJobs);
router.get('/:id', idParamRule, validate, getJobById);

// Protected routes (farmer only)
router.post('/', auth, requireRole('farmer'), jobRules, validate, createJob);
router.get('/user/my-jobs', auth, requireRole('farmer'), getMyJobs);
router.put('/:id', auth, requireRole('farmer'), idParamRule, validate, updateJob);
router.delete('/:id', auth, requireRole('farmer'), idParamRule, validate, deleteJob);

module.exports = router;
