import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';
import EmployeeOrganikDetail from './models/EmployeeOrganikDetail.js';
import EmployeeMitraDetail from './models/EmployeeMitraDetail.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample Employee Data
const organicEmployees = [
  { name: 'Tejo Sutrisno', email: 'tejo@example.com', nip: '198501012010011001', department: 'Pelayanan Umum' },
  { name: 'Siti Rahmawati', email: 'siti.rahma@example.com', nip: '198702152011012002', department: 'Keuangan' },
  { name: 'Budi Santoso', email: 'budi.santoso@example.com', nip: '199003202012011003', department: 'Teknologi Informasi' },
  { name: 'Dewi Anggraini', email: 'dewi.anggra@example.com', nip: '198805102013012004', department: 'Kepegawaian' },
  { name: 'Agus Wibowo', email: 'agus.wibowo@example.com', nip: '199104252014011005', department: 'Humas' },
];

const mitraEmployees = [
  { name: 'Rudi Hermawan', email: 'rudi.hermawan@example.com', contract_type: 'Kontrak', contract_duration: 12 },
  { name: 'Lisa Permata', email: 'lisa.permata@example.com', contract_type: 'Freelance', contract_duration: 6 },
  { name: 'Joko Prasetyo', email: 'joko.prasetyo@example.com', contract_type: 'Kontrak', contract_duration: 12 },
  { name: 'Maya Sari', email: 'maya.sari@example.com', contract_type: 'Part-time', contract_duration: 3 },
  { name: 'Andi Wijaya', email: 'andi.wijaya@example.com', contract_type: 'Kontrak', contract_duration: 24 },
];

const seedData = async () => {
  try {
    // Clear existing data
    await Employee.deleteMany({});
    await EmployeeOrganikDetail.deleteMany({});
    await EmployeeMitraDetail.deleteMany({});

    console.log('Cleared existing employee data');

    // Create Organic Employees
    for (const emp of organicEmployees) {
      const employee = await Employee.create({
        name: emp.name,
        employee_type: 'Organik',
        status: 'Available', // All new employees are Available by default
      });

      await EmployeeOrganikDetail.create({
        employee_id: employee._id,
        nip: emp.nip,
        department: emp.department,
        position: 'Staff',
      });

      console.log(`Created organic employee: ${emp.name}`);
    }

    // Create Mitra Employees
    for (const emp of mitraEmployees) {
      const employee = await Employee.create({
        name: emp.name,
        employee_type: 'Mitra',
        status: 'Available', // All new employees are Available by default
      });

      await EmployeeMitraDetail.create({
        employee_id: employee._id,
        contract_type: emp.contract_type,
        contract_duration: emp.contract_duration,
        contract_start_date: new Date(),
        contract_end_date: new Date(Date.now() + emp.contract_duration * 30 * 24 * 60 * 60 * 1000),
      });

      console.log(`Created mitra employee: ${emp.name}`);
    }

    console.log('\n✅ Seed data created successfully!');
    console.log(`Total employees: ${organicEmployees.length + mitraEmployees.length}`);
    console.log(`- Organic: ${organicEmployees.length}`);
    console.log(`- Mitra: ${mitraEmployees.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run seed
connectDB().then(() => seedData());
