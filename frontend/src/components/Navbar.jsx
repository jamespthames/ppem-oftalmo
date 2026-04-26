import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, HomeIcon, BookIcon, PlayIcon, BarChartIcon, ShieldIcon, LogOutIcon, BookmarkIcon } from './Icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/',         icon: <HomeIcon size={16} />,      label: 'Inicio',    end: true },
    { to: '/library',              icon: <BookIcon size={16} />,      label: 'Librería' },
    { to: '/practice',             icon: <PlayIcon size={16} />,      label: 'Práctica' },
    { to: '/progress',             icon: <BarChartIcon size={16} />,  label: 'Progreso' },
    { to: '/progress?tab=bookmarks', icon: <BookmarkIcon size={16} filled />, label: 'Marcadores' },
  ];
  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', icon: <ShieldIcon size={16} />, label: 'Admin' });
  }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo-mark"><EyeIcon size={18} /></div>
          <div className="logo-text">
            <span className="logo-name">PPEM Oftalmo</span>
            <span className="logo-sub">UCR · Residencia</span>
          </div>
        </div>

        <div className="nav-section">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-row">
            <div className="user-avatar">{initials}</div>
            <div className="user-meta">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role === 'admin' ? 'Administrador' : 'Residente'}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
              <LogOutIcon size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom nav ── */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
}
