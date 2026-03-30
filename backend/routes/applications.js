const express = require('express');
const router = express.Router();
const { applyToJob, getApplicationsForJob, updateApplicationStatus, getMyApplications, completeApplication, getRecentFarmerApplications, withdrawApplication } = require('../controllers/applicationController');
const { auth, requireRole } = require('../middleware/auth');

// Worker applies to a job
router.post('/', auth, requireRole('worker'), applyToJob);

// Worker views their applications
router.get('/my', auth, requireRole('worker'), getMyApplications);

// Worker withdraws their application (pending or accepted only)
router.delete('/:id', auth, requireRole('worker'), withdrawApplication);

// Farmer views recent applications across all their jobs
router.get('/farmer-recent', auth, requireRole('farmer'), getRecentFarmerApplications);

// Farmer views applications for their job
router.get('/job/:jobId', auth, requireRole('farmer'), getApplicationsForJob);

// Farmer accepts/rejects an application
router.put('/:id/status', auth, requireRole('farmer'), updateApplicationStatus);

// Farmer marks application as completed
router.put('/:id/complete', auth, requireRole('farmer'), completeApplication);

module.exports = router;
