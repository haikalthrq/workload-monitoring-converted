import mongoose from 'mongoose';

const employeeMitraDetailsSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true,
  },
  date_of_birth: {
    type: Date,
    default: null,
  },
  last_education: {
    type: String,
    default: null,
  },
  village: {
    type: String,
    default: null,
  },
  sub_district: {
    type: String,
    default: null,
  },
});

// Index
employeeMitraDetailsSchema.index({ employee_id: 1 });

const EmployeeMitraDetails = mongoose.model('EmployeeMitraDetails', employeeMitraDetailsSchema);

export default EmployeeMitraDetails;
