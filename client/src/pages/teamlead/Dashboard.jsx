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
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [salaryData, setSalaryData] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [filter, jobTypeFilter]);

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

        {/* Statistics Cards */}
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

        {/* Jobs Table */}
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
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
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
    </div>
  );
}
