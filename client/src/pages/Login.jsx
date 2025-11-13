import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AlertDialog } from '../components/ui/AlertDialog';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      // Show success dialog instead of immediate redirect
      setShowSuccessDialog(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-cyan-500 to-cyan-900 px-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <Card className="p-3">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-4xl font-bold text-cyan-800">Selamat Datang</h1>
            <p className="text-sm text-gray-500">Silakan masuk ke akun Anda</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="******"
              required
            />

            <Button
              type="submit"
              className="w-full bg-cyan-700 hover:bg-cyan-800"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum mempunyai akun?{' '}
              <Link to="/register" className="text-cyan-700 font-medium hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>
        </Card>
      </div>

      {/* Success Dialog */}
      <AlertDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title="Login Berhasil! 🎉"
        description={`Selamat datang kembali! Anda akan diarahkan ke dashboard.`}
        confirmText="Lanjutkan"
        onConfirm={handleSuccessDialogClose}
      />
    </div>
  );
}
