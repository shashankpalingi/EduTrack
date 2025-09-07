import { Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import Index from './pages/Index';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import { useState } from 'react';
import Preloader from './components/ui/preloader';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <Preloader onLoadComplete={() => setIsLoading(false)} />
      <div className={`${isLoading ? 'hidden' : ''}`}>
        <AuthProvider>
          <div className="app-container">
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected student routes */}
              <Route element={<ProtectedRoute requiredRole="student" />}>
                <Route path="/student-dashboard" element={<StudentDashboard />} />
              </Route>
              
              {/* Protected teacher routes */}
              <Route element={<ProtectedRoute requiredRole="teacher" />}>
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              </Route>
              
              <Route path="*" element={<Index />} />
            </Routes>
          </div>
        </AuthProvider>
      </div>
    </>
  );
}

export default App;
