import express from 'express';
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  assignEmployees,
  removeEmployeeAssignment,
  finalizeJob,
  getJobStats,
} from '../controllers/jobController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/').get(getJobs).post(createJob);

router.route('/stats/summary').get(getJobStats);

router.route('/:id').get(getJob).put(updateJob).delete(deleteJob);

router.route('/:id/assign').post(assignEmployees);

router.route('/:jobId/assign/:employeeId').delete(removeEmployeeAssignment);

router.route('/:id/finalize').put(finalizeJob);

export default router;
