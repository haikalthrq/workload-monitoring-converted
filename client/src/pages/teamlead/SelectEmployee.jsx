import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { employeeService } from '../../services/employeeService';
import { jobService } from '../../services/jobService';

export default function SelectEmployee() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll({ status: 'Available' });
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Gagal mengambil data karyawan');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp._id));
    }
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
      navigate(`/teamlead/jobs/${jobId}/finalize`);
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
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
              >
                {selectedEmployees.length === employees.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
              </Button>
              <span className="text-sm text-gray-600">
                {selectedEmployees.length} karyawan dipilih
              </span>
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
            <Table
              headers={['', 'Nama', 'Tipe', 'Status', 'Info']}
              data={employees}
              renderRow={(employee) => (
                <tr 
                  key={employee._id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectEmployee(employee._id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee._id)}
                      onChange={() => handleSelectEmployee(employee._id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {employee.img_url ? (
                        <img 
                          src={employee.img_url} 
                          alt={employee.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-600 font-medium">
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={employee.employee_type === 'Organik' ? 'info' : 'default'}>
                      {employee.employee_type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="success">{employee.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {employee.employee_type === 'Organik' && employee.department && (
                      <span>{employee.department}</span>
                    )}
                    {employee.employee_type === 'Mitra' && employee.last_education && (
                      <span>{employee.last_education}</span>
                    )}
                  </td>
                </tr>
              )}
              emptyMessage="Tidak ada karyawan yang tersedia"
            />
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
    </div>
  );
}
