import Employee from '../models/Employee.js';
import EmployeeOrganikDetails from '../models/EmployeeOrganikDetail.js';
import EmployeeMitraDetails from '../models/EmployeeMitraDetail.js';
import JobAssignment from '../models/JobAssignment.js';
import MitraExperience from '../models/MitraExperience.js';
import OrganikWorkHistory from '../models/OrganikWorkHistory.js';

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
export const getEmployees = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;

    // Build filter
    const filter = {};
    if (type) filter.employee_type = type;
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const employees = await Employee.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee with details
// @route   GET /api/employees/:id
// @access  Private
export const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Get job assignments
    const jobAssignments = await JobAssignment.find({
      employee_id: employee._id,
    }).populate('job_id');

    // Get additional details based on employee type
    let additionalData = {};

    if (employee.employee_type === 'Mitra') {
      const mitraDetails = await EmployeeMitraDetails.findOne({
        employee_id: employee._id,
      });
      const experiences = await MitraExperience.find({
        employee_id: employee._id,
      }).populate('experience_type_id');
      
      additionalData.employee_mitra_details = mitraDetails;
      additionalData.mitra_experiences = experiences;
    } else if (employee.employee_type === 'Organik') {
      const organikDetails = await EmployeeOrganikDetails.findOne({
        employee_id: employee._id,
      });
      const workHistory = await OrganikWorkHistory.find({
        employee_id: employee._id,
      }).sort({ start_date: -1 });
      
      additionalData.employee_organik_details = organikDetails;
      additionalData.organik_work_history = workHistory;
    }

    res.status(200).json({
      success: true,
      data: {
        ...employee.toObject(),
        job_assignments: jobAssignments,
        ...additionalData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private
export const createEmployee = async (req, res, next) => {
  try {
    const { employee_type, organik_details, mitra_details, ...employeeData } = req.body;

    // Create employee
    const employee = await Employee.create({
      ...employeeData,
      employee_type,
    });

    // Create details based on employee type
    if (employee_type === 'Organik' && organik_details) {
      await EmployeeOrganikDetails.create({
        employee_id: employee._id,
        ...organik_details,
      });
    } else if (employee_type === 'Mitra' && mitra_details) {
      await EmployeeMitraDetails.create({
        employee_id: employee._id,
        ...mitra_details,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
export const updateEmployee = async (req, res, next) => {
  try {
    const { organik_details, mitra_details, ...employeeData } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      employeeData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Update details if provided
    if (employee.employee_type === 'Organik' && organik_details) {
      await EmployeeOrganikDetails.findOneAndUpdate(
        { employee_id: employee._id },
        organik_details,
        { upsert: true, new: true }
      );
    } else if (employee.employee_type === 'Mitra' && mitra_details) {
      await EmployeeMitraDetails.findOneAndUpdate(
        { employee_id: employee._id },
        mitra_details,
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Delete related data
    await JobAssignment.deleteMany({ employee_id: employee._id });
    await MitraExperience.deleteMany({ employee_id: employee._id });
    await OrganikWorkHistory.deleteMany({ employee_id: employee._id });
    await EmployeeOrganikDetails.deleteOne({ employee_id: employee._id });
    await EmployeeMitraDetails.deleteOne({ employee_id: employee._id });

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employees with job assignments for current month
// @route   GET /api/employees/salary/current-month
// @access  Private
export const getEmployeesWithSalaryThisMonth = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const employees = await Employee.find();

    const employeesWithSalary = await Promise.all(
      employees.map(async (employee) => {
        const assignments = await JobAssignment.find({
          employee_id: employee._id,
        }).populate({
          path: 'job_id',
          match: {
            $or: [
              {
                start_date: { $lte: endOfMonth },
                end_date: { $gte: startOfMonth },
              },
            ],
            status: { $in: ['ONGOING', 'COMPLETED'] },
          },
        });

        // Filter out null jobs (from populate match that didn't match)
        const validAssignments = assignments.filter((a) => a.job_id !== null);

        const totalSalary = validAssignments.reduce((sum, assignment) => {
          return sum + (assignment.job_id?.estimated_honorarium || 0);
        }, 0);

        return {
          ...employee.toObject(),
          jobs_this_month: validAssignments.length,
          salary_this_month: totalSalary,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: employeesWithSalary.length,
      data: employeesWithSalary,
    });
  } catch (error) {
    next(error);
  }
};
