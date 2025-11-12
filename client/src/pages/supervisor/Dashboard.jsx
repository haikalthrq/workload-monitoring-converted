import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { employeeService } from '../../services/employeeService';

export default function SupervisorDashboard() {
  const [employees, setEmployees] = useState([]);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesData, salaryDataRes] = await Promise.all([
        employeeService.getAll(),
        employeeService.getCurrentMonthSalary()
      ]);
      
      setEmployees(employeesData.employees || []);
      setSalaryData(salaryDataRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const variants = {
      Available: 'success',
      On_Project: 'warning',
      Unavailable: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const filteredEmployees = filter 
    ? employees.filter(emp => emp.employee_type === filter)
    : employees;

  // Hitung job count dan total gaji per employee dari salary details
  const getEmployeeJobCount = (employeeName) => {
    if (!salaryData || !salaryData.details) return 0;
    const employeeJobs = salaryData.details.filter(d => d.employeeName === employeeName);
    return employeeJobs.length;
  };

  const getEmployeeSalary = (employeeName) => {
    if (!salaryData || !salaryData.details) return 0;
    const employeeJobs = salaryData.details.filter(d => d.employeeName === employeeName);
    return employeeJobs.reduce((sum, job) => sum + job.salary, 0);
  };

  // Calculate statistics
  const stats = {
    total: employees.length,
    organik: employees.filter(e => e.employee_type === 'Organik').length,
    mitra: employees.filter(e => e.employee_type === 'Mitra').length,
    onProject: employees.filter(e => e.status === 'On_Project').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-cyan-500 to-cyan-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Supervisor Dashboard</h1>
          <p className="text-gray-100 mt-1">Monitor karyawan dan tracking gaji</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{stats.total}</h3>
              <p className="text-gray-600 mt-1">Total Karyawan</p>
            </div>
          </Card>

          <Card className="border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{stats.organik}</h3>
              <p className="text-gray-600 mt-1">Karyawan Organik</p>
            </div>
          </Card>

          <Card className="border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{stats.mitra}</h3>
              <p className="text-gray-600 mt-1">Karyawan Mitra</p>
            </div>
          </Card>

          <Card className="border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{stats.onProject}</h3>
              <p className="text-gray-600 mt-1">Sedang Proyek</p>
            </div>
          </Card>
        </div>

        {/* Salary Summary for Current Month */}
        {salaryData && (
          <Card title={`Ringkasan Gaji - ${salaryData.month}`} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Gaji Bulan Ini</p>
                <p className="text-2xl font-bold text-primary-600 mt-1">
                  {formatCurrency(salaryData.totalSalary)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Karyawan Aktif</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {salaryData.employeeCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rata-rata per Karyawan</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(salaryData.averageSalary)}
                </p>
              </div>
            </div>

            {salaryData.details && salaryData.details.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-4">Detail per Karyawan</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                  {salaryData.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{detail.employeeName}</p>
                        <p className="text-sm text-gray-600">{detail.jobTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">
                          {formatCurrency(detail.salary)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Employees Table */}
        <Card title="Daftar Karyawan">
          <div className="mb-4 flex gap-2">
            <button 
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filter === '' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilter('')}
            >
              Semua
            </button>
            <button 
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filter === 'Organik' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilter('Organik')}
            >
              Organik
            </button>
            <button 
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filter === 'Mitra' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilter('Mitra')}
            >
              Mitra
            </button>
          </div>

          {loading ? (
            <Loading className="py-8" />
          ) : (
            <Table
              headers={['Nama', 'Tipe', 'Status', 'Jumlah Job Bulan Ini', 'Total Gaji Bulan Ini', 'Aksi']}
              data={filteredEmployees}
              renderRow={(employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {employee.img_url ? (
                        <img 
                          src={employee.img_url} 
                          alt={employee.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-600 font-medium">
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={employee.employee_type === 'Organik' ? 'info' : 'default'}>
                      {employee.employee_type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(employee.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-medium text-gray-900">
                      {getEmployeeJobCount(employee.name)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(getEmployeeSalary(employee.name))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/supervisor/employees/${employee._id}`)}
                      className="text-cyan-700 hover:text-cyan-800"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Button>
                  </td>
                </tr>
              )}
              emptyMessage="Tidak ada karyawan"
            />
          )}
        </Card>
      </div>
    </div>
  );
}
