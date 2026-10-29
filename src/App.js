import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { NotificationProvider } from './contexts/NotificationContext';

import AdminLogin from './components/pages/AdminLogin';
import AdminDashboard from './components/pages/AdminDashboard';
import AdminGallery from './components/pages/AdminGallery';
import AdminVideos from './components/pages/AdminVideos';
import AdminCourses from './components/pages/AdminCourses';
import AdminMessages from './components/pages/AdminMessages';
import AdminSettings from './components/pages/AdminSettings';
import AdminTestimonials from './components/pages/AdminTestimonials';
import AdminSchools from './components/pages/AdminSchools';
import AdminAlumni from './components/pages/AdminAlumni';
import AdminCharity from './components/pages/AdminCharity';
import AdminProfile from './components/pages/AdminProfile';
import AdminLoading from './components/common/AdminLoading';
import AdminLayout from './components/layout/AdminLayout';

// ==========================================
// PRIVATE ROUTE
// ==========================================
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AdminLoading fullScreen label="Verifying secure access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ==========================================
// APP
// ==========================================
function App() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/login" element={<AdminLogin />} />

      {/* ADMIN PRIVATE AREA */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <NotificationProvider>
              <AdminLayout />
            </NotificationProvider>
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="videos" element={<AdminVideos />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="schools" element={<AdminSchools />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="alumni" element={<AdminAlumni />} />
        <Route path="charity" element={<AdminCharity />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* NOT FOUND */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-black text-blue-950 mb-3">404</h1>
              <p className="text-xl font-semibold text-gray-700">Page Not Found</p>
              <a
                href="/"
                className="inline-flex mt-6 px-6 py-3 bg-blue-950 text-white rounded-xl hover:bg-blue-900 transition"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
