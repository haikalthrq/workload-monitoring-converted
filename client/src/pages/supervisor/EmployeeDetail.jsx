import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { LoadingPage } from '../../components/ui/Loading';
import { employeeService } from '../../services/employeeService';

export default function EmployeeDetail() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployeeDetail();
  }, [employeeId]);

  const fetchEmployeeDetail = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getById(employeeId);
      setEmployee(data.employee);
    } catch (error) {
      console.error('Error fetching employee:', error);
      setError('Gagal mengambil data karyawan');
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

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      Available: 'success',
      On_Project: 'warning',
      Unavailable: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-cyan-500 to-cyan-900">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Card>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error || 'Karyawan tidak ditemukan'}</p>
              <Button onClick={() => navigate('/supervisor/dashboard')}>
                Kembali ke Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-bl from-cyan-500 to-cyan-900">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/supervisor/dashboard')}
            className="text-white hover:bg-white/10"
          >
            ← Kembali ke Dashboard
          </Button>
        </div>

        {/* Employee Profile Card */}
        <Card title="Detail Karyawan" className="mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {employee.img_url ? (
                <img 
                  src={employee.img_url} 
                  alt={employee.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl text-gray-600 font-bold">
                    {employee.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Employee Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant={employee.employee_type === 'Organik' ? 'info' : 'default'}>
                    {employee.employee_type}
                  </Badge>
                  {getStatusBadge(employee.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Organik Details */}
                {employee.employee_type === 'Organik' && employee.department && (
                  <div>
                    <p className="text-sm text-gray-600">Departemen</p>
                    <p className="font-medium">{employee.department}</p>
                  </div>
                )}

                {/* Mitra Details */}
                {employee.employee_type === 'Mitra' && (
                  <>
                    {employee.date_of_birth && (
                      <div>
                        <p className="text-sm text-gray-600">Tanggal Lahir</p>
                        <p className="font-medium">{formatDate(employee.date_of_birth)}</p>
                      </div>
                    )}
                    {employee.last_education && (
                      <div>
                        <p className="text-sm text-gray-600">Pendidikan Terakhir</p>
                        <p className="font-medium">{employee.last_education}</p>
                      </div>
                    )}
                    {employee.village && (
                      <div>
                        <p className="text-sm text-gray-600">Desa</p>
                        <p className="font-medium">{employee.village}</p>
                      </div>
                    )}
                    {employee.sub_district && (
                      <div>
                        <p className="text-sm text-gray-600">Kecamatan</p>
                        <p className="font-medium">{employee.sub_district}</p>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <p className="text-sm text-gray-600">Dibuat pada</p>
                  <p className="font-medium">{formatDate(employee.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Job Assignments */}
        {employee.job_assignments && employee.job_assignments.length > 0 && (
          <Card title="Riwayat Penugasan" className="mb-6">
            <Table
              headers={['Nama Pekerjaan', 'Tanggal Mulai', 'Tanggal Selesai', 'Honorarium', 'Status']}
              data={employee.job_assignments}
              renderRow={(assignment) => (
                <tr key={assignment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">
                      {assignment.job?.title || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(assignment.job?.start_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(assignment.job?.end_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-green-600">
                      {formatCurrency(assignment.job?.estimated_honorarium)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      assignment.job?.status === 'COMPLETED' ? 'success' :
                      assignment.job?.status === 'ONGOING' ? 'warning' : 'info'
                    }>
                      {assignment.job?.status || 'DRAFT'}
                    </Badge>
                  </td>
                </tr>
              )}
              emptyMessage="Belum ada penugasan"
            />
          </Card>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">Total Penugasan</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {employee.job_assignments?.length || 0}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">Total Honorarium</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(
                  employee.job_assignments?.reduce((sum, assignment) => 
                    sum + (assignment.job?.estimated_honorarium || 0), 0
                  ) || 0
                )}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">Status Saat Ini</p>
              <div className="mt-2 flex justify-center">
                {getStatusBadge(employee.status)}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
