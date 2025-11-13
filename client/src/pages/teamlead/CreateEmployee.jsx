import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { employeeService } from '../../services/employeeService';
import { AlertDialog } from '../../components/ui/AlertDialog';

export default function CreateEmployee() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    employee_type: 'Organik',
    status: 'Available',
    // Organik fields
    nip: '',
    department: '',
    position: '',
    // Mitra fields
    contract_type: '',
    contract_duration: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const employeeData = {
        name: formData.name,
        employee_type: formData.employee_type,
        status: formData.status,
      };

      if (formData.employee_type === 'Organik') {
        employeeData.organik_details = {
          nip: formData.nip,
          department: formData.department,
          position: formData.position,
        };
      } else {
        employeeData.mitra_details = {
          contract_type: formData.contract_type,
          contract_duration: Number(formData.contract_duration),
          contract_start_date: new Date(),
          contract_end_date: new Date(Date.now() + Number(formData.contract_duration) * 30 * 24 * 60 * 60 * 1000),
        };
      }

      await employeeService.create(employeeData);
      setShowSuccessDialog(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat karyawan baru');
      setLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
          >
            ← Kembali
          </Button>
        </div>

        <Card title="Tambah Karyawan Baru">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Informasi Dasar</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label htmlFor="employee_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Karyawan *
                </label>
                <select
                  id="employee_type"
                  name="employee_type"
                  required
                  value={formData.employee_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Organik">Organik</option>
                  <option value="Mitra">Mitra</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="On_Project">On Project</option>
                </select>
              </div>
            </div>

            {/* Organik Specific Fields */}
            {formData.employee_type === 'Organik' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Detail Karyawan Organik</h3>
                
                <div>
                  <label htmlFor="nip" className="block text-sm font-medium text-gray-700 mb-1">
                    NIP *
                  </label>
                  <Input
                    id="nip"
                    name="nip"
                    type="text"
                    required
                    value={formData.nip}
                    onChange={handleChange}
                    placeholder="Contoh: 198501012010011001"
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Departemen *
                  </label>
                  <Input
                    id="department"
                    name="department"
                    type="text"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Contoh: Teknologi Informasi"
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    Jabatan *
                  </label>
                  <Input
                    id="position"
                    name="position"
                    type="text"
                    required
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Contoh: Staff"
                  />
                </div>
              </div>
            )}

            {/* Mitra Specific Fields */}
            {formData.employee_type === 'Mitra' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Detail Karyawan Mitra</h3>
                
                <div>
                  <label htmlFor="contract_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Kontrak *
                  </label>
                  <select
                    id="contract_type"
                    name="contract_type"
                    required
                    value={formData.contract_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Pilih Tipe Kontrak</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contract_duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Durasi Kontrak (Bulan) *
                  </label>
                  <Input
                    id="contract_duration"
                    name="contract_duration"
                    type="number"
                    required
                    min="1"
                    value={formData.contract_duration}
                    onChange={handleChange}
                    placeholder="Contoh: 12"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Menyimpan...' : 'Simpan Karyawan'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Success Dialog */}
      <AlertDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title="Berhasil!"
        message="Karyawan baru berhasil ditambahkan."
        confirmText="OK"
        onConfirm={handleSuccessDialogClose}
      />
    </div>
  );
}
