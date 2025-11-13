import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { employeeService } from '../../services/employeeService';
import { jobService } from '../../services/jobService';

export default function SupervisorDashboard() {
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [viewMode, setViewMode] = useState('employees'); // 'employees' or 'jobs'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortedEmployees, setSortedEmployees] = useState([]);
  const [sortedJobs, setSortedJobs] = useState([]);
  const [currentEmployeePage, setCurrentEmployeePage] = useState(1);
  const [currentJobPage, setCurrentJobPage] = useState(1);
  const itemsPerPage = 30;
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [employeeFilter, experienceFilter]);

  // Initialize sorted arrays when data changes
  useEffect(() => {
    setSortedJobs([]);
    setSortedEmployees([]);
  }, [jobs, employees]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (employeeFilter) params.type = employeeFilter;
      if (experienceFilter) params.experience = experienceFilter;
      
      const [employeesData, jobsData, salaryDataRes] = await Promise.all([
        employeeService.getAll(params),
        jobService.getAll(),
        employeeService.getCurrentMonthSalary()
      ]);
      
      setEmployees(employeesData.data || []);
      setJobs(jobsData.data || []);
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
      AVAILABLE: 'success',
      ON_PROJECT: 'warning',
      UNAVAILABLE: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status?.replace('_', ' ')}</Badge>;
  };

  const handleViewEmployeeDetails = async (employeeId) => {
    try {
      const response = await employeeService.getById(employeeId);
      console.log('Employee details:', response);
      setSelectedEmployee(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      alert('Gagal memuat detail karyawan');
    }
  };

  const filteredEmployees = employeeFilter 
    ? employees.filter(emp => emp.employee_type === employeeFilter)
    : employees;

  // Filter employees by search query
  const searchedEmployees = searchQuery
    ? filteredEmployees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employee_type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredEmployees;

  // Sort handlers
  const handleEmployeeSort = (headerIndex, direction) => {
    const fieldMap = {
      0: 'name',
      1: 'employee_type',
      2: 'status',
      // 3: 'pengalaman' - skip, no sort for experiences
      4: 'job_count', // Jumlah Job - special handling
    };
    
    const field = fieldMap[headerIndex];
    if (!field) {
      setSortedEmployees([...searchedEmployees]);
      return;
    }
    
    const sorted = [...searchedEmployees].sort((a, b) => {
      // Special handling for job count
      if (field === 'job_count') {
        const aCount = getEmployeeJobCount(a.name);
        const bCount = getEmployeeJobCount(b.name);
        
        if (direction === 'asc') {
          return aCount - bCount;
        } else {
          return bCount - aCount;
        }
      }
      
      // Regular field sorting
      let aVal = a[field] || '';
      let bVal = b[field] || '';
      
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
      
      if (direction === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
    
    setSortedEmployees(sorted);
  };

  const handleJobSort = (headerIndex, direction) => {
    const fieldMap = {
      0: 'title',
      1: 'type',
      2: 'status',
      3: 'start_date',
      4: 'end_date',
    };
    
    const field = fieldMap[headerIndex];
    if (!field) {
      setSortedJobs([...searchedJobs]);
      return;
    }
    
    const sorted = [...searchedJobs].sort((a, b) => {
      let aVal = a[field] || '';
      let bVal = b[field] || '';
      
      if (field === 'start_date' || field === 'end_date') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
        
        if (direction === 'asc') {
          return aVal - bVal;
        } else {
          return bVal - aVal;
        }
      }
      
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
      
      if (direction === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
    
    setSortedJobs(sorted);
  };

  // Filter jobs by search query and status
  const filteredJobs = jobFilter
    ? jobs.filter(job => job.status === jobFilter)
    : jobs;

  const searchedJobs = searchQuery
    ? filteredJobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.type?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredJobs;

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentEmployeePage(1);
  }, [employeeFilter, experienceFilter, searchQuery]);

  useEffect(() => {
    setCurrentJobPage(1);
  }, [jobFilter, searchQuery]);

  // Pagination helpers
  const getPaginatedData = (data, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  // Helper functions for job overdue
  const isJobOverdue = (job) => {
    if (job.auto_status !== 'ONGOING') return false;
    const now = new Date();
    const endDate = new Date(job.end_date);
    return now > endDate;
  };

  const getDaysOverdue = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = now - end;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate statistics
  const stats = {
    total: employees.length,
    organik: employees.filter(e => e.employee_type === 'ORGANIK').length,
    mitra: employees.filter(e => e.employee_type === 'MITRA').length,
    available: employees.filter(e => e.status === 'AVAILABLE').length,
    onProject: employees.filter(e => e.status === 'ON_PROJECT').length,
    unavailable: employees.filter(e => e.status === 'UNAVAILABLE').length,
  };

  const employeeStats = {
    sakernas: employees.filter(e => 
      e.experiences && e.experiences.some(exp => exp.experience_type_id?.name === 'SAKERNAS')
    ).length,
    susenas: employees.filter(e => 
      e.experiences && e.experiences.some(exp => exp.experience_type_id?.name === 'SUSENAS')
    ).length,
    vhtl: employees.filter(e => 
      e.experiences && e.experiences.some(exp => exp.experience_type_id?.name === 'VHTL')
    ).length,
    kepka: employees.filter(e => 
      e.experiences && e.experiences.some(exp => exp.experience_type_id?.name === 'KEPKA')
    ).length,
  };

  const jobStats = {
    total: jobs.length,
    draft: jobs.filter(j => j.status === 'DRAFT').length,
    ongoing: jobs.filter(j => j.status === 'ONGOING').length,
    completed: jobs.filter(j => j.status === 'COMPLETED').length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getJobStatusBadge = (status) => {
    const variants = {
      DRAFT: 'default',
      FINALIZED: 'info',
      ONGOING: 'warning',
      COMPLETED: 'success',
    };
    const labels = {
      DRAFT: 'Draft',
      FINALIZED: 'Final',
      ONGOING: 'Berlangsung',
      COMPLETED: 'Selesai',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{stats.organik}</h3>
              <p className="text-gray-600 mt-1">Karyawan Organik</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{stats.mitra}</h3>
              <p className="text-gray-600 mt-1">Karyawan Mitra</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{stats.total}</h3>
              <p className="text-gray-600 mt-1">Total Karyawan</p>
            </div>
          </Card>
        </div>

        {/* Status Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{stats.available}</h3>
              <p className="text-gray-600 mt-1">Available</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{stats.onProject}</h3>
              <p className="text-gray-600 mt-1">On Project</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{stats.unavailable}</h3>
              <p className="text-gray-600 mt-1">Unavailable</p>
            </div>
          </Card>
        </div>

        {/* Experience Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{employeeStats.sakernas}</h3>
              <p className="text-gray-600 mt-1">SAKERNAS</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{employeeStats.susenas}</h3>
              <p className="text-gray-600 mt-1">SUSENAS</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{employeeStats.vhtl}</h3>
              <p className="text-gray-600 mt-1">VHTL</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-pink-50 to-pink-100 border-none">
            <div className="flex flex-col px-5 py-4">
              <h3 className="text-4xl font-bold text-gray-900">{employeeStats.kepka}</h3>
              <p className="text-gray-600 mt-1">KEPKA</p>
            </div>
          </Card>
        </div>

        {/* Data Table with Toggle */}
        <Card>
          {/* View Mode Toggle */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  viewMode === 'employees'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setViewMode('employees');
                  setEmployeeFilter('');
                  setSearchQuery('');
                }}
              >
                📋 Daftar Karyawan
              </button>
              <button
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  viewMode === 'jobs'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setViewMode('jobs');
                  setJobFilter('');
                  setSearchQuery('');
                }}
              >
                💼 Daftar Pekerjaan
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder={viewMode === 'employees' ? 'Cari karyawan...' : 'Cari pekerjaan...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filters */}
          {viewMode === 'employees' ? (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Filter Tipe:</p>
              <div className="flex gap-2 mb-3">
                <button 
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    employeeFilter === '' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setEmployeeFilter('')}
                >
                  Semua
                </button>
                <button 
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    employeeFilter === 'ORGANIK' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setEmployeeFilter('ORGANIK')}
                >
                  ORGANIK
                </button>
                <button 
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    employeeFilter === 'MITRA' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setEmployeeFilter('MITRA')}
                >
                  MITRA
                </button>
              </div>
              
              <p className="text-sm font-medium text-gray-700 mb-2">Filter Pengalaman:</p>
              <div className="flex gap-2">
                <button 
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    experienceFilter === '' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setExperienceFilter('')}
                >
                  Semua
                </button>
                <button 
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    experienceFilter === 'SAKERNAS' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setExperienceFilter('SAKERNAS')}
                >
                  SAKERNAS
                </button>
                <button 
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    experienceFilter === 'SUSENAS' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setExperienceFilter('SUSENAS')}
                >
                  SUSENAS
                </button>
                <button 
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    experienceFilter === 'VHTL' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setExperienceFilter('VHTL')}
                >
                  VHTL
                </button>
                <button 
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    experienceFilter === 'KEPKA' 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setExperienceFilter('KEPKA')}
                >
                  KEPKA
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4 flex gap-2">
              <button 
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  jobFilter === '' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setJobFilter('')}
              >
                Semua
              </button>
              <button 
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  jobFilter === 'DRAFT' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setJobFilter('DRAFT')}
              >
                Draft
              </button>
              <button 
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  jobFilter === 'ONGOING' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setJobFilter('ONGOING')}
              >
                Berlangsung
              </button>
              <button 
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  jobFilter === 'COMPLETED' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setJobFilter('COMPLETED')}
              >
                Selesai
              </button>
            </div>
          )}

          {loading ? (
            <Loading className="py-8" />
          ) : viewMode === 'employees' ? (
            /* Employee Table */
            <>
              <Table
                headers={['Nama', 'Tipe', 'Status', 'Pengalaman', 'Jumlah Job', 'Aksi']}
                data={getPaginatedData(sortedEmployees.length > 0 ? sortedEmployees : searchedEmployees, currentEmployeePage)}
                sortable={true}
                onSort={handleEmployeeSort}
                renderRow={(employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{employee.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={employee.employee_type === 'ORGANIK' ? 'indigo' : 'purple'}>
                      {employee.employee_type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={
                        employee.status === 'AVAILABLE' ? 'success' :
                        employee.status === 'ON_PROJECT' ? 'warning' :
                        'danger'
                      }
                    >
                      {employee.status?.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {employee.experiences && employee.experiences.length > 0 ? (
                        employee.experiences.map((exp, index) => {
                          const expName = exp.experience_type_id?.name || 'N/A';
                          let variant = 'default';
                          
                          if (expName === 'SAKERNAS') variant = 'info';
                          else if (expName === 'SUSENAS') variant = 'purple';
                          else if (expName === 'VHTL') variant = 'cyan';
                          else if (expName === 'KEPKA') variant = 'pink';
                          
                          return (
                            <Badge 
                              key={index} 
                              variant={variant}
                              className="text-xs"
                            >
                              {expName}
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-medium text-gray-900">
                      {getEmployeeJobCount(employee.name)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewEmployeeDetails(employee._id)}
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              )}
              emptyMessage="Tidak ada karyawan"
            />
            <Pagination
              currentPage={currentEmployeePage}
              totalPages={getTotalPages((sortedEmployees.length > 0 ? sortedEmployees : searchedEmployees).length)}
              onPageChange={setCurrentEmployeePage}
              itemsPerPage={itemsPerPage}
              totalItems={(sortedEmployees.length > 0 ? sortedEmployees : searchedEmployees).length}
            />
            </>
          ) : (
            /* Jobs Table */
            <>
              <Table
                headers={['Nama Pekerjaan', 'Jenis', 'Tanggal Mulai', 'Tanggal Selesai', 'Status', 'Aksi']}
                data={getPaginatedData(sortedJobs.length > 0 ? sortedJobs : searchedJobs, currentJobPage)}
                sortable={true}
                onSort={handleJobSort}
                renderRow={(job) => (
                <tr key={job._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{job.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {job.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(job.start_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(job.end_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getJobStatusBadge(job.auto_status || job.status)}
                      {isJobOverdue(job) && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md border border-red-300 animate-pulse">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-semibold">+{getDaysOverdue(job.end_date)} hari</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {isJobOverdue(job) && (
                        <div className="relative group">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse cursor-pointer hover:bg-red-600 transition-colors">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Melewati deadline {getDaysOverdue(job.end_date)} hari
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              emptyMessage="Tidak ada pekerjaan"
            />
            <Pagination
              currentPage={currentJobPage}
              totalPages={getTotalPages((sortedJobs.length > 0 ? sortedJobs : searchedJobs).length)}
              onPageChange={setCurrentJobPage}
              itemsPerPage={itemsPerPage}
              totalItems={(sortedJobs.length > 0 ? sortedJobs : searchedJobs).length}
            />
            </>
          )}
        </Card>
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedEmployee(null);
          }}
          title={selectedEmployee.name}
          size="lg"
        >
          <div className="space-y-4">
            {/* Employee Type and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tipe Karyawan</p>
                <Badge variant={selectedEmployee.employee_type === 'ORGANIK' ? 'indigo' : 'purple'}>
                  {selectedEmployee.employee_type}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge 
                  variant={
                    selectedEmployee.status === 'AVAILABLE' ? 'success' :
                    selectedEmployee.status === 'ON_PROJECT' ? 'warning' :
                    'danger'
                  }
                >
                  {selectedEmployee.status?.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Experiences (for MITRA) */}
            {selectedEmployee.employee_type === 'MITRA' && selectedEmployee.mitra_experiences && selectedEmployee.mitra_experiences.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">Pengalaman</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.mitra_experiences.map((exp, index) => {
                    const expName = exp.experience_type_id?.name || 'N/A';
                    let variant = 'default';
                    
                    if (expName === 'SAKERNAS') variant = 'info';
                    else if (expName === 'SUSENAS') variant = 'purple';
                    else if (expName === 'VHTL') variant = 'cyan';
                    else if (expName === 'KEPKA') variant = 'pink';
                    
                    return (
                      <Badge key={index} variant={variant}>
                        {expName}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unavailable Details */}
            {selectedEmployee.status === 'UNAVAILABLE' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">Informasi Ketidaktersediaan</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedEmployee.unavailable_start_date && (
                    <div>
                      <p className="text-gray-600">Mulai</p>
                      <p className="font-medium">{formatDate(selectedEmployee.unavailable_start_date)}</p>
                    </div>
                  )}
                  {selectedEmployee.unavailable_end_date && (
                    <div>
                      <p className="text-gray-600">Selesai</p>
                      <p className="font-medium">{formatDate(selectedEmployee.unavailable_end_date)}</p>
                    </div>
                  )}
                </div>
                {selectedEmployee.unavailable_reason && (
                  <div className="mt-2">
                    <p className="text-gray-600 text-sm">Alasan</p>
                    <p className="font-medium text-sm">{selectedEmployee.unavailable_reason}</p>
                  </div>
                )}
              </div>
            )}

            {/* Employee Specific Details */}
            <div className="grid grid-cols-2 gap-4">
              {selectedEmployee.employee_type === 'ORGANIK' ? (
                <>
                  {selectedEmployee.employee_organik_details && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">NIP</p>
                        <p className="font-medium">{selectedEmployee.employee_organik_details.nip || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Jabatan</p>
                        <p className="font-medium">{selectedEmployee.employee_organik_details.position || '-'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Unit Kerja</p>
                        <p className="font-medium">{selectedEmployee.employee_organik_details.department || '-'}</p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {selectedEmployee.employee_mitra_details && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Tanggal Mulai Kontrak</p>
                        <p className="font-medium">
                          {selectedEmployee.employee_mitra_details.contract_start_date 
                            ? formatDate(selectedEmployee.employee_mitra_details.contract_start_date) 
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tanggal Akhir Kontrak</p>
                        <p className="font-medium">
                          {selectedEmployee.employee_mitra_details.contract_end_date 
                            ? formatDate(selectedEmployee.employee_mitra_details.contract_end_date) 
                            : '-'}
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Work History (for ORGANIK) */}
            {selectedEmployee.employee_type === 'ORGANIK' && selectedEmployee.organik_work_history && selectedEmployee.organik_work_history.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2 text-gray-700">Riwayat Pekerjaan</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedEmployee.organik_work_history.map((history, idx) => (
                    <div key={idx} className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
                      <p className="font-medium text-gray-900">{history.position}</p>
                      <p className="text-sm text-gray-600">{history.department}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(history.start_date)} - {history.end_date ? formatDate(history.end_date) : 'Sekarang'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Assignments */}
            {selectedEmployee.job_assignments && selectedEmployee.job_assignments.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3 text-gray-700">
                  Pekerjaan yang Di-assign ({selectedEmployee.job_assignments.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedEmployee.job_assignments.map((assignment, idx) => {
                    const job = assignment.job_id;
                    if (!job) return null;
                    
                    return (
                      <div key={idx} className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{job.title}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="inline-flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {job.type}
                              </span>
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(job.start_date)}
                              </span>
                              <span>→</span>
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(job.end_date)}
                              </span>
                            </div>
                            {assignment.role && (
                              <p className="text-xs text-gray-600 mt-1">
                                <span className="font-medium">Role:</span> {assignment.role}
                              </p>
                            )}
                          </div>
                          <div className="ml-3">
                            {getJobStatusBadge(job.status)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Job Assignments */}
            {(!selectedEmployee.job_assignments || selectedEmployee.job_assignments.length === 0) && (
              <div className="pt-4 border-t">
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">Belum ada pekerjaan yang di-assign</p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
