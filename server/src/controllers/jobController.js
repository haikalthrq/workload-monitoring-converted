import Job from '../models/Job.js';
import JobAssignment from '../models/JobAssignment.js';
import Employee from '../models/Employee.js';

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
export const getJobs = async (req, res, next) => {
  try {
    const { status, type, search } = req.query;

    // Build filter
    const filter = {};
    // Note: status filter akan diaplikasikan setelah auto_status dihitung
    if (type) filter.type = type;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const jobs = await Job.find(filter)
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 });

    // Get assignments for each job
    let jobsWithAssignments = await Promise.all(
      jobs.map(async (job) => {
        const assignments = await JobAssignment.find({
          job_id: job._id,
        }).populate('employee_id', 'name employee_type img_url');

        const jobObj = job.toObject();
        return {
          ...jobObj,
          status: jobObj.auto_status, // Gunakan auto_status
          job_assignments: assignments,
        };
      })
    );

    // Filter by status if provided (after auto_status calculation)
    if (status) {
      jobsWithAssignments = jobsWithAssignments.filter(job => job.status === status);
    }

    res.status(200).json({
      success: true,
      count: jobsWithAssignments.length,
      data: jobsWithAssignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
export const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'created_by',
      'name email'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Get assignments with employee details
    const assignments = await JobAssignment.find({
      job_id: job._id,
    }).populate('employee_id');

    const jobObj = job.toObject();
    res.status(200).json({
      success: true,
      data: {
        ...jobObj,
        status: jobObj.auto_status, // Gunakan auto_status
        job_assignments: assignments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
export const createJob = async (req, res, next) => {
  try {
    // created_by is optional (set to null by default)
    const jobData = {
      ...req.body,
      created_by: req.body.created_by || null,
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
export const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if user is the creator (optional check since created_by can be null)
    if (
      job.created_by && 
      job.created_by.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job',
      });
    }

    const oldStatus = job.status;
    
    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // If job is marked as COMPLETED, check all assigned employees
    if (oldStatus !== 'COMPLETED' && job.status === 'COMPLETED') {
      const assignments = await JobAssignment.find({ job_id: job._id });
      
      for (const assignment of assignments) {
        // Check if employee has other active jobs
        const otherAssignments = await JobAssignment.find({
          employee_id: assignment.employee_id,
        }).populate('job_id');

        // Filter for jobs that are not COMPLETED
        const activeJobs = otherAssignments.filter(
          (a) => a.job_id && a.job_id.status !== 'COMPLETED'
        );

        // If no more active jobs, update status to AVAILABLE
        if (activeJobs.length === 0) {
          await Employee.findByIdAndUpdate(assignment.employee_id, {
            status: 'AVAILABLE',
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check auto_status for protection
    const currentStatus = job.auto_status;
    
    if (currentStatus === 'FINALIZED' || currentStatus === 'ONGOING' || currentStatus === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete job with status: ${currentStatus}. Only DRAFT jobs can be deleted.`,
      });
    }

    // Check if user is the creator (optional check since created_by can be null)
    if (
      job.created_by && 
      job.created_by.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job',
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    // Delete related assignments (no status update needed)
    await JobAssignment.deleteMany({ job_id: job._id });

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign employees to job
// @route   POST /api/jobs/:id/assign
// @access  Private
export const assignEmployees = async (req, res, next) => {
  try {
    const { employee_ids } = req.body;

    if (!employee_ids || !Array.isArray(employee_ids)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of employee IDs',
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if job is still in DRAFT status (only DRAFT jobs can have employees assigned)
    const currentStatus = job.auto_status;
    if (currentStatus !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: `Cannot assign employees to a ${currentStatus} job. Only DRAFT jobs can have employees assigned.`,
      });
    }

    // Create assignments
    const assignments = await Promise.all(
      employee_ids.map(async (employee_id) => {
        // Check if employee exists
        const employee = await Employee.findById(employee_id);
        if (!employee) {
          throw new Error(`Employee with ID ${employee_id} not found`);
        }

        // Prevent assigning UNAVAILABLE employees
        if (employee.status === 'UNAVAILABLE') {
          throw new Error(`Employee ${employee.name} is currently unavailable and cannot be assigned`);
        }

        // Check if already assigned
        const existingAssignment = await JobAssignment.findOne({
          job_id: job._id,
          employee_id,
        });

        if (existingAssignment) {
          return existingAssignment;
        }

        // Create new assignment and update employee status to ON_PROJECT
        const assignment = await JobAssignment.create({
          job_id: job._id,
          employee_id,
        });

        // Auto-update employee status to ON_PROJECT
        await Employee.findByIdAndUpdate(employee_id, {
          status: 'ON_PROJECT',
        });

        return assignment;
      })
    );

    res.status(201).json({
      success: true,
      message: 'Employees assigned successfully',
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove employee from job
// @route   DELETE /api/jobs/:jobId/assign/:employeeId
// @access  Private
export const removeEmployeeAssignment = async (req, res, next) => {
  try {
    const { jobId, employeeId } = req.params;

    // Check if job is finalized
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check auto_status
    const currentStatus = job.auto_status;
    
    if (currentStatus === 'FINALIZED' || currentStatus === 'ONGOING' || currentStatus === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: `Cannot remove employee from job with status: ${currentStatus}`,
      });
    }

    const assignment = await JobAssignment.findOneAndDelete({
      job_id: jobId,
      employee_id: employeeId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if employee has other active jobs
    const otherAssignments = await JobAssignment.find({
      employee_id: employeeId,
    }).populate('job_id');

    // Filter for jobs that are not COMPLETED
    const activeJobs = otherAssignments.filter(
      (a) => a.job_id && a.job_id.status !== 'COMPLETED'
    );

    // If no more active jobs, update status to AVAILABLE
    if (activeJobs.length === 0) {
      await Employee.findByIdAndUpdate(employeeId, {
        status: 'AVAILABLE',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee removed from job successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Finalize job (change status to FINALIZED)
// @route   PUT /api/jobs/:id/finalize
// @access  Private
export const finalizeJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Only DRAFT jobs can be finalized',
      });
    }

    job.status = 'FINALIZED';
    job.is_finalized = true;
    job.finalized_at = new Date();
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job finalized successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete job (change status to COMPLETED)
// @route   PUT /api/jobs/:id/complete
// @access  Private
export const completeJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check auto_status instead of status
    const currentStatus = job.auto_status;
    
    if (currentStatus !== 'ONGOING') {
      return res.status(400).json({
        success: false,
        message: `Only ONGOING jobs can be marked as completed. Current status: ${currentStatus}`,
      });
    }

    // Sync database status with auto_status if needed
    if (job.status === 'FINALIZED' && currentStatus === 'ONGOING') {
      job.status = 'ONGOING';
    }

    // Now mark as completed
    job.status = 'COMPLETED';
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job marked as completed successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job statistics
// @route   GET /api/jobs/stats/summary
// @access  Private
export const getJobStats = async (req, res, next) => {
  try {
    const totalJobs = await Job.countDocuments();
    const ongoingJobs = await Job.countDocuments({ status: 'ONGOING' });
    const completedJobs = await Job.countDocuments({ status: 'COMPLETED' });
    const draftJobs = await Job.countDocuments({ status: 'DRAFT' });
    const finalizedJobs = await Job.countDocuments({ status: 'FINALIZED' });

    res.status(200).json({
      success: true,
      data: {
        total: totalJobs,
        ongoing: ongoingJobs,
        completed: completedJobs,
        draft: draftJobs,
        finalized: finalizedJobs,
      },
    });
  } catch (error) {
    next(error);
  }
};
