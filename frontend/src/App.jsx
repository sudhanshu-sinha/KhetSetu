import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import PhoneLogin from './pages/auth/PhoneLogin';
import OTPVerify from './pages/auth/OTPVerify';
import RoleSelect from './pages/auth/RoleSelect';
import ProfileSetup from './pages/auth/ProfileSetup';
import FarmerDashboard from './pages/FarmerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import PostJob from './pages/PostJob';
import BrowseJobs from './pages/BrowseJobs';
import JobDetail from './pages/JobDetail';
import MyJobs from './pages/MyJobs';
import MyApplications from './pages/MyApplications';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
// Ultra Feature Pages
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import WalletPage from './pages/WalletPage';
import PremiumPlans from './pages/PremiumPlans';
import LeaderboardPage from './pages/LeaderboardPage';

export default function App() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero dark:bg-gradient-hero-dark">
        <div className="text-center">
          <div className="text-6xl animate-float mb-6">🌾</div>
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[11px] text-gray-400 font-medium tracking-wider uppercase">KhetSetu Ultra</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'farmer' ? '/farmer' : '/worker'} /> : <PhoneLogin />} />
        <Route path="/verify-otp" element={<OTPVerify />} />
        <Route path="/select-role" element={isAuthenticated ? <RoleSelect /> : <Navigate to="/login" />} />
        <Route path="/setup-profile" element={isAuthenticated ? <ProfileSetup /> : <Navigate to="/login" />} />

        {/* Farmer */}
        <Route path="/farmer" element={<ProtectedRoute requiredRole="farmer"><FarmerDashboard /></ProtectedRoute>} />
        <Route path="/post-job" element={<ProtectedRoute requiredRole="farmer"><PostJob /></ProtectedRoute>} />
        <Route path="/my-jobs" element={<ProtectedRoute requiredRole="farmer"><MyJobs /></ProtectedRoute>} />

        {/* Worker */}
        <Route path="/worker" element={<ProtectedRoute requiredRole="worker"><WorkerDashboard /></ProtectedRoute>} />
        <Route path="/browse-jobs" element={<ProtectedRoute requiredRole="worker"><BrowseJobs /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute requiredRole="worker"><MyApplications /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/job/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
        <Route path="/chats" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/chats/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Ultra Feature Routes */}
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="/premium" element={<ProtectedRoute><PremiumPlans /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
