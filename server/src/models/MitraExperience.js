import mongoose from 'mongoose';

const mitraExperienceSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    experience_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExperienceType',
      required: [true, 'Experience type ID is required'],
    },
    year: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mitraExperienceSchema.index({ employee_id: 1 });
mitraExperienceSchema.index({ experience_type_id: 1 });

const MitraExperience = mongoose.model('MitraExperience', mitraExperienceSchema);

export default MitraExperience;
