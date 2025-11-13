import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    img_url: {
      type: String,
      default: null,
    },
    employee_type: {
      type: String,
      enum: ['ORGANIK', 'MITRA'],
      required: [true, 'Employee type is required'],
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'UNAVAILABLE', 'ON_PROJECT'],
      default: 'AVAILABLE',
    },
    unavailable_start_date: {
      type: Date,
      default: null,
    },
    unavailable_end_date: {
      type: Date,
      default: null,
    },
    unavailable_reason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for better query performance
employeeSchema.index({ employee_type: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ name: 1 });

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
