import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { employeeService } from '../../services/employeeService';
import { jobService } from '../../services/jobService';

export default function SelectEmployee() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [sortedEmployees, setSortedEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [job, setJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Check job status on mount
  useEffect(() => {
    const checkJobStatus = async () => {
      try {
        const response = await jobService.getById(jobId);
        const jobData = response.data;
        setJob(jobData);
        
        // Redirect if job is not DRAFT
        if (jobData.auto_status !== 'DRAFT') {
          navigate('/teamlead/dashboard', {
            state: { 
              error: `Tidak bisa assign karyawan ke pekerjaan dengan status ${jobData.auto_status}. Hanya pekerjaan DRAFT yang bisa diassign karyawan.` 
            }
          });
        }
      } catch (error) {
        console.error('Error checking job status:', error);
        navigate('/teamlead/dashboard', {
          state: { error: 'Gagal memeriksa status pekerjaan' }
        });
      }
    };
    
    checkJobStatus();
  }, [jobId, navigate]);

  useEffect(() => {
    fetchEmployees();
  }, [employeeTypeFilter, experienceFilter]);

  // Initialize sorted arrays when data changes
  useEffect(() => {
    setSortedEmployees([]);
  }, [filteredEmployees]);

  useEffect(() => {
    // Filter employees based on search query
    if (searchQuery.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employee_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (employeeTypeFilter) params.type = employeeTypeFilter;
      if (experienceFilter) params.experience = experienceFilter;
      
      // Fetch employees with filters
      const response = await employeeService.getAll(params);
      const employeeData = response.data || [];
      setEmployees(employeeData);
      setFilteredEmployees(employeeData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Gagal mengambil data karyawan');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = (employeeId, employee) => {
    // Prevent selecting Unavailable employees
    if (employee.status === 'UNAVAILABLE') {
      return;
    }

    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleViewEmployeeDetails = async (e, employeeId) => {
    e.stopPropagation(); // Prevent checkbox toggle
    try {
      const response = await employeeService.getById(employeeId);
      setSelectedEmployee(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      alert('Gagal memuat detail karyawan');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      PLANNED: 'info',
      ONGOING: 'warning',
      COMPLETED: 'success',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const handleSelectAll = () => {
    // Only select Available and On_Project employees (exclude Unavailable)
    const selectableEmployees = (sortedEmployees.length > 0 ? sortedEmployees : filteredEmployees)
      .filter(emp => emp.status !== 'UNAVAILABLE');
    
    if (selectedEmployees.length === selectableEmployees.length && selectableEmployees.length > 0) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(selectableEmployees.map(emp => emp._id));
    }
  };

  // Sort handler
  const handleEmployeeSort = (headerIndex, direction) => {
    const fieldMap = {
      1: 'name',
      2: 'employee_type',
      3: 'status',
    };
    
    const field = fieldMap[headerIndex];
    if (!field) {
      setSortedEmployees([...filteredEmployees]);
      return;
    }
    
    const sorted = [...filteredEmployees].sort((a, b) => {
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
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

  const handleSubmit = async () => {
    if (selectedEmployees.length === 0) {
      setError('Pilih minimal 1 karyawan');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await jobService.assignEmployees(jobId, selectedEmployees);
      navigate('/teamlead/dashboard', {
        state: { 
          success: `Berhasil menugaskan ${selectedEmployees.length} karyawan ke pekerjaan` 
        }
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal menugaskan karyawan');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/teamlead/dashboard')}
          >
            ← Kembali ke Dashboard
          </Button>
        </div>

        <Card title="Pilih Karyawan untuk Ditugaskan">
          {/* Search Bar and Create Button */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari karyawan berdasarkan nama atau tipe..."
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
            <Button
              onClick={() => navigate('/teamlead/employees/create')}
              className="whitespace-nowrap"
            >
              + Create Karyawan
            </Button>
          </div>

          {/* Select All and Counter */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
              >
                {selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0 
                  ? 'Batal Pilih Semua' 
                  : 'Pilih Semua'}
              </Button>
              <span className="text-sm text-gray-600">
                {selectedEmployees.length} karyawan dipilih
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Menampilkan {filteredEmployees.length} dari {employees.length} karyawan
            </span>
          </div>

          {/* Filters */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Filter Tipe:</p>
            <div className="flex gap-2 mb-3">
              <button 
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  employeeTypeFilter === '' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setEmployeeTypeFilter('')}
              >
                Semua
              </button>
              <button 
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  employeeTypeFilter === 'ORGANIK' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setEmployeeTypeFilter('ORGANIK')}
              >
                ORGANIK
              </button>
              <button 
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  employeeTypeFilter === 'MITRA' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setEmployeeTypeFilter('MITRA')}
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

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <Loading className="py-8" />
          ) : (
            <>
              <Table
                headers={['', 'Nama', 'Tipe', 'Status', 'Pengalaman', 'Aksi']}
                data={getPaginatedData(sortedEmployees.length > 0 ? sortedEmployees : filteredEmployees, currentPage)}
                sortable={true}
                onSort={handleEmployeeSort}
                renderRow={(employee) => {
                const isUnavailable = employee.status === 'UNAVAILABLE';
                const isOnProject = employee.status === 'ON_PROJECT';
                
                return (
                  <tr 
                    key={employee._id} 
                    className={`hover:bg-gray-50 ${isUnavailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => handleSelectEmployee(employee._id, employee)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee._id)}
                        disabled={isUnavailable}
                        onChange={() => handleSelectEmployee(employee._id, employee)}
                        className={`w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 ${isUnavailable ? 'cursor-not-allowed' : ''}`}
                      />
                    </td>
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
                        {employee.status === 'AVAILABLE' ? 'Tersedia' :
                         employee.status === 'ON_PROJECT' ? 'Sedang Bertugas' :
                         'Tidak Tersedia'}
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
                    <td className="px-6 py-4 text-sm">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleViewEmployeeDetails(e, employee._id)}
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                );
              }}
              emptyMessage="Tidak ada karyawan yang tersedia"
            />
            <Pagination
              currentPage={currentPage}
              totalPages={getTotalPages((sortedEmployees.length > 0 ? sortedEmployees : filteredEmployees).length)}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={(sortedEmployees.length > 0 ? sortedEmployees : filteredEmployees).length}
            />
            </>
          )}

          <div className="mt-6 flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/teamlead/dashboard')}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || selectedEmployees.length === 0}
              className="flex-1"
            >
              {submitting ? 'Menyimpan...' : `Tugaskan ${selectedEmployees.length} Karyawan`}
            </Button>
          </div>
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
    </div>
  );
}
