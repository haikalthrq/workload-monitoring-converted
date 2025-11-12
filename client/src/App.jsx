import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TeamLeadDashboard from './pages/teamlead/Dashboard';
import CreateJob from './pages/teamlead/CreateJob';
import SelectEmployee from './pages/teamlead/SelectEmployee';
import FinalizeJob from './pages/teamlead/FinalizeJob';
import SupervisorDashboard from './pages/supervisor/Dashboard';
import EmployeeDetail from './pages/supervisor/EmployeeDetail';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Team Lead Routes */}
          <Route 
            path="/teamlead/dashboard" 
            element={
              <ProtectedRoute>
                <TeamLeadDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teamlead/jobs/create" 
            element={
              <ProtectedRoute>
                <CreateJob />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teamlead/jobs/:jobId/select-employee" 
            element={
              <ProtectedRoute>
                <SelectEmployee />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teamlead/jobs/:jobId/finalize" 
            element={
              <ProtectedRoute>
                <FinalizeJob />
              </ProtectedRoute>
            } 
          />

          {/* Supervisor Routes */}
          <Route 
            path="/supervisor/dashboard" 
            element={
              <ProtectedRoute>
                <SupervisorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/supervisor/employees/:employeeId" 
            element={
              <ProtectedRoute>
                <EmployeeDetail />
              </ProtectedRoute>
            } 
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
