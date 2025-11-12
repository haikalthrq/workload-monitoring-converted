import mongoose from 'mongoose';

const experienceTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Experience type name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

const ExperienceType = mongoose.model('ExperienceType', experienceTypeSchema);

export default ExperienceType;
