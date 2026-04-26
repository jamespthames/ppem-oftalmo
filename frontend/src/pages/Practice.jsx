import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { PlayIcon, CheckIcon } from '../components/Icons';

const FALLBACK_TOPICS = ['Catarata', 'Córnea', 'Glaucoma', 'Oculoplástica', 'Pediatría y Estrabismo', 'Retina', 'Uveítis', 'Óptica y Optometría'];
const COUNT_OPTIONS   = [5, 10, 15, 20, 30];

export default function Practice() {
  const [topics,          setTopics]          = useState([]);
  const [selectedTopics,  setSelectedTopics]  = useState([]);
  const [count,           setCount]           = useState(10);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/questions/topics').then(r => setTopics(r.data.topics)).catch(() => setTopics(FALLBACK_TOPICS));
  }, []);

  const toggle = (t) => setSelectedTopics(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t]);

  const start = async () => {
    if (!selectedTopics.length) { setError('Selecciona al menos un tema para continuar.'); return; }
    setError(''); setLoading(true);
    try {
      const r = await api.post('/api/sessions/start', { temas: selectedTopics, count });
      navigate('/practice/session', { state: { sessionId: r.data.sessionId, questions: r.data.questions } });
    } catch (e) {
      setError(e.response?.data?.error || 'Error al iniciar sesión de práctica');
      setLoading(false);
    }
  };

  return (
    <div className="content-wrap page-in">
      <div style={{ marginBottom: 30 }}>
        <h1 className="page-title">Modo Práctica</h1>
        <p className="page-subtitle">Selecciona los temas y la cantidad de preguntas para tu simulacro</p>
      </div>

      {/* Topic picker */}
      <div className="card" style={{ padding: '24px 26px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 className="section-title">Temas</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedTopics([...topics])}>Todos</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedTopics([])}>Ninguno</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {topics.map(t => (
            <button key={t} className={`topic-chip${selectedTopics.includes(t) ? ' selected' : ''}`} onClick={() => toggle(t)}>
              {selectedTopics.includes(t) && <CheckIcon size={12} />}
              {t}
            </button>
          ))}
        </div>

        {selectedTopics.length > 0 && (
          <p style={{ marginTop: 14, fontSize: 12.5, color: 'var(--text-3)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            {selectedTopics.length} tema{selectedTopics.length !== 1 ? 's' : ''} seleccionado{selectedTopics.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Count picker */}
      <div className="card" style={{ padding: '24px 26px', marginBottom: 24 }}>
        <h2 className="section-title" style={{ marginBottom: 18 }}>Cantidad de preguntas</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COUNT_OPTIONS.map(n => (
            <button
              key={n}
              className={`topic-chip${count === n ? ' selected' : ''}`}
              onClick={() => setCount(n)}
              style={{ minWidth: 58, justifyContent: 'center' }}
            >
              {count === n && <CheckIcon size={12} />}
              {n}
            </button>
          ))}
        </div>
        <p style={{ marginTop: 14, fontSize: 12.5, color: 'var(--text-3)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          Solo se incluyen preguntas de opción múltiple con respuesta registrada.
        </p>
      </div>

      {error && <div className="feedback-box feedback-wrong" style={{ marginBottom: 18 }}>{error}</div>}

      <button
        className="btn btn-primary btn-lg"
        onClick={start}
        disabled={loading || !selectedTopics.length}
        style={{ minWidth: 240 }}
      >
        {loading
          ? <><span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Preparando sesión...</>
          : <><PlayIcon size={15} /> Iniciar práctica · {count} pregunta{count !== 1 ? 's' : ''}</>
        }
      </button>
    </div>
  );
}
