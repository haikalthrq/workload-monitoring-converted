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
      enum: ['PLANNED', 'ONGOING', 'COMPLETED'],
      default: 'PLANNED',
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
  // Jika sudah ditandai COMPLETED manual, tetap COMPLETED
  if (this.status === 'COMPLETED') {
    return 'COMPLETED';
  }

  const now = new Date();
  const startDate = new Date(this.start_date);
  const endDate = new Date(this.end_date);

  // Reset waktu ke 00:00:00 untuk perbandingan tanggal saja
  now.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (now < startDate) {
    return 'PLANNED'; // Belum dimulai
  } else if (now >= startDate && now <= endDate) {
    return 'ONGOING'; // Sedang berjalan
  } else {
    return 'COMPLETED'; // Sudah lewat tanggal selesai
  }
});

// Indexes
jobSchema.index({ status: 1 });
jobSchema.index({ start_date: 1 });
jobSchema.index({ end_date: 1 });
jobSchema.index({ created_by: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
