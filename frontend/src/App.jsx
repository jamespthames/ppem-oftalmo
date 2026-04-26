import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Practice from './pages/Practice';
import PracticeSession from './pages/PracticeSession';
import Results from './pages/Results';
import Progress from './pages/Progress';
import Admin from './pages/Admin';

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner spinner-lg" />
    </div>
  );
}

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function WithNav({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Public><Login /></Public>} />
        <Route path="/register" element={<Public><Register /></Public>} />
        <Route path="/" element={<Private><WithNav><Dashboard /></WithNav></Private>} />
        <Route path="/library" element={<Private><WithNav><Library /></WithNav></Private>} />
        <Route path="/practice" element={<Private><WithNav><Practice /></WithNav></Private>} />
        <Route path="/practice/session" element={<Private><PracticeSession /></Private>} />
        <Route path="/practice/results" element={<Private><WithNav><Results /></WithNav></Private>} />
        <Route path="/progress" element={<Private><WithNav><Progress /></WithNav></Private>} />
        <Route path="/admin" element={<AdminOnly><WithNav><Admin /></WithNav></AdminOnly>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
