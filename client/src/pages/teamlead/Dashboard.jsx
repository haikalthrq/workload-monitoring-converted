import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { jobService } from '../../services/jobService';
import { employeeService } from '../../services/employeeService';

export default function TeamLeadDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [viewMode, setViewMode] = useState('jobs'); // 'jobs' or 'employees'
  const [filter, setFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [salaryData, setSalaryData] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [employeeToUpdate, setEmployeeToUpdate] = useState(null);
  const [statusFormData, setStatusFormData] = useState({
    status: '',
    unavailable_start_date: '',
    unavailable_end_date: '',
    unavailable_reason: '',
  });

  useEffect(() => {
    if (viewMode === 'jobs') {
      fetchJobs();
    } else {
      fetchEmployees();
    }
  }, [filter, jobTypeFilter, employeeTypeFilter, viewMode]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter) params.status = filter;
      if (jobTypeFilter) params.job_type = jobTypeFilter;
      
      const data = await jobService.getAll(params);
      setJobs(data.jobs || []);
      
      // Fetch salary data
      await fetchSalaryData();
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (employeeTypeFilter) params.type = employeeTypeFilter;
      
      const response = await employeeService.getAll(params);
      setEmployees(response.data || []);
      
      // Fetch salary data
      await fetchSalaryData();
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryData = async () => {
    try {
      const data = await employeeService.getCurrentMonthSalary();
      setSalaryData(data);
    } catch (error) {
      console.error('Error fetching salary data:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      DRAFT: 'default',
      FINALIZED: 'info',
      ONGOING: 'warning',
      COMPLETED: 'success',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const handleViewDetails = async (jobId) => {
    try {
      const data = await jobService.getById(jobId);
      setSelectedJob(data.job);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const handleViewEmployeeDetails = async (employeeId) => {
    try {
      const data = await employeeService.getById(employeeId);
      setSelectedEmployee(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate statistics
  const stats = {
    total: jobs.length,
    ongoing: jobs.filter(j => j.status === 'ONGOING').length,
    completed: jobs.filter(j => j.status === 'COMPLETED').length,
  };

  const employeeStats = {
    total: employees.length,
    organik: employees.filter(e => e.employee_type === 'Organik').length,
    mitra: employees.filter(e => e.employee_type === 'Mitra').length,
    available: employees.filter(e => e.status === 'Available').length,
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setFilter('');
    setJobTypeFilter('');
    setEmployeeTypeFilter('');
    setSearchQuery('');
    if (mode === 'jobs') {
      setSelectedEmployee(null);
    } else {
      setSelectedJob(null);
    }
  };

  const handleStatusChange = (employee) => {
    setEmployeeToUpdate(employee);
    setStatusFormData({
      status: employee.status === 'Available' ? 'Unavailable' : 'Available',
      unavailable_start_date: employee.unavailable_start_date 
        ? new Date(employee.unavailable_start_date).toISOString().split('T')[0] 
        : '',
      unavailable_end_date: employee.unavailable_end_date 
        ? new Date(employee.unavailable_end_date).toISOString().split('T')[0] 
        : '',
      unavailable_reason: employee.unavailable_reason || '',
    });
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!employeeToUpdate) return;

    try {
      const dataToSend = {
        status: statusFormData.status,
      };

      // Only include unavailable details if changing to Unavailable
      if (statusFormData.status === 'Unavailable') {
        if (statusFormData.unavailable_start_date) {
          dataToSend.unavailable_start_date = statusFormData.unavailable_start_date;
        }
        if (statusFormData.unavailable_end_date) {
          dataToSend.unavailable_end_date = statusFormData.unavailable_end_date;
        }
        if (statusFormData.unavailable_reason) {
          dataToSend.unavailable_reason = statusFormData.unavailable_reason;
        }
      }
      
      await employeeService.updateStatus(employeeToUpdate._id, dataToSend);
      
      // Refresh employee list
      await fetchEmployees();
      
      setShowStatusModal(false);
      setEmployeeToUpdate(null);
      setStatusFormData({
        status: '',
        unavailable_start_date: '',
        unavailable_end_date: '',
        unavailable_reason: '',
      });
    } catch (error) {
      console.error('Error updating employee status:', error);
      alert(error.response?.data?.message || 'Failed to update employee status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-cyan-500 to-cyan-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-white">
              Team Leader
            </h1>
            <p className="text-base text-gray-100 mt-1">
              Kelola pekerjaan dan tugaskan karyawan
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/teamlead/jobs/create')}
              className="bg-brand-primary hover:bg-brand-secondary text-white"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create new job
            </Button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => handleViewModeChange('jobs')}
            variant={viewMode === 'jobs' ? 'primary' : 'outline'}
            className={viewMode === 'jobs' ? 'bg-white text-cyan-600 hover:bg-gray-100' : 'bg-white/20 text-white hover:bg-white/30'}
          >
            Daftar Pekerjaan
          </Button>
          <Button
            onClick={() => handleViewModeChange('employees')}
            variant={viewMode === 'employees' ? 'primary' : 'outline'}
            className={viewMode === 'employees' ? 'bg-white text-cyan-600 hover:bg-gray-100' : 'bg-white/20 text-white hover:bg-white/30'}
          >
            Daftar Karyawan
          </Button>
        </div>

        {/* Statistics Cards */}
        {viewMode === 'jobs' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-none">
              <div className="flex flex-col px-5 py-4">
                <h3 className="text-4xl font-bold text-gray-900">{stats.total}</h3>
                <p className="text-gray-600 mt-1">Total Job</p>
              </div>
            </Card>

            <Card className="border-none">
              <div className="flex flex-col px-5 py-4">
                <h3 className="text-4xl font-bold text-gray-900">{stats.ongoing}</h3>
                <p className="text-gray-600 mt-1">On Going Job</p>
              </div>
            </Card>

            <Card className="border-none">
              <div className="flex flex-col px-5 py-4">
                <h3 className="text-4xl font-bold text-gray-900">{stats.completed}</h3>
                <p className="text-gray-600 mt-1">Completed</p>
              </div>
            </Card>

            <Card 
              className="border-none cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setShowSalaryModal(true)}
            >
              <div className="flex flex-col px-5 py-4">
                <h3 className="text-4xl font-bold text-green-600">
                  {formatCurrency(salaryData?.totalSalary || 0)}
                </h3>
                <p className="text-gray-600 mt-1">Total Gaji Bulan Ini</p>
                <p className="text-xs text-gray-500 mt-1">Klik untuk detail</p>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-none">
              <div className="flex flex-col px-5 py-4">
                <h3 className="text-4xl font-bold text-gray-900">{employeeStats.total}</h3>
                <p className="text-gray-600 mt-1">Total Karyawan</p>
              </div>
            </Card>

            <Card className="border-none">
              <div className="flex flex-col px-5 py-4">
                <h3 className="text-4xl font-bold text-gray-900">{employeeStats.organik}</h3>
                <p className="text-gray-600 mt-1">Organik</p>
              </div>
            </Card>

            <Card className="border-none">
              <div className="flex flex-col px-5 py-4">
                <h3 className="text-4xl font-bold text-gray-900">{employeeStats.mitra}</h3>
                <p className="text-gray-600 mt-1">Mitra</p>
              </div>
            </Card>

            <Card className="border-none">
              <div className="flex flex-col px-5 py-4">
                <h3 className="text-4xl font-bold text-green-600">{employeeStats.available}</h3>
                <p className="text-gray-600 mt-1">Available</p>
              </div>
            </Card>
          </div>
        )}

        {/* Jobs Table */}
        {viewMode === 'jobs' ? (
          <Card title="Daftar Pekerjaan">
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
              {/* Job Type Filter Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Jenis Pekerjaan:</label>
                <select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Semua Jenis</option>
                  <option value="SUSENAS">SUSENAS</option>
                  <option value="SAKERNAS">SAKERNAS</option>
                  <option value="VHTL">VHTL</option>
                  <option value="KEPKA">KEPKA</option>
                </select>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={filter === '' ? 'primary' : 'ghost'}
                  onClick={() => setFilter('')}
                >
                  Semua
                </Button>
                <Button 
                  size="sm" 
                  variant={filter === 'DRAFT' ? 'primary' : 'ghost'}
                  onClick={() => setFilter('DRAFT')}
                >
                  Draft
                </Button>
                <Button 
                  size="sm" 
                  variant={filter === 'ONGOING' ? 'primary' : 'ghost'}
                  onClick={() => setFilter('ONGOING')}
                >
                  Berjalan
                </Button>
                <Button 
                  size="sm" 
                  variant={filter === 'COMPLETED' ? 'primary' : 'ghost'}
                  onClick={() => setFilter('COMPLETED')}
                >
                  Selesai
                </Button>
              </div>
            </div>

            {loading ? (
              <Loading className="py-8" />
            ) : (
              <Table
                headers={['Nama Pekerjaan', 'Jenis', 'Tanggal Mulai', 'Tanggal Selesai', 'Status', 'Aksi']}
                data={jobs}
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
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(job._id)}
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                )}
                emptyMessage="Belum ada pekerjaan"
              />
            )}
          </Card>
        ) : (
          <Card title="Daftar Karyawan">
            <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-2">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari nama karyawan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Employee Type Filter */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={employeeTypeFilter === '' ? 'primary' : 'ghost'}
                    onClick={() => setEmployeeTypeFilter('')}
                  >
                    Semua
                  </Button>
                  <Button 
                    size="sm" 
                    variant={employeeTypeFilter === 'Organik' ? 'primary' : 'ghost'}
                    onClick={() => setEmployeeTypeFilter('Organik')}
                  >
                    Organik
                  </Button>
                  <Button 
                    size="sm" 
                    variant={employeeTypeFilter === 'Mitra' ? 'primary' : 'ghost'}
                    onClick={() => setEmployeeTypeFilter('Mitra')}
                  >
                    Mitra
                  </Button>
                </div>
              </div>

              {/* Create Employee Button */}
              <Button
                onClick={() => navigate('/teamlead/employees/create')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Karyawan
              </Button>
            </div>

            {loading ? (
              <Loading className="py-8" />
            ) : (
              <Table
                headers={['Nama', 'Tipe', 'Status', 'Aksi']}
                data={filteredEmployees}
                renderRow={(employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={employee.employee_type === 'Organik' ? 'info' : 'default'}>
                        {employee.employee_type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={
                          employee.status === 'Available' ? 'success' :
                          employee.status === 'On_Project' ? 'warning' :
                          'default'
                        }
                      >
                        {employee.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewEmployeeDetails(employee._id)}
                        >
                          Detail
                        </Button>
                        {employee.status !== 'On_Project' && (
                          <Button 
                            size="sm" 
                            variant="primary"
                            onClick={() => handleStatusChange(employee)}
                          >
                            Ubah Status
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                emptyMessage="Belum ada karyawan"
              />
            )}
          </Card>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && !selectedEmployee && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedJob(null);
          }}
          title={selectedJob.title}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Jenis Pekerjaan</p>
                <p className="font-medium">{selectedJob.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="mt-1">{getStatusBadge(selectedJob.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal Mulai</p>
                <p className="font-medium">{formatDate(selectedJob.start_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal Selesai</p>
                <p className="font-medium">{formatDate(selectedJob.end_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tunjangan Transport</p>
                <p className="font-medium">{formatCurrency(selectedJob.transport_allowance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimasi Honorarium</p>
                <p className="font-medium">{formatCurrency(selectedJob.estimated_honorarium)}</p>
              </div>
            </div>
            
            {selectedJob.honor_document_basis && (
              <div>
                <p className="text-sm text-gray-600">Dasar Dokumen Honor</p>
                <p className="font-medium">{selectedJob.honor_document_basis}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Karyawan yang Ditugaskan</h4>
              {selectedJob.employees && selectedJob.employees.length > 0 ? (
                <div className="space-y-2">
                  {selectedJob.employees.map((emp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{emp.name}</span>
                      <Badge variant={emp.employee_type === 'Organik' ? 'info' : 'default'}>
                        {emp.employee_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Belum ada karyawan yang ditugaskan</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Employee Details Modal */}
      {selectedEmployee && !selectedJob && (
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tipe Karyawan</p>
                <Badge variant={selectedEmployee.employee_type === 'Organik' ? 'info' : 'default'}>
                  {selectedEmployee.employee_type}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge 
                  variant={
                    selectedEmployee.status === 'Available' ? 'success' :
                    selectedEmployee.status === 'On_Project' ? 'warning' :
                    'default'
                  }
                >
                  {selectedEmployee.status}
                </Badge>
              </div>
            </div>

            {/* Unavailable Details */}
            {selectedEmployee.status === 'Unavailable' && (
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

            <div className="grid grid-cols-2 gap-4">
              {selectedEmployee.employee_type === 'Organik' ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600">NIP</p>
                    <p className="font-medium">{selectedEmployee.organik_detail?.nip || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Jabatan</p>
                    <p className="font-medium">{selectedEmployee.organik_detail?.position || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Unit Kerja</p>
                    <p className="font-medium">{selectedEmployee.organik_detail?.department || '-'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal Mulai Kontrak</p>
                    <p className="font-medium">
                      {selectedEmployee.mitra_detail?.contract_start_date 
                        ? formatDate(selectedEmployee.mitra_detail.contract_start_date) 
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal Akhir Kontrak</p>
                    <p className="font-medium">
                      {selectedEmployee.mitra_detail?.contract_end_date 
                        ? formatDate(selectedEmployee.mitra_detail.contract_end_date) 
                        : '-'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {selectedEmployee.current_jobs && selectedEmployee.current_jobs.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Pekerjaan Saat Ini</h4>
                <div className="space-y-2">
                  {selectedEmployee.current_jobs.map((job, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-600">{job.type}</p>
                      <div className="mt-1">
                        {getStatusBadge(job.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Salary Detail Modal */}
      {showSalaryModal && salaryData && (
        <Modal
          isOpen={showSalaryModal}
          onClose={() => setShowSalaryModal(false)}
          title={`Detail Gaji Bulan ${salaryData.month || 'Ini'}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 pb-4 border-b">
              <div>
                <p className="text-sm text-gray-600">Total Gaji</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
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
                <p className="text-sm text-gray-600">Rata-rata</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(salaryData.averageSalary)}
                </p>
              </div>
            </div>

            {salaryData.details && salaryData.details.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Daftar Gaji Pegawai</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {salaryData.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{detail.employeeName}</p>
                        <p className="text-sm text-gray-600">{detail.jobTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(detail.salary)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Status Change Modal */}
      {showStatusModal && employeeToUpdate && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setEmployeeToUpdate(null);
            setStatusFormData({
              status: '',
              unavailable_start_date: '',
              unavailable_end_date: '',
              unavailable_reason: '',
            });
          }}
          title="Ubah Status Karyawan"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Karyawan</p>
              <p className="font-semibold text-gray-900">{employeeToUpdate.name}</p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">Status Saat Ini</p>
                <Badge 
                  variant={
                    employeeToUpdate.status === 'Available' ? 'success' :
                    employeeToUpdate.status === 'On_Project' ? 'warning' :
                    'default'
                  }
                >
                  {employeeToUpdate.status}
                </Badge>
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubah Status Menjadi <span className="text-red-500">*</span>
              </label>
              
              {/* Info Box */}
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Informasi Penting:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><strong>Unavailable</strong> hanya untuk karyawan yang <u>berhalangan hadir</u> (sakit, cuti, izin, dll)</li>
                      <li><strong>Bukan</strong> untuk karyawan yang sedang mengerjakan pekerjaan/proyek</li>
                      <li>Status <strong>On_Project</strong> akan otomatis berubah saat karyawan ditugaskan atau menyelesaikan pekerjaan</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                  <input
                    type="radio"
                    name="status"
                    value="Available"
                    checked={statusFormData.status === 'Available'}
                    onChange={(e) => setStatusFormData({ ...statusFormData, status: e.target.value })}
                    className="mr-2"
                  />
                  <div>
                    <p className="font-medium text-green-600">Available</p>
                    <p className="text-xs text-gray-500">Siap ditugaskan</p>
                  </div>
                </label>
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                  <input
                    type="radio"
                    name="status"
                    value="Unavailable"
                    checked={statusFormData.status === 'Unavailable'}
                    onChange={(e) => setStatusFormData({ ...statusFormData, status: e.target.value })}
                    className="mr-2"
                  />
                  <div>
                    <p className="font-medium text-gray-600">Unavailable</p>
                    <p className="text-xs text-gray-500">Tidak tersedia</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Unavailable Details (show only when Unavailable is selected) */}
            {statusFormData.status === 'Unavailable' && (
              <div className="space-y-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-sm text-yellow-800 mb-1">Detail Ketidaktersediaan</p>
                    <p className="text-xs text-yellow-700">Isi informasi alasan karyawan tidak dapat hadir/bekerja</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={statusFormData.unavailable_start_date}
                      onChange={(e) => setStatusFormData({ 
                        ...statusFormData, 
                        unavailable_start_date: e.target.value 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      value={statusFormData.unavailable_end_date}
                      onChange={(e) => setStatusFormData({ 
                        ...statusFormData, 
                        unavailable_end_date: e.target.value 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Alasan (Opsional)
                  </label>
                  <textarea
                    value={statusFormData.unavailable_reason}
                    onChange={(e) => setStatusFormData({ 
                      ...statusFormData, 
                      unavailable_reason: e.target.value 
                    })}
                    placeholder="Contoh: Cuti tahunan, Sakit demam, Izin keperluan keluarga, dll"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex items-start gap-2 text-xs text-yellow-800 bg-yellow-100 p-2 rounded">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p><strong>Perhatian:</strong> Karyawan dengan status Unavailable tidak dapat ditugaskan ke pekerjaan baru sampai status diubah kembali menjadi Available.</p>
                </div>
              </div>
            )}

            {/* Info untuk Available */}
            {statusFormData.status === 'Available' && employeeToUpdate.status === 'Unavailable' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Info:</strong> Karyawan akan kembali tersedia dan dapat ditugaskan ke pekerjaan.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusModal(false);
                  setEmployeeToUpdate(null);
                  setStatusFormData({
                    status: '',
                    unavailable_start_date: '',
                    unavailable_end_date: '',
                    unavailable_reason: '',
                  });
                }}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmStatusChange}
                disabled={!statusFormData.status}
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
