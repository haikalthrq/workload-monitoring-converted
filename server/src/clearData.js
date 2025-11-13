import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Import models
import Employee from './models/Employee.js';
import Job from './models/Job.js';
import JobAssignment from './models/JobAssignment.js';
import User from './models/User.js';
import EmployeeMitraDetail from './models/EmployeeMitraDetail.js';
import EmployeeOrganikDetail from './models/EmployeeOrganikDetail.js';
import MitraExperience from './models/MitraExperience.js';
import OrganikWorkHistory from './models/OrganikWorkHistory.js';
import ExperienceType from './models/ExperienceType.js';

const clearAllData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🗑️  Starting data cleanup...\n');

    // Clear all collections
    const collections = [
      { model: JobAssignment, name: 'Job Assignments' },
      { model: Job, name: 'Jobs' },
      { model: MitraExperience, name: 'Mitra Experiences' },
      { model: OrganikWorkHistory, name: 'Organik Work Histories' },
      { model: EmployeeMitraDetail, name: 'Employee Mitra Details' },
      { model: EmployeeOrganikDetail, name: 'Employee Organik Details' },
      { model: Employee, name: 'Employees' },
      { model: ExperienceType, name: 'Experience Types' },
      { model: User, name: 'Users' }
    ];

    for (const { model, name } of collections) {
      const result = await model.deleteMany({});
      console.log(`✅ Cleared ${name}: ${result.deletedCount} documents deleted`);
    }

    console.log('\n🎉 All synthetic data has been cleared!');
    console.log('📁 Database structure remains intact for Team Lead to add new data');
    
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
};

clearAllData();
