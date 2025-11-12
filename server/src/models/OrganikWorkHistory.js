import mongoose from 'mongoose';

const organikWorkHistorySchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    job_title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    start_date: {
      type: Date,
      default: null,
    },
    end_date: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
organikWorkHistorySchema.index({ employee_id: 1 });
organikWorkHistorySchema.index({ start_date: 1 });

const OrganikWorkHistory = mongoose.model('OrganikWorkHistory', organikWorkHistorySchema);

export default OrganikWorkHistory;
