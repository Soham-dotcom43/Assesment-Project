import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AttendanceHistory from './pages/AttendanceHistory';
import ApplyLeave from './pages/ApplyLeave';
import Profile from './pages/Profile';
import HRDashboard from './pages/HRDashboard';
import AttendanceRecords from './pages/AttendanceRecords';
import LeaveApprovals from './pages/LeaveApprovals';
import EmployeeDirectory from './pages/EmployeeDirectory';

const AuthGate = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'employee' ? '/' : '/hr'} replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthGate><Login /></AuthGate>} />
          <Route path="/register" element={<AuthGate><Register /></AuthGate>} />

          {/* Employee routes */}
          <Route path="/" element={<ProtectedRoute roles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute roles={['employee']}><AttendanceHistory /></ProtectedRoute>} />
          <Route path="/leaves" element={<ProtectedRoute roles={['employee']}><ApplyLeave /></ProtectedRoute>} />

          {/* HR / Admin routes */}
          <Route path="/hr" element={<ProtectedRoute roles={['hr', 'admin']}><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/attendance" element={<ProtectedRoute roles={['hr', 'admin']}><AttendanceRecords /></ProtectedRoute>} />
          <Route path="/hr/leaves" element={<ProtectedRoute roles={['hr', 'admin']}><LeaveApprovals /></ProtectedRoute>} />
          <Route path="/hr/employees" element={<ProtectedRoute roles={['hr', 'admin']}><EmployeeDirectory /></ProtectedRoute>} />

          {/* Shared */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
