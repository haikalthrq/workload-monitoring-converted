import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AlertDialog } from '../components/ui/AlertDialog';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    registrationKey: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    if (!formData.role) {
      newErrors.role = 'Role harus dipilih';
    }

    if (!formData.registrationKey.trim()) {
      newErrors.registrationKey = 'Registration key harus diisi';
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
    setErrors({});

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        registrationKey: formData.registrationKey,
      });
      // Show success dialog instead of immediate redirect
      setShowSuccessDialog(true);
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-cyan-500 to-cyan-900 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Register Card */}
        <Card className="p-3">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-4xl font-bold text-cyan-800">Daftar Akun Baru</h1>
            <p className="text-sm text-gray-500">Silakan lengkapi data Anda</p>
          </div>
          
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          {/* Info Box */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Registrasi Terbatas</p>
                <p className="text-xs">Anda memerlukan <strong>Registration Key</strong> yang valid untuk mendaftar. Hubungi administrator untuk mendapatkan key.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              error={errors.name}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              error={errors.email}
              required
            />

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${formData.role === 'Team_Lead' ? 'border-cyan-600 bg-cyan-50' : 'border-gray-300'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="Team_Lead"
                    checked={formData.role === 'Team_Lead'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Team Lead</p>
                    <p className="text-xs text-gray-500">Kelola pekerjaan</p>
                  </div>
                </label>
                <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${formData.role === 'Supervisor' ? 'border-cyan-600 bg-cyan-50' : 'border-gray-300'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="Supervisor"
                    checked={formData.role === 'Supervisor'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Supervisor</p>
                    <p className="text-xs text-gray-500">Monitoring</p>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Registration Key */}
            <Input
              label="Registration Key"
              type="password"
              name="registrationKey"
              value={formData.registrationKey}
              onChange={handleChange}
              placeholder="Masukkan registration key"
              error={errors.registrationKey}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              required
            />

            <Input
              label="Konfirmasi Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
              required
            />

            <Button
              type="submit"
              className="w-full bg-cyan-700 hover:bg-cyan-800"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Daftar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-cyan-700 font-medium hover:underline">
                Login di sini
              </Link>
            </p>
          </div>
        </Card>
      </div>

      {/* Success Dialog */}
      <AlertDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title="Registrasi Berhasil! 🎉"
        description={`Akun dengan email ${formData.email} telah berhasil dibuat. Silakan login untuk melanjutkan.`}
        confirmText="Login Sekarang"
        onConfirm={handleSuccessDialogClose}
      />
    </div>
  );
}
