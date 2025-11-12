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
      enum: ['Organik', 'Mitra'],
      required: [true, 'Employee type is required'],
    },
    status: {
      type: String,
      enum: ['Available', 'Unavailable', 'On_Project'],
      default: 'Available',
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
