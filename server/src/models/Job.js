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
    is_finalized: {
      type: Boolean,
      default: false,
    },
    finalized_at: {
      type: Date,
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field untuk menghitung status otomatis berdasarkan tanggal
jobSchema.virtual('auto_status').get(function() {
  const now = new Date();
  const startDate = new Date(this.start_date);
  const endDate = new Date(this.end_date);

  // Reset waktu ke 00:00:00 untuk perbandingan tanggal saja
  now.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  // Jika sudah COMPLETED, tetap COMPLETED (tidak auto-change)
  if (this.status === 'COMPLETED') {
    return 'COMPLETED';
  }

  // Jika DRAFT, tetap DRAFT (tidak auto-change)
  if (this.status === 'DRAFT') {
    return 'DRAFT';
  }

  // Jika FINALIZED dan sudah mencapai/melewati tanggal mulai, auto menjadi ONGOING
  if (this.status === 'FINALIZED' && now >= startDate) {
    return 'ONGOING';
  }

  // Jika FINALIZED tapi belum tanggal mulai, tetap FINALIZED
  if (this.status === 'FINALIZED') {
    return 'FINALIZED';
  }

  // Jika ONGOING, tetap ONGOING (harus manual ke COMPLETED)
  if (this.status === 'ONGOING') {
    return 'ONGOING';
  }

  // Fallback: return status asli
  return this.status;
});

// Virtual field untuk cek apakah job sudah melewati deadline
jobSchema.virtual('is_overdue').get(function() {
  if (this.status !== 'ONGOING') return false;
  
  const now = new Date();
  const endDate = new Date(this.end_date);
  
  // Reset waktu ke 00:00:00
  now.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  // Jika sudah melewati tanggal selesai
  return now > endDate;
});

// Indexes
jobSchema.index({ status: 1 });
jobSchema.index({ start_date: 1 });
jobSchema.index({ end_date: 1 });
jobSchema.index({ created_by: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
