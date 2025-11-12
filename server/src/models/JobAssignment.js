import mongoose from 'mongoose';

const jobAssignmentSchema = new mongoose.Schema(
  {
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

// Compound index to prevent duplicate assignments
jobAssignmentSchema.index({ job_id: 1, employee_id: 1 }, { unique: true });

// Index for faster queries
jobAssignmentSchema.index({ job_id: 1 });
jobAssignmentSchema.index({ employee_id: 1 });

const JobAssignment = mongoose.model('JobAssignment', jobAssignmentSchema);

export default JobAssignment;
