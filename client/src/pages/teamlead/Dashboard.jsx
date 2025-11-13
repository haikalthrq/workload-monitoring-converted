import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { AlertDialog } from '../../components/ui/AlertDialog';
import { Pagination } from '../../components/ui/Pagination';
import { jobService } from '../../services/jobService';
import { employeeService } from '../../services/employeeService';

export default function TeamLeadDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showJobDetailModal, setShowJobDetailModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ title: '', description: '', variant: 'success' });
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState('jobs'); // 'jobs' or 'employees'
  const [filter, setFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
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
  const [sortedEmployees, setSortedEmployees] = useState([]);
  const [sortedJobs, setSortedJobs] = useState([]);
  
  // Pagination states
  const [currentJobPage, setCurrentJobPage] = useState(1);
  const [currentEmployeePage, setCurrentEmployeePage] = useState(1);
  const itemsPerPage = 30;

  // Check for redirect error messages
  useEffect(() => {
    if (location.state?.error) {
      setAlertConfig({
        title: 'Peringatan',
        description: location.state.error,
        variant: 'danger'
      });
      setShowAlertDialog(true);
      
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.success) {
      setAlertConfig({
        title: 'Berhasil',
        description: location.state.success,
        variant: 'success'
      });
      setShowAlertDialog(true);
      
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (viewMode === 'jobs') {
      fetchJobs();
    } else {
      fetchEmployees();
    }
  }, [filter, jobTypeFilter, employeeTypeFilter, experienceFilter, viewMode]);

  // Initialize sorted arrays when data changes
  useEffect(() => {
    setSortedJobs([]);
    setSortedEmployees([]);
  }, [jobs, employees]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter) params.status = filter;
      if (jobTypeFilter) params.job_type = jobTypeFilter;
      
      const response = await jobService.getAll(params);
      setJobs(response.data || []);
      
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
      if (experienceFilter) params.experience = experienceFilter;
      
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

  const getEmployeeJobCount = (employeeName) => {
    if (!salaryData || !salaryData.details) return 0;
    const employeeJobs = salaryData.details.filter(d => d.employeeName === employeeName);
    return employeeJobs.length;
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

  const handleViewJobDetails = async (jobId) => {
    try {
      console.log('Fetching job details for ID:', jobId);
      const response = await jobService.getById(jobId);
      console.log('Job details response:', response);
      setSelectedJob(response.data);
      setShowJobDetailModal(true);
      console.log('Modal should open now');
    } catch (error) {
      console.error('Error fetching job details:', error);
      alert('Gagal memuat detail pekerjaan: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewEmployeeDetails = async (employeeId) => {
    try {
      const response = await employeeService.getById(employeeId);
      console.log('Employee details:', response); // Debug log
      setSelectedEmployee(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      alert('Gagal memuat detail karyawan');
    }
  };

  // Job Management Functions
  const handleDeleteJob = () => {
    setConfirmAction({
      type: 'delete',
      title: 'Hapus Pekerjaan',
      description: 'Apakah Anda yakin ingin menghapus pekerjaan ini? Tindakan ini tidak dapat dibatalkan.',
      variant: 'danger',
      confirmText: 'Hapus',
      action: async () => {
        try {
          setActionLoading(true);
          await jobService.deleteJob(selectedJob._id);
          
          // Refresh data
          await fetchJobs();
          
          // Close modals
          setShowModal(false);
          setShowJobDetailModal(false);
          setSelectedJob(null);
          setShowConfirmDialog(false);
          
          // Show success alert
          setAlertConfig({
            title: 'Berhasil',
            description: 'Pekerjaan berhasil dihapus',
            variant: 'success'
          });
          setShowAlertDialog(true);
        } catch (error) {
          console.error('Error deleting job:', error);
          setShowConfirmDialog(false);
          setAlertConfig({
            title: 'Gagal',
            description: error.response?.data?.message || 'Gagal menghapus pekerjaan',
            variant: 'error'
          });
          setShowAlertDialog(true);
        } finally {
          setActionLoading(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleRemoveEmployee = (employeeId, employeeName) => {
    setConfirmAction({
      type: 'remove',
      title: 'Remove Karyawan',
      description: `Apakah Anda yakin ingin menghapus ${employeeName} dari pekerjaan ini?`,
      variant: 'warning',
      confirmText: 'Remove',
      action: async () => {
        try {
          setActionLoading(true);
          await jobService.removeEmployeeFromJob(selectedJob._id, employeeId);
          
          // Refresh job details
          const response = await jobService.getById(selectedJob._id);
          setSelectedJob(response.data);
          
          // Refresh data
          await fetchJobs();
          
          setShowConfirmDialog(false);
          
          // Show success alert
          setAlertConfig({
            title: 'Berhasil',
            description: 'Karyawan berhasil dihapus dari pekerjaan',
            variant: 'success'
          });
          setShowAlertDialog(true);
        } catch (error) {
          console.error('Error removing employee:', error);
          setShowConfirmDialog(false);
          setAlertConfig({
            title: 'Gagal',
            description: error.response?.data?.message || 'Gagal menghapus karyawan',
            variant: 'error'
          });
          setShowAlertDialog(true);
        } finally {
          setActionLoading(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleFinalizeJob = () => {
    setConfirmAction({
      type: 'finalize',
      title: 'Finalize Pekerjaan',
      description: 'Apakah Anda yakin ingin memfinalisasi pekerjaan ini? Setelah difinalisasi, Anda tidak dapat menghapus pekerjaan atau menghapus karyawan dari pekerjaan ini.',
      variant: 'warning',
      confirmText: 'Finalize',
      action: async () => {
        try {
          setActionLoading(true);
          await jobService.finalizeJob(selectedJob._id);
          
          // Refresh job details
          const response = await jobService.getById(selectedJob._id);
          setSelectedJob(response.data);
          
          // Refresh data
          await fetchJobs();
          
          setShowConfirmDialog(false);
          
          // Show success alert
          setAlertConfig({
            title: 'Berhasil',
            description: 'Pekerjaan berhasil difinalisasi',
            description: 'Pekerjaan berhasil difinalisasi',
            variant: 'success'
          });
          setShowAlertDialog(true);
        } catch (error) {
          console.error('Error finalizing job:', error);
          setShowConfirmDialog(false);
          setAlertConfig({
            title: 'Gagal',
            description: error.response?.data?.message || 'Gagal memfinalisasi pekerjaan',
            variant: 'error'
          });
          setShowAlertDialog(true);
        } finally {
          setActionLoading(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  const handleCompleteJob = () => {
    setConfirmAction({
      type: 'complete',
      title: 'Tandai Pekerjaan Selesai',
      description: 'Apakah Anda yakin ingin menandai pekerjaan ini sebagai selesai?',
      variant: 'info',
      confirmText: 'Tandai Selesai',
      action: async () => {
        try {
          setActionLoading(true);
          await jobService.completeJob(selectedJob._id);
          
          // Refresh job details
          const response = await jobService.getById(selectedJob._id);
          setSelectedJob(response.data);
          
          // Refresh data
          await fetchJobs();
          
          setShowConfirmDialog(false);
          
          // Show success alert
          setAlertConfig({
            title: 'Berhasil',
            description: 'Pekerjaan berhasil ditandai selesai',
            title: 'Berhasil',
            description: 'Pekerjaan berhasil ditandai selesai',
            variant: 'success'
          });
          setShowAlertDialog(true);
        } catch (error) {
          console.error('Error completing job:', error);
          setShowConfirmDialog(false);
          setAlertConfig({
            title: 'Gagal',
            description: error.response?.data?.message || 'Gagal menandai pekerjaan selesai',
            variant: 'error'
          });
          setShowAlertDialog(true);
        } finally {
          setActionLoading(false);
        }
      }
    });
    setShowConfirmDialog(true);
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

  const isJobOverdue = (job) => {
    if (job.status !== 'ONGOING') return false;
    const now = new Date();
    const endDate = new Date(job.end_date);
    now.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return now > endDate;
  };

  const getDaysOverdue = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    now.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = now - end;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate statistics
  const stats = {
    total: jobs.length,
    draft: jobs.filter(j => j.status === 'DRAFT').length,
    finalized: jobs.filter(j => j.status === 'FINALIZED').length,
    ongoing: jobs.filter(j => j.status === 'ONGOING').length,
    completed: jobs.filter(j => j.status === 'COMPLETED').length,
  };

  const employeeStats = {
    total: employees.length,
    organik: employees.filter(e => e.employee_type === 'ORGANIK').length,
    mitra: employees.filter(e => e.employee_type === 'MITRA').length,
    available: employees.filter(e => e.status === 'AVAILABLE').length,
    onProject: employees.filter(e => e.status === 'ON_PROJECT').length,
    unavailable: employees.filter(e => e.status === 'UNAVAILABLE').length,
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

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      setSortedEmployees([...filteredEmployees]);
      return;
    }
    
    const sorted = [...filteredEmployees].sort((a, b) => {
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
      
      // Convert to string for comparison
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
      2: 'start_date',
      3: 'end_date',
      4: 'status',
    };
    
    const field = fieldMap[headerIndex];
    if (!field) {
      setSortedJobs([...jobs]);
      return;
    }
    
    const sorted = [...jobs].sort((a, b) => {
      let aVal = a[field] || '';
      let bVal = b[field] || '';
      
      // Handle date fields
      if (field === 'start_date' || field === 'end_date') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
        
        if (direction === 'asc') {
          return aVal - bVal;
        } else {
          return bVal - aVal;
        }
      }
      
      // Convert to string for comparison
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

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setFilter('');
    setJobTypeFilter('');
    setEmployeeTypeFilter('');
    setExperienceFilter('');
    setSearchQuery('');
    setCurrentJobPage(1);
    setCurrentEmployeePage(1);
    if (mode === 'jobs') {
      setSelectedEmployee(null);
    } else {
      setSelectedJob(null);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentJobPage(1);
  }, [filter, jobTypeFilter, searchQuery]);

  useEffect(() => {
    setCurrentEmployeePage(1);
  }, [employeeTypeFilter, experienceFilter, searchQuery]);

  // Pagination helpers
  const getPaginatedData = (data, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  const handleStatusChange = (employee) => {
    setEmployeeToUpdate(employee);
    setStatusFormData({
      status: employee.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE',
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

      // Only include unavailable details if changing to UNAVAILABLE
      if (statusFormData.status === 'UNAVAILABLE') {
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
            className={viewMode === 'jobs' ? 'bg-cyan-900 text-white font-semibold hover:bg-cyan-800' : 'bg-white text-cyan-900 border-2 border-white hover:bg-white/90'}
          >
            Daftar Pekerjaan
          </Button>
          <Button
            onClick={() => handleViewModeChange('employees')}
            variant={viewMode === 'employees' ? 'primary' : 'outline'}
            className={viewMode === 'employees' ? 'bg-cyan-900 text-white font-semibold hover:bg-cyan-800' : 'bg-white text-cyan-900 border-2 border-white hover:bg-white/90'}
          >
            Daftar Karyawan
          </Button>
        </div>

        {/* Statistics Cards */}
        {viewMode === 'jobs' ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="border-none">
              <div className="flex flex-col px-5 py-4">
                <h3 className="text-4xl font-bold text-gray-900">{stats.total}</h3>
                <p className="text-gray-600 mt-1">Total Job</p>
              </div>
            </Card>

            <Card className="border-none bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex flex-col px-5 py-4">
                <h3 className="text-4xl font-bold text-gray-700">{stats.draft}</h3>
                <p className="text-gray-600 mt-1 font-medium">DRAFT</p>
              </div>
            </Card>

            <Card className="border-none bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex flex-col px-5 py-4">
                <h3 className="text-4xl font-bold text-blue-700">{stats.finalized}</h3>
                <p className="text-blue-600 mt-1 font-medium">FINALIZED</p>
              </div>
            </Card>

            <Card className="border-none bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex flex-col px-5 py-4">
                <h3 className="text-4xl font-bold text-orange-700">{stats.ongoing}</h3>
                <p className="text-orange-600 mt-1 font-medium">ONGOING</p>
              </div>
            </Card>

            <Card className="border-none bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex flex-col px-5 py-4">
                <h3 className="text-4xl font-bold text-green-700">{stats.completed}</h3>
                <p className="text-green-600 mt-1 font-medium">COMPLETED</p>
              </div>
            </Card>
          </div>
        ) : (
          <>
            {/* Employee Type Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="border-none">
                <div className="flex flex-col px-5 py-4">
                  <h3 className="text-4xl font-bold text-gray-900">{employeeStats.total}</h3>
                  <p className="text-gray-600 mt-1">Total Karyawan</p>
                </div>
              </Card>

              <Card className="border-none bg-gradient-to-br from-indigo-50 to-indigo-100">
                <div className="flex flex-col px-5 py-4">
                  <h3 className="text-4xl font-bold text-indigo-700">{employeeStats.organik}</h3>
                  <p className="text-indigo-600 mt-1 font-medium">ORGANIK</p>
                </div>
              </Card>

              <Card className="border-none bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex flex-col px-5 py-4">
                  <h3 className="text-4xl font-bold text-purple-700">{employeeStats.mitra}</h3>
                  <p className="text-purple-600 mt-1 font-medium">MITRA</p>
                </div>
              </Card>
            </div>

            {/* Employee Status Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="border-none bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex flex-col px-5 py-4">
                  <h3 className="text-4xl font-bold text-green-700">{employeeStats.available}</h3>
                  <p className="text-green-600 mt-1 font-medium">AVAILABLE</p>
                </div>
              </Card>

              <Card className="border-none bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="flex flex-col px-5 py-4">
                  <h3 className="text-4xl font-bold text-orange-700">{employeeStats.onProject}</h3>
                  <p className="text-orange-600 mt-1 font-medium">ON PROJECT</p>
                </div>
              </Card>

              <Card className="border-none bg-gradient-to-br from-red-50 to-red-100">
                <div className="flex flex-col px-5 py-4">
                  <h3 className="text-4xl font-bold text-red-700">{employeeStats.unavailable}</h3>
                  <p className="text-red-600 mt-1 font-medium">UNAVAILABLE</p>
                </div>
              </Card>
            </div>

            {/* Experience Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-none bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex flex-col px-5 py-4">
                  <h3 className="text-4xl font-bold text-blue-700">{employeeStats.sakernas}</h3>
                  <p className="text-blue-600 mt-1 font-medium">SAKERNAS</p>
                </div>
              </Card>

              <Card className="border-none bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex flex-col px-5 py-4">
                  <h3 className="text-4xl font-bold text-purple-700">{employeeStats.susenas}</h3>
                  <p className="text-purple-600 mt-1 font-medium">SUSENAS</p>
                </div>
              </Card>

              <Card className="border-none bg-gradient-to-br from-cyan-50 to-cyan-100">
                <div className="flex flex-col px-5 py-4">
                  <h3 className="text-4xl font-bold text-cyan-700">{employeeStats.vhtl}</h3>
                  <p className="text-cyan-600 mt-1 font-medium">VHTL</p>
                </div>
              </Card>

              <Card className="border-none bg-gradient-to-br from-pink-50 to-pink-100">
                <div className="flex flex-col px-5 py-4">
                  <h3 className="text-4xl font-bold text-pink-700">{employeeStats.kepka}</h3>
                  <p className="text-pink-600 mt-1 font-medium">KEPKA</p>
                </div>
              </Card>
            </div>
          </>
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
                  variant={filter === 'FINALIZED' ? 'primary' : 'ghost'}
                  onClick={() => setFilter('FINALIZED')}
                >
                  Finalized
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
              <>
                <Table
                  headers={['Nama Pekerjaan', 'Jenis', 'Tanggal Mulai', 'Tanggal Selesai', 'Status', 'Aksi']}
                  data={getPaginatedData(sortedJobs.length > 0 ? sortedJobs : jobs, currentJobPage)}
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
                        {getStatusBadge(job.status)}
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewJobDetails(job._id)}
                        >
                          Detail
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
                emptyMessage="Belum ada pekerjaan"
              />
              <Pagination
                currentPage={currentJobPage}
                totalPages={getTotalPages((sortedJobs.length > 0 ? sortedJobs : jobs).length)}
                onPageChange={setCurrentJobPage}
                itemsPerPage={itemsPerPage}
                totalItems={(sortedJobs.length > 0 ? sortedJobs : jobs).length}
              />
              </>
            )}
          </Card>
        ) : (
          <Card title="Daftar Karyawan">
            <div className="mb-4 flex flex-col gap-4">
              {/* Search Bar and Filters Row */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari nama karyawan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 w-64"
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
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700">Tipe:</span>
                  <Button 
                    size="sm" 
                    variant={employeeTypeFilter === '' ? 'primary' : 'ghost'}
                    onClick={() => setEmployeeTypeFilter('')}
                  >
                    Semua
                  </Button>
                  <Button 
                    size="sm" 
                    variant={employeeTypeFilter === 'ORGANIK' ? 'primary' : 'ghost'}
                    onClick={() => setEmployeeTypeFilter('ORGANIK')}
                  >
                    Organik
                  </Button>
                  <Button 
                    size="sm" 
                    variant={employeeTypeFilter === 'MITRA' ? 'primary' : 'ghost'}
                    onClick={() => setEmployeeTypeFilter('MITRA')}
                  >
                    Mitra
                  </Button>
                </div>
              </div>

              {/* Experience Filter Row */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-700">Pengalaman:</span>
                <Button 
                  size="sm" 
                  variant={experienceFilter === '' ? 'primary' : 'ghost'}
                  onClick={() => setExperienceFilter('')}
                >
                  Semua
                </Button>
                <Button 
                  size="sm" 
                  variant={experienceFilter === 'SAKERNAS' ? 'info' : 'ghost'}
                  onClick={() => setExperienceFilter('SAKERNAS')}
                  className={experienceFilter === 'SAKERNAS' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  SAKERNAS
                </Button>
                <Button 
                  size="sm" 
                  variant={experienceFilter === 'SUSENAS' ? 'primary' : 'ghost'}
                  onClick={() => setExperienceFilter('SUSENAS')}
                  className={experienceFilter === 'SUSENAS' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  SUSENAS
                </Button>
                <Button 
                  size="sm" 
                  variant={experienceFilter === 'VHTL' ? 'primary' : 'ghost'}
                  onClick={() => setExperienceFilter('VHTL')}
                  className={experienceFilter === 'VHTL' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
                >
                  VHTL
                </Button>
                <Button 
                  size="sm" 
                  variant={experienceFilter === 'KEPKA' ? 'primary' : 'ghost'}
                  onClick={() => setExperienceFilter('KEPKA')}
                  className={experienceFilter === 'KEPKA' ? 'bg-pink-600 hover:bg-pink-700' : ''}
                >
                  KEPKA
                </Button>
              </div>

              {/* Create Employee Button Row */}
              <div className="flex justify-end">
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
            </div>

            {loading ? (
              <Loading className="py-8" />
            ) : (
              <>
                <Table
                  headers={['Nama', 'Tipe', 'Status', 'Pengalaman', 'Jumlah Job', 'Aksi']}
                  data={getPaginatedData(sortedEmployees.length > 0 ? sortedEmployees : filteredEmployees, currentEmployeePage)}
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
                        {employee.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {employee.experiences && employee.experiences.length > 0 ? (
                          employee.experiences.map((exp, index) => {
                            const expName = exp.experience_type_id?.name || 'N/A';
                            let variant = 'default';
                            
                            // Assign different colors for each experience type
                            if (expName === 'SAKERNAS') variant = 'info'; // Blue
                            else if (expName === 'SUSENAS') variant = 'purple'; // Purple
                            else if (expName === 'VHTL') variant = 'cyan'; // Cyan
                            else if (expName === 'KEPKA') variant = 'pink'; // Pink
                            
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewEmployeeDetails(employee._id)}
                        >
                          Detail
                        </Button>
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={() => handleStatusChange(employee)}
                          disabled={employee.status === 'On_Project'}
                          title={employee.status === 'On_Project' ? 'Tidak bisa ubah status karyawan yang sedang dalam pekerjaan' : ''}
                        >
                          Ubah Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
                emptyMessage="Belum ada karyawan"
              />
              <Pagination
                currentPage={currentEmployeePage}
                totalPages={getTotalPages((sortedEmployees.length > 0 ? sortedEmployees : filteredEmployees).length)}
                onPageChange={setCurrentEmployeePage}
                itemsPerPage={itemsPerPage}
                totalItems={(sortedEmployees.length > 0 ? sortedEmployees : filteredEmployees).length}
              />
              </>
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
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Karyawan yang Ditugaskan</h4>
                {selectedJob.status === 'DRAFT' && selectedJob.employees && selectedJob.employees.length > 0 && (
                  <span className="text-xs text-gray-500">Click × untuk remove karyawan</span>
                )}
              </div>
              {selectedJob.employees && selectedJob.employees.length > 0 ? (
                <div className="space-y-2">
                  {selectedJob.employees.map((emp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <span>{emp.name}</span>
                        <Badge variant={emp.employee_type === 'ORGANIK' ? 'indigo' : 'purple'}>
                          {emp.employee_type}
                        </Badge>
                      </div>
                      {selectedJob.status === 'DRAFT' && (
                        <button
                          onClick={() => handleRemoveEmployee(emp._id, emp.name)}
                          className="text-red-600 hover:text-red-800 font-bold text-lg px-2"
                          title="Remove karyawan dari pekerjaan"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Belum ada karyawan yang ditugaskan</p>
              )}
            </div>

            {/* Action Buttons */}
            {selectedJob.status === 'DRAFT' && (
              <div className="pt-4 border-t flex justify-between gap-3">
                <Button
                  variant="danger"
                  onClick={handleDeleteJob}
                  className="flex-1"
                >
                  Hapus Pekerjaan
                </Button>
                <Button
                  variant="primary"
                  onClick={handleFinalizeJob}
                  className="flex-1"
                  disabled={!selectedJob.employees || selectedJob.employees.length === 0}
                >
                  Finalize Job
                </Button>
              </div>
            )}

            {selectedJob.status === 'FINALIZED' && (
              <div className="pt-4 border-t">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Job Sudah Difinalisasi</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Job ini sudah tidak dapat dihapus atau diubah assignment karyawannya.
                      {selectedJob.finalized_at && (
                        <span className="block mt-1">
                          Difinalisasi pada: {formatDate(selectedJob.finalized_at)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                  {selectedEmployee.status.replace('_', ' ')}
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
                            {getStatusBadge(job.status)}
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
                    value="AVAILABLE"
                    checked={statusFormData.status === 'AVAILABLE'}
                    onChange={(e) => setStatusFormData({ ...statusFormData, status: e.target.value })}
                    className="mr-2"
                  />
                  <div>
                    <p className="font-medium text-green-600">AVAILABLE</p>
                    <p className="text-xs text-gray-500">Siap ditugaskan</p>
                  </div>
                </label>
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                  <input
                    type="radio"
                    name="status"
                    value="UNAVAILABLE"
                    checked={statusFormData.status === 'UNAVAILABLE'}
                    onChange={(e) => setStatusFormData({ ...statusFormData, status: e.target.value })}
                    className="mr-2"
                  />
                  <div>
                    <p className="font-medium text-gray-600">UNAVAILABLE</p>
                    <p className="text-xs text-gray-500">Tidak tersedia</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Unavailable Details (show only when UNAVAILABLE is selected) */}
            {statusFormData.status === 'UNAVAILABLE' && (
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

            {/* Info untuk AVAILABLE */}
            {statusFormData.status === 'AVAILABLE' && employeeToUpdate.status === 'UNAVAILABLE' && (
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

      {/* Job Detail Modal */}
      {showJobDetailModal && selectedJob && (
        <Modal
          isOpen={showJobDetailModal}
          onClose={() => {
            setShowJobDetailModal(false);
            setSelectedJob(null);
          }}
          title="Detail Pekerjaan"
        >
          <div className="space-y-4">
            {/* Job Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pekerjaan
                </label>
                <p className="text-sm text-gray-900">{selectedJob.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Pekerjaan
                </label>
                <Badge variant="info">{selectedJob.type}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai
                </label>
                <p className="text-sm text-gray-900">{formatDate(selectedJob.start_date)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Selesai
                </label>
                <p className="text-sm text-gray-900">{formatDate(selectedJob.end_date)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tunjangan Transport
                </label>
                <p className="text-sm text-gray-900">{formatCurrency(selectedJob.transport_allowance)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimasi Honorarium
                </label>
                <p className="text-sm text-gray-900">{formatCurrency(selectedJob.estimated_honorarium)}</p>
              </div>
            </div>

            {selectedJob.honor_document_basis > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Honor Document Basis
                </label>
                <p className="text-sm text-gray-900">{formatCurrency(selectedJob.honor_document_basis)}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Pekerjaan
              </label>
              {getStatusBadge(selectedJob.status)}
            </div>

            {/* Assigned Employees */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Karyawan yang Ditugaskan ({selectedJob.job_assignments?.length || 0})
                </label>
                {selectedJob.auto_status === 'DRAFT' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setShowJobDetailModal(false);
                      navigate(`/teamlead/jobs/${selectedJob._id}/select-employee`);
                    }}
                  >
                    + Assign Karyawan
                  </Button>
                )}
              </div>
              
              {selectedJob.job_assignments && selectedJob.job_assignments.length > 0 ? (
                <div className="space-y-2">
                  {selectedJob.job_assignments.map((assignment) => (
                    <div 
                      key={assignment._id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                          <span className="text-cyan-700 font-semibold text-sm">
                            {assignment.employee_id?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{assignment.employee_id?.name}</p>
                          <p className="text-sm text-gray-500">
                            {assignment.employee_id?.employee_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={assignment.employee_id?.status === 'On_Project' ? 'warning' : 'success'}
                        >
                          {assignment.employee_id?.status}
                        </Badge>
                        {selectedJob.status === 'DRAFT' && (
                          <button
                            onClick={() => handleRemoveEmployee(assignment.employee_id?._id, assignment.employee_id?.name)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors shadow-sm"
                            title="Remove karyawan dari pekerjaan"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm mb-3">Belum ada karyawan yang ditugaskan</p>
                  {(selectedJob.status === 'DRAFT' || selectedJob.status === 'FINALIZED') && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setShowJobDetailModal(false);
                        navigate(`/teamlead/jobs/${selectedJob._id}/select-employee`);
                      }}
                    >
                      + Tambah Karyawan
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons for DRAFT */}
            {selectedJob.status === 'DRAFT' && (
              <div className="border-t pt-4">
                <div className="flex gap-3 mb-3">
                  <Button
                    variant="danger"
                    onClick={handleDeleteJob}
                    className="flex-1"
                  >
                    Hapus Pekerjaan
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleFinalizeJob}
                    className="flex-1"
                    disabled={!selectedJob.job_assignments || selectedJob.job_assignments.length === 0}
                  >
                    Finalize Job
                  </Button>
                </div>
                {(!selectedJob.job_assignments || selectedJob.job_assignments.length === 0) && (
                  <p className="text-xs text-amber-600 text-center">
                    Tambahkan karyawan terlebih dahulu sebelum finalize
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons for ONGOING */}
            {selectedJob.status === 'ONGOING' && (
              <div className="border-t pt-4">
                {isJobOverdue(selectedJob) && (
                  <div className="mb-3 bg-red-50 border-2 border-red-300 rounded-md p-3 flex items-start gap-2 animate-pulse">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-red-900">⚠️ Pekerjaan Melewati Deadline!</p>
                      <p className="text-xs text-red-700 mt-1">
                        Pekerjaan ini sudah melewati tanggal selesai <strong>{getDaysOverdue(selectedJob.end_date)} hari</strong> yang lalu.
                        Segera tandai sebagai selesai atau periksa progres pekerjaan.
                      </p>
                    </div>
                  </div>
                )}
                <Button
                  variant="primary"
                  onClick={handleCompleteJob}
                  className="w-full"
                >
                  ✓ Tandai Pekerjaan Selesai
                </Button>
              </div>
            )}

            {/* Info box for FINALIZED jobs */}
            {selectedJob.status === 'FINALIZED' && (
              <div className="border-t pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Job Sudah Difinalisasi</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Job ini sudah tidak dapat dihapus atau diubah assignment karyawannya.
                      {selectedJob.finalized_at && (
                        <span className="block mt-1">
                          Difinalisasi pada: {formatDate(selectedJob.finalized_at)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowJobDetailModal(false);
                  setSelectedJob(null);
                }}
              >
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false);
            setConfirmAction(null);
          }}
          onConfirm={confirmAction.action}
          title={confirmAction.title}
          description={confirmAction.description}
          variant={confirmAction.variant}
          confirmText={confirmAction.confirmText}
          isLoading={actionLoading}
        />
      )}

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={showAlertDialog}
        onClose={() => setShowAlertDialog(false)}
        title={alertConfig.title}
        description={alertConfig.description}
        variant={alertConfig.variant}
      />
    </div>
  );
}
