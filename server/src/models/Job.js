import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Sensus/Survey', 'Kegiatan Lain'],
      default: null,
    },
    start_date: {
      type: Date,
      default: null,
    },
    end_date: {
      type: Date,
      default: null,
    },
    transport_allowance: {
      type: Number,
      default: 0,
    },
    estimated_honorarium: {
      type: Number,
      default: 0,
    },
    honor_document_basis: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'FINALIZED', 'ONGOING', 'COMPLETED'],
      default: 'DRAFT',
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

// Indexes
jobSchema.index({ status: 1 });
jobSchema.index({ start_date: 1 });
jobSchema.index({ end_date: 1 });
jobSchema.index({ created_by: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
