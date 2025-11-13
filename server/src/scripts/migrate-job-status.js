/**
 * Migration Script: Update Job Status from PLANNED to DRAFT
 * Run this once to migrate existing jobs to new status system
 */

import mongoose from 'mongoose';
import Job from '../models/Job.js';

const migrateJobStatus = async () => {
  try {
    console.log('🔄 Starting job status migration...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/workload_monitoring');
    console.log('✅ Connected to database');

    // Find all jobs with PLANNED status
    const plannedJobs = await Job.find({ status: 'PLANNED' });
    console.log(`📊 Found ${plannedJobs.length} job(s) with PLANNED status`);

    if (plannedJobs.length === 0) {
      console.log('✨ No jobs to migrate');
      await mongoose.disconnect();
      return;
    }

    // Update all PLANNED jobs to DRAFT
    const result = await Job.updateMany(
      { status: 'PLANNED' },
      { 
        $set: { 
          status: 'DRAFT',
          is_finalized: false,
          finalized_at: null
        } 
      }
    );

    console.log(`✅ Successfully migrated ${result.modifiedCount} job(s)`);
    console.log('📝 Updated jobs:');
    
    plannedJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} (${job._id})`);
    });

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run migration
migrateJobStatus();
