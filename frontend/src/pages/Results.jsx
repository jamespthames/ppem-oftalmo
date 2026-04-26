import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckIcon, XIcon, ClockIcon, TrophyIcon, PlayIcon } from '../components/Icons';

function RingScore({ value, size = 120 }) {
  const r     = (size - 12) / 2;
  const c     = 2 * Math.PI * r;
  const dash  = Math.max(0, Math.min(1, value / 100)) * c;
  const color = value >= 70 ? 'var(--correct)' : value >= 50 ? 'var(--amber)' : 'var(--wrong)';
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto 8px' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color, lineHeight: 1 }}>{value}%</span>
        <span style={{ fontSize: 10.5, color: 'var(--text-4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>aciertos</span>
      </div>
    </div>
  );
}

export default function Results() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const results     = state?.results     || [];
  const durationSec = state?.durationSec || 0;

  if (!results.length) return (
    <div className="content-wrap" style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ color: 'var(--text-3)', marginBottom: 20 }}>No hay resultados disponibles.</p>
      <Link to="/practice" className="btn btn-primary">Ir a práctica</Link>
    </div>
  );

  const correct = results.filter(r => r.isCorrect).length;
  const pct     = Math.round((correct / results.length) * 100);
  const mins    = Math.floor(durationSec / 60);
  const secs    = durationSec % 60;
  const msg     = pct >= 80 ? 'Excelente trabajo' : pct >= 60 ? 'Buen desempeño' : 'Sigue practicando';

  return (
    <div className="content-wrap page-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Resultados</h1>
        <p className="page-subtitle">{msg}</p>
      </div>

      {/* Score card */}
      <div className="card" style={{ padding: '32px', marginBottom: 24, textAlign: 'center' }}>
        <RingScore value={pct} />

        <div style={{ display: 'flex', justifyContent: 'center', gap: 36, marginTop: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: 'var(--correct)', marginBottom: 3 }}>
              <CheckIcon size={16} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, lineHeight: 1 }}>{correct}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Correctas</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: 'var(--wrong)', marginBottom: 3 }}>
              <XIcon size={16} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, lineHeight: 1 }}>{results.length - correct}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Incorrectas</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: 'var(--text-2)', marginBottom: 3 }}>
              <ClockIcon size={16} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, lineHeight: 1 }}>{mins}:{String(secs).padStart(2, '0')}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Tiempo</div>
          </div>
        </div>
      </div>

      {/* Review */}
      <h2 className="section-title" style={{ marginBottom: 16 }}>Revisión de respuestas</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {results.map((r, i) => {
          const opciones = r.question?.opciones || {};
          const selText  = opciones[r.selected] || opciones[r.selected?.toLowerCase()] || '—';
          const corrKey  = r.respuestaCorrecta;
          const corrText = opciones[corrKey] || opciones[corrKey?.toLowerCase()] || '—';

          return (
            <div key={i} style={{
              background: 'var(--surface)',
              border: `1px solid ${r.isCorrect ? 'oklch(84% 0.06 145)' : 'oklch(86% 0.07 25)'}`,
              borderRadius: 'var(--r-lg)',
              padding: '16px 20px',
              boxShadow: 'var(--shadow-xs)',
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  background: r.isCorrect ? 'var(--correct-tint)' : 'var(--wrong-tint)',
                  border: `1px solid ${r.isCorrect ? 'oklch(84% 0.06 145)' : 'oklch(86% 0.07 25)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: r.isCorrect ? 'var(--correct)' : 'var(--wrong)',
                  marginTop: 1,
                }}>
                  {r.isCorrect ? <CheckIcon size={13} /> : <XIcon size={13} />}
                </div>
                <div style={{ flex: 1 }}>
                  <span className={`badge ${r.isCorrect ? 'badge-correct' : 'badge-wrong'}`} style={{ marginBottom: 7, display: 'inline-flex' }}>
                    {r.question?.tema}
                  </span>
                  <p style={{ fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.6, margin: 0 }}>
                    {r.question?.enunciado}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20, fontSize: 12.5, paddingLeft: 38, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-3)' }}>
                  Tu respuesta:{' '}
                  <span style={{ color: r.isCorrect ? 'var(--correct)' : 'var(--wrong)', fontWeight: 500 }}>
                    {r.selected?.toUpperCase()} — {selText}
                  </span>
                </span>
                {!r.isCorrect && (
                  <span style={{ color: 'var(--text-3)' }}>
                    Correcta:{' '}
                    <span style={{ color: 'var(--correct)', fontWeight: 500 }}>
                      {corrKey?.toUpperCase()} — {corrText}
                    </span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/practice')} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <PlayIcon size={14} /> Nueva práctica
        </button>
        <Link to="/" className="btn btn-secondary btn-lg">Ir al inicio</Link>
      </div>
    </div>
  );
}
