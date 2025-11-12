import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingPage } from '../../components/ui/Loading';
import { AlertDialog } from '../../components/ui/AlertDialog';
import { jobService } from '../../services/jobService';

export default function FinalizeJob() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await jobService.getById(jobId);
      setJob(data.job);
    } catch (error) {
      console.error('Error fetching job:', error);
      setError('Gagal mengambil data pekerjaan');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    setSubmitting(true);
    setError('');

    try {
      await jobService.update(jobId, { status: 'FINALIZED' });
      setShowSuccessDialog(true);
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        navigate('/teamlead/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal finalisasi pekerjaan');
      setSubmitting(false);
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

  if (loading) {
    return <LoadingPage />;
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Pekerjaan tidak ditemukan</p>
            <Button onClick={() => navigate('/teamlead/dashboard')} className="mt-4">
              Kembali ke Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/teamlead/dashboard')}
          >
            ← Kembali ke Dashboard
          </Button>
        </div>

        <Card title="Finalisasi Pekerjaan">
          <div className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Catatan:</strong> Setelah finalisasi, pekerjaan akan siap untuk dimulai. 
                Pastikan semua informasi sudah benar sebelum melanjutkan.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Pekerjaan</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nama Pekerjaan</p>
                  <p className="font-medium">{job.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jenis</p>
                  <p className="font-medium">{job.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Mulai</p>
                  <p className="font-medium">{formatDate(job.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Selesai</p>
                  <p className="font-medium">{formatDate(job.end_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tunjangan Transport</p>
                  <p className="font-medium">{formatCurrency(job.transport_allowance)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimasi Honorarium</p>
                  <p className="font-medium">{formatCurrency(job.estimated_honorarium)}</p>
                </div>
              </div>
              {job.honor_document_basis && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Dasar Dokumen Honor</p>
                  <p className="font-medium">{job.honor_document_basis}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Karyawan yang Ditugaskan ({job.employees?.length || 0})
              </h3>
              {job.employees && job.employees.length > 0 ? (
                <div className="space-y-2">
                  {job.employees.map((employee, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {employee.img_url ? (
                          <img 
                            src={employee.img_url} 
                            alt={employee.name}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                            <span className="text-gray-600 font-medium">
                              {employee.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="font-medium">{employee.name}</span>
                      </div>
                      <Badge variant={employee.employee_type === 'Organik' ? 'info' : 'default'}>
                        {employee.employee_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Belum ada karyawan yang ditugaskan</p>
              )}
            </div>

            <div className="border-t pt-6 flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/teamlead/jobs/${jobId}/select-employee`)}
                className="flex-1"
              >
                Ubah Karyawan
              </Button>
              <Button
                onClick={handleFinalize}
                disabled={submitting || !job.employees || job.employees.length === 0}
                className="flex-1"
              >
                {submitting ? 'Memproses...' : 'Finalisasi Pekerjaan'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Success AlertDialog */}
      <AlertDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          navigate('/teamlead/dashboard');
        }}
        title="Berhasil!"
        description="Pekerjaan berhasil difinalisasi dan siap untuk dijalankan."
        variant="success"
      />
    </div>
  );
}
