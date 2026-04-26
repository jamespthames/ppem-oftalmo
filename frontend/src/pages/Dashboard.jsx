import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { PlayIcon, BookIcon, BarChartIcon, FlameIcon, TrophyIcon } from '../components/Icons';

const TOPIC_COLORS = {
  'Catarata':               'oklch(65% 0.14 55)',
  'Córnea':                 'oklch(55% 0.15 185)',
  'Glaucoma':               'oklch(52% 0.15 290)',
  'Oculoplástica':          'oklch(57% 0.18 20)',
  'Pediatría y Estrabismo': 'oklch(52% 0.15 150)',
  'Retina':                 'oklch(50% 0.16 258)',
  'Uveítis':                'oklch(58% 0.15 65)',
  'Óptica y Optometría':    'oklch(50% 0.12 220)',
};

function RingProgress({ value, size = 92 }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, value / 100)) * c;
  const color = value >= 70 ? 'var(--correct)' : value >= 50 ? 'var(--amber)' : 'var(--wrong)';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, color, lineHeight: 1 }}>{value}%</span>
      </div>
    </div>
  );
}

function QuickAction({ to, icon, title, desc }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-xs)',
        padding: '20px',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s, transform 0.12s',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div style={{ color: 'var(--indigo)', display: 'flex' }}>{icon}</div>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{title}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.4 }}>{desc}</div>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/progress/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <div className="content-wrap page-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 3 }}>{greeting}</p>
        <h1 className="page-title">Dr. {firstName}</h1>
        <p className="page-subtitle">Sistema de práctica · Oftalmología UCR PPEM</p>
      </div>

      {loading ? <Spinner center /> : (
        <>
          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
            <div className="stat-card">
              <div className="stat-num">{stats?.total ?? 0}</div>
              <div className="stat-label">Preguntas respondidas</div>
            </div>
            <div className="stat-card">
              <div className="stat-num indigo">{stats?.accuracy ?? 0}%</div>
              <div className="stat-label">Precisión global</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{stats?.sessionsCount ?? 0}</div>
              <div className="stat-label">Sesiones de práctica</div>
            </div>
            <div className="stat-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <div>
                <div className="stat-num amber">{stats?.streak ?? 0}</div>
                <div className="stat-label">Racha de días</div>
              </div>
              {(stats?.streak ?? 0) > 0 && (
                <div style={{ color: 'var(--amber)', marginLeft: 'auto' }}>
                  <FlameIcon size={22} />
                </div>
              )}
            </div>
          </div>

          {/* Accuracy ring + context */}
          {(stats?.total ?? 0) > 0 && (
            <div className="card" style={{ padding: '24px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
              <RingProgress value={stats.accuracy} />
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, marginBottom: 5 }}>
                  Rendimiento global
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  {stats.correct} correctas de {stats.total} respondidas
                  {stats.streak > 0 && (
                    <span style={{ marginLeft: 14, color: 'var(--amber)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <FlameIcon size={13} /> {stats.streak} día{stats.streak !== 1 ? 's' : ''} de racha
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Topic breakdown */}
          {stats?.byTopic && Object.keys(stats.byTopic).length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 className="section-title" style={{ marginBottom: 16 }}>Rendimiento por tema</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(stats.byTopic)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([tema, s]) => {
                    const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
                    const color = TOPIC_COLORS[tema] || 'var(--indigo)';
                    return (
                      <div key={tema} style={{
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--r-md)', padding: '13px 18px',
                        boxShadow: 'var(--shadow-xs)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>{tema}</span>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color }}>{pct}%</span>
                            <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{s.correct}/{s.total}</span>
                          </div>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>Accesos rápidos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
              <QuickAction to="/practice" icon={<PlayIcon size={20} />}  title="Iniciar práctica" desc="Simulacro por temas con retroalimentación inmediata" />
              <QuickAction to="/library"  icon={<BookIcon size={20} />}  title="Explorar librería" desc="150 preguntas de exámenes pasados" />
              <QuickAction to="/progress" icon={<BarChartIcon size={20} />} title="Ver mi progreso" desc="Historial, estadísticas y marcadores" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
