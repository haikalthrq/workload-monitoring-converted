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
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

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
      // Fetch ALL employees (Available, On_Project, and Unavailable)
      const response = await employeeService.getAll();
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
    if (employee.status === 'Unavailable') {
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

  const handleSelectAll = () => {
    // Only select Available and On_Project employees (exclude Unavailable)
    const selectableEmployees = filteredEmployees.filter(emp => emp.status !== 'Unavailable');
    
    if (selectedEmployees.length === selectableEmployees.length && selectableEmployees.length > 0) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(selectableEmployees.map(emp => emp._id));
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
              data={filteredEmployees}
              renderRow={(employee) => {
                const isUnavailable = employee.status === 'Unavailable';
                const isOnProject = employee.status === 'On_Project';
                
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
                      <Badge 
                        variant={
                          employee.status === 'Available' ? 'success' : 
                          employee.status === 'On_Project' ? 'warning' : 
                          'destructive'
                        }
                      >
                        {employee.status === 'Available' ? 'Tersedia' :
                         employee.status === 'On_Project' ? 'Sedang Bertugas' :
                         'Tidak Tersedia'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {employee.employee_type === 'Organik' && employee.department && (
                        <span>{employee.department}</span>
                      )}
                      {employee.employee_type === 'Mitra' && employee.last_education && (
                        <span>{employee.last_education}</span>
                      )}
                      {isUnavailable && (
                        <span className="text-red-600 font-medium">❌ Tidak dapat dipilih</span>
                      )}
                    </td>
                  </tr>
                );
              }}
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
