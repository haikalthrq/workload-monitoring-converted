import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { jobService } from '../../services/jobService';

export default function CreateJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    type: 'Sensus/Survey',
    start_date: '',
    end_date: '',
    transport_allowance: '',
    estimated_honorarium: '',
    honor_document_basis: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Nama pekerjaan harus diisi';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Tanggal mulai harus diisi';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Tanggal selesai harus diisi';
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'Tanggal selesai harus setelah tanggal mulai';
    }

    if (!formData.transport_allowance || formData.transport_allowance < 0) {
      newErrors.transport_allowance = 'Tunjangan transport harus diisi dengan nilai valid';
    }

    if (!formData.estimated_honorarium || formData.estimated_honorarium < 0) {
      newErrors.estimated_honorarium = 'Estimasi honorarium harus diisi dengan nilai valid';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        ...formData,
        transport_allowance: Number(formData.transport_allowance),
        estimated_honorarium: Number(formData.estimated_honorarium),
        honor_document_basis: Number(formData.honor_document_basis || 0),
      };

      const response = await jobService.create(jobData);
      
      // Redirect to select employee page
      // Backend returns { success, message, data: job }
      navigate(`/teamlead/jobs/${response.data._id}/select-employee`);
    } catch (error) {
      console.error('Error creating job:', error);
      setErrors({
        general: error.response?.data?.message || 'Gagal membuat pekerjaan'
      });
      setLoading(false);
    }
  };

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

        <Card title="Buat Pekerjaan Baru">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nama Pekerjaan"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: SUSENAS 2025"
              error={errors.title}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Pekerjaan
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Sensus/Survey">Sensus/Survey</option>
                <option value="Kegiatan Lain">Kegiatan Lain</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tanggal Mulai"
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                error={errors.start_date}
                required
              />

              <Input
                label="Tanggal Selesai"
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                error={errors.end_date}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tunjangan Transport (Rp)"
                type="number"
                name="transport_allowance"
                value={formData.transport_allowance}
                onChange={handleChange}
                placeholder="100000"
                error={errors.transport_allowance}
                required
              />

              <Input
                label="Estimasi Honorarium (Rp)"
                type="number"
                name="estimated_honorarium"
                value={formData.estimated_honorarium}
                onChange={handleChange}
                placeholder="500000"
                error={errors.estimated_honorarium}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dasar Dokumen Honor
              </label>
              <textarea
                name="honor_document_basis"
                value={formData.honor_document_basis}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="SK Kepala BPS No. ..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/teamlead/dashboard')}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Menyimpan...' : 'Lanjut ke Pilih Karyawan'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
