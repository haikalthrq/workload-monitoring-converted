import mongoose from 'mongoose';

const employeeOrganikDetailsSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true,
  },
  department: {
    type: String,
    default: null,
  },
});

// Index
employeeOrganikDetailsSchema.index({ employee_id: 1 });

const EmployeeOrganikDetails = mongoose.model('EmployeeOrganikDetails', employeeOrganikDetailsSchema);

export default EmployeeOrganikDetails;
