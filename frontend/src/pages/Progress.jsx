import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { BookmarkIcon, ChevronDownIcon, ChevronUpIcon, FlameIcon, PlayIcon, BookIcon, CheckIcon, XIcon, ClockIcon } from '../components/Icons';

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

function BookmarkCard({ bookmark, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const q       = bookmark.question;
  const opciones = q.opciones || {};

  return (
    <div className="question-card">
      <div className="question-header" onClick={() => setExpanded(e => !e)}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 7 }}>
            <span className="badge badge-indigo">{q.tema}</span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.6, margin: 0 }}>
            {expanded ? q.enunciado : (q.enunciado.length > 150 ? q.enunciado.slice(0, 150) + '…' : q.enunciado)}
          </p>
        </div>
        <div style={{ color: 'var(--text-3)', flexShrink: 0, marginLeft: 12, marginTop: 2 }}>
          {expanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </div>
      </div>

      {expanded && (
        <div className="question-body slide-up">
          {Object.entries(opciones).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
              {Object.entries(opciones).map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex', gap: 9, alignItems: 'flex-start',
                  padding: '9px 12px', borderRadius: 'var(--r-sm)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  fontSize: 13.5, lineHeight: 1.5,
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600,
                    background: 'var(--surface-2)', border: '1px solid var(--border-strong)',
                    color: 'var(--text-3)',
                  }}>{k.toUpperCase()}</span>
                  <span style={{ color: 'var(--text-1)' }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onRemove(q.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <BookmarkIcon size={13} filled /> Quitar marcador
          </button>
        </div>
      )}
    </div>
  );
}

function CurveTab() {
  const [data,          setData]          = useState([]);
  const [selectedTema,  setSelectedTema]  = useState('');
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    api.get('/api/progress/curve').then(r => {
      setData(r.data.curve);
      const temas = [...new Set(r.data.curve.map(d => d.tema))];
      if (temas.length) setSelectedTema(temas[0]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner center />;

  const temas    = [...new Set(data.map(d => d.tema))].sort();
  const filtered = data.filter(d => d.tema === selectedTema).sort((a, b) => a.week.localeCompare(b.week));

  if (!filtered.length) return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
      Aún no hay datos suficientes. Completa sesiones de práctica para ver tu evolución.
    </div>
  );

  const maxVal = 100;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {temas.map(t => (
          <button key={t} className={`tab-pill${selectedTema === t ? ' active' : ''}`} onClick={() => setSelectedTema(t)} style={{ fontSize: 12 }}>{t}</button>
        ))}
      </div>

      <div className="card" style={{ padding: '24px 20px' }}>
        <h3 className="section-title" style={{ marginBottom: 20 }}>{selectedTema} — % de aciertos por semana</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, overflowX: 'auto', paddingBottom: 8 }}>
          {filtered.map(d => (
            <div key={d.week} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 48 }}>
              <span style={{ fontSize: 10, color: d.rate >= 70 ? 'var(--correct)' : d.rate >= 50 ? 'var(--amber)' : 'var(--wrong)', fontWeight: 600 }}>{d.rate}%</span>
              <div style={{
                width: 36, borderRadius: '4px 4px 0 0',
                height: `${Math.max(4, (d.rate / maxVal) * 140)}px`,
                background: d.rate >= 70 ? 'var(--correct)' : d.rate >= 50 ? 'oklch(75% 0.14 70)' : 'var(--wrong)',
                opacity: 0.85,
                transition: 'height 0.3s',
              }} />
              <span style={{ fontSize: 9, color: 'var(--text-4)', textAlign: 'center', lineHeight: 1.2 }}>{d.week.split('-W')[1] ? `Sem ${d.week.split('-W')[1]}` : d.week}</span>
              <span style={{ fontSize: 9, color: 'var(--text-4)' }}>{d.total} resp</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Progress() {
  const location = useLocation();
  const initialTab = new URLSearchParams(location.search).get('tab') || 'stats';
  const [tab,              setTab]              = useState(initialTab);
  const [stats,            setStats]            = useState(null);
  const [sessions,         setSessions]         = useState([]);
  const [bookmarks,        setBookmarks]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [startingPractice, setStartingPractice] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/api/progress/stats'),
      api.get('/api/sessions'),
      api.get('/api/progress/bookmarks'),
    ]).then(([s, ses, b]) => {
      setStats(s.data);
      setSessions(ses.data.sessions);
      setBookmarks(b.data.bookmarks);
    }).finally(() => setLoading(false));
  }, []);

  const removeBookmark = async (qid) => {
    await api.delete(`/api/progress/bookmarks/${qid}`);
    setBookmarks(b => b.filter(bm => bm.question.id !== qid));
  };

  const practiceBookmarks = async () => {
    setStartingPractice(true);
    try {
      const questionIds = bookmarks
        .filter(bm => bm.question.tipo === 'opcion_multiple')
        .map(bm => bm.question.id);
      if (!questionIds.length) return;
      const r = await api.post('/api/sessions/start', { questionIds });
      navigate('/practice/session', { state: { sessionId: r.data.sessionId, questions: r.data.questions } });
    } catch (e) {
      console.error(e);
    } finally {
      setStartingPractice(false);
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtDur  = (s) => s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${s % 60}s`;

  return (
    <div className="content-wrap page-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Mi Progreso</h1>
        <p className="page-subtitle">Estadísticas, historial de sesiones y preguntas marcadas</p>
      </div>

      <div className="tab-row" style={{ marginBottom: 24 }}>
        {[
          ['stats',     'Estadísticas'],
          ['history',   'Historial'],
          ['bookmarks', `Marcadores (${bookmarks.length})`],
          ['curve',     'Curva de aprendizaje'],
        ].map(([k, v]) => (
          <button key={k} className={`tab-pill${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{v}</button>
        ))}
      </div>

      {loading ? <Spinner center /> : (
        <>
          {/* Stats */}
          {tab === 'stats' && stats && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
                <div className="stat-card">
                  <div className="stat-num">{stats.total ?? 0}</div>
                  <div className="stat-label">Respondidas</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num indigo">{stats.accuracy ?? 0}%</div>
                  <div className="stat-label">Precisión</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{stats.sessionsCount ?? 0}</div>
                  <div className="stat-label">Sesiones</div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <div>
                    <div className="stat-num amber">{stats.streak ?? 0}</div>
                    <div className="stat-label">Racha de días</div>
                  </div>
                  {(stats.streak ?? 0) > 0 && <FlameIcon size={20} style={{ color: 'var(--amber)', marginLeft: 'auto' }} />}
                </div>
              </div>

              {stats.byTopic && Object.keys(stats.byTopic).length > 0 ? (
                <>
                  <h2 className="section-title" style={{ marginBottom: 16 }}>Por tema</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(stats.byTopic)
                      .sort((a, b) => b[1].total - a[1].total)
                      .map(([tema, s]) => {
                        const pct   = s.total ? Math.round((s.correct / s.total) * 100) : 0;
                        const color = TOPIC_COLORS[tema] || 'var(--indigo)';
                        return (
                          <div key={tema} style={{
                            background: 'var(--surface)', border: '1px solid var(--border)',
                            borderRadius: 'var(--r-md)', padding: '14px 18px', boxShadow: 'var(--shadow-xs)',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>{tema}</span>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color }}>{pct}%</span>
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
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '56px 0' }}>
                  <p style={{ color: 'var(--text-3)', marginBottom: 18 }}>Aún no has respondido ninguna pregunta.</p>
                  <Link to="/practice" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <PlayIcon size={14} /> Iniciar práctica
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* History */}
          {tab === 'history' && (
            sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 0' }}>
                <p style={{ color: 'var(--text-3)', marginBottom: 18 }}>No hay sesiones registradas.</p>
                <Link to="/practice" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <PlayIcon size={14} /> Iniciar práctica
                </Link>
              </div>
            ) : (
              <div className="card" style={{ overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Temas</th>
                      <th>Preguntas</th>
                      <th>Aciertos</th>
                      <th>Precisión</th>
                      <th>Tiempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => {
                      const temas = JSON.parse(s.temas || '[]');
                      const pct   = s.totalQs ? Math.round((s.correctQs / s.totalQs) * 100) : 0;
                      return (
                        <tr key={s.id}>
                          <td style={{ color: 'var(--text-3)', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(s.createdAt)}</td>
                          <td style={{ fontSize: 12.5 }}>{temas.slice(0, 2).join(', ')}{temas.length > 2 ? ` +${temas.length - 2}` : ''}</td>
                          <td style={{ fontVariantNumeric: 'tabular-nums' }}>{s.totalQs}</td>
                          <td style={{ color: 'var(--correct)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{s.correctQs}</td>
                          <td>
                            <span className={`badge ${pct >= 70 ? 'badge-correct' : pct >= 50 ? 'badge-amber' : 'badge-wrong'}`}>
                              {pct}%
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-3)', fontSize: 12.5 }}>{fmtDur(s.durationSec)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Curve */}
          {tab === 'curve' && <CurveTab />}

          {/* Bookmarks */}
          {tab === 'bookmarks' && (
            bookmarks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 0' }}>
                <p style={{ color: 'var(--text-3)', marginBottom: 6 }}>No tienes preguntas marcadas.</p>
                <p style={{ color: 'var(--text-4)', fontSize: 13, marginBottom: 20 }}>Marca preguntas desde la librería para repasarlas aquí.</p>
                <Link to="/library" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <BookIcon size={14} /> Ir a la librería
                </Link>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
                  <button
                    className="btn btn-primary"
                    onClick={practiceBookmarks}
                    disabled={startingPractice}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
                  >
                    {startingPractice
                      ? <><span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Preparando...</>
                      : <><PlayIcon size={14} /> Practicar marcadores</>
                    }
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {bookmarks.map(bm => (
                    <BookmarkCard key={bm.id} bookmark={bm} onRemove={removeBookmark} />
                  ))}
                </div>
              </>
            )
          )}
        </>
      )}
    </div>
  );
}
