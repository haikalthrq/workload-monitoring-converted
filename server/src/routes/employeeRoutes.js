import express from 'express';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesWithSalaryThisMonth,
} from '../controllers/employeeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/').get(getEmployees).post(createEmployee);

router.route('/salary/current-month').get(getEmployeesWithSalaryThisMonth);

router
  .route('/:id')
  .get(getEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee);

export default router;
