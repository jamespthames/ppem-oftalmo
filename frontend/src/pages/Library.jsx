import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { BookmarkIcon, ChevronDownIcon, ChevronUpIcon, ImageIcon, CheckIcon, SearchIcon, FilterIcon } from '../components/Icons';

const TIPO_LABELS = {
  opcion_multiple: 'Opción múltiple',
  falso_verdadero: 'Falso / Verdadero',
  completar:       'Completar',
  asociacion:      'Asociación',
};

function QuestionCard({ question, bookmarks, onBookmarkToggle }) {
  const [expanded,      setExpanded]      = useState(false);
  const [answer,        setAnswer]        = useState(null);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [imgData,       setImgData]       = useState(null);
  const isBookmarked = bookmarks.has(question.id);

  const revealAnswer = async () => {
    if (answer) return;
    setLoadingAnswer(true);
    try {
      const r = await api.get(`/api/questions/${question.id}/answer`);
      setAnswer(r.data);
    } finally { setLoadingAnswer(false); }
  };

  const toggle = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && question.hasImage && !imgData) {
      const r = await api.get(`/api/questions/${question.id}/image`);
      setImgData(r.data.imagenBase64);
    }
  };

  const rawOpciones = question.opciones || {};
  const opciones = Object.fromEntries(
    Object.entries(rawOpciones).map(([k, v]) => [k.toLowerCase(), v])
  );
  const keys = Object.keys(opciones);

  return (
    <div className={`question-card${expanded ? ' expanded' : ''}`}>
      {/* Header row */}
      <div className="question-header" onClick={toggle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">{question.tema}</span>
            <span className="badge badge-neutral">{TIPO_LABELS[question.tipo] || question.tipo}</span>
            {question.hasImage && (
              <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ImageIcon size={10} /> Imagen
              </span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 'auto', white: 'nowrap' }}>
              {question.examen} · #{question.numero}
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.6, margin: 0 }}>
            {expanded ? question.enunciado : (question.enunciado.length > 170 ? question.enunciado.slice(0, 170) + '…' : question.enunciado)}
          </p>
        </div>
        <div style={{ color: 'var(--text-3)', flexShrink: 0, marginLeft: 12, marginTop: 2 }}>
          {expanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="question-body slide-up">
          {/* Clinical image */}
          {imgData && (
            <img
              src={imgData}
              alt="Imagen clínica"
              style={{
                width: '100%', maxWidth: 480, borderRadius: 8, marginBottom: 18,
                border: '1px solid var(--border)', display: 'block',
                imageOrientation: 'from-image',
              }}
            />
          )}

          {/* Options */}
          {keys.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
              {keys.map(k => {
                const isCorrect = answer && k === answer.respuestaCorrecta.toLowerCase();
                return (
                  <div key={k} style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    padding: '10px 13px',
                    borderRadius: 'var(--r-sm)',
                    background: isCorrect ? 'var(--correct-tint)' : 'var(--surface)',
                    border: `1px solid ${isCorrect ? 'oklch(84% 0.06 145)' : 'var(--border)'}`,
                    fontSize: 13.5, lineHeight: 1.5,
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600,
                      background: isCorrect ? 'var(--correct)' : 'var(--surface-2)',
                      border: `1px solid ${isCorrect ? 'var(--correct)' : 'var(--border-strong)'}`,
                      color: isCorrect ? 'white' : 'var(--text-3)',
                    }}>
                      {isCorrect ? <CheckIcon size={11} /> : k.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-1)' }}>{opciones[k]}</span>
                  </div>
                );
              })}
            </div>
          )}

          {(question.tipo === 'completar' || question.tipo === 'asociacion') && (
            <p style={{ fontSize: 12.5, color: 'var(--text-3)', fontStyle: 'italic', marginBottom: 14 }}>
              Pregunta abierta. Consulta el examen original para la respuesta.
            </p>
          )}

          {/* Answer reveal + bookmark */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {question.tipo === 'opcion_multiple' && (
              !answer ? (
                <button className="btn btn-secondary btn-sm" onClick={revealAnswer} disabled={loadingAnswer}>
                  {loadingAnswer ? <span className="spinner spinner-sm" /> : 'Ver respuesta correcta'}
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div className="feedback-box feedback-correct" style={{ fontSize: 13, padding: '8px 13px' }}>
                    Respuesta: <strong style={{ color: 'var(--correct)' }}>{answer.respuestaCorrecta.toUpperCase()}</strong>
                    {answer.nota && <span style={{ marginLeft: 8, color: 'oklch(42% 0.13 145)', fontWeight: 400 }}>· {answer.nota}</span>}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setAnswer(null)} style={{ fontSize: 12 }}>
                    Ocultar
                  </button>
                </div>
              )
            )}

            <button
              className={`btn btn-sm ${isBookmarked ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => onBookmarkToggle(question.id, isBookmarked)}
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <BookmarkIcon size={13} filled={isBookmarked} />
              {isBookmarked ? 'Marcado' : 'Marcar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Library() {
  const [questions, setQuestions] = useState([]);
  const [topics,    setTopics]    = useState([]);
  const [exams,     setExams]     = useState([]);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [bookmarks, setBookmarks] = useState(new Set());

  const [filters, setFilters] = useState({ tema: '', examen: '', tipo: '', search: '' });
  const [page,    setPage]    = useState(1);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, limit: 15 });
      if (filters.tema)   p.set('tema',   filters.tema);
      if (filters.examen) p.set('examen', filters.examen);
      if (filters.tipo)   p.set('tipo',   filters.tipo);
      if (filters.search) p.set('search', filters.search);
      const r = await api.get(`/api/questions?${p}`);
      setQuestions(r.data.questions);
      setTotal(r.data.total);
      setPages(r.data.pages);
    } finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  useEffect(() => {
    Promise.all([
      api.get('/api/questions/topics'),
      api.get('/api/questions/exams'),
      api.get('/api/progress/bookmarks'),
    ]).then(([t, e, b]) => {
      setTopics(t.data.topics);
      setExams(e.data.exams);
      setBookmarks(new Set(b.data.bookmarks.map(bm => bm.question.id)));
    });
  }, []);

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  const hasFilters = filters.tema || filters.examen || filters.tipo || filters.search;

  const handleBookmarkToggle = async (qid, isBm) => {
    try {
      if (isBm) {
        await api.delete(`/api/progress/bookmarks/${qid}`);
        setBookmarks(s => { const n = new Set(s); n.delete(qid); return n; });
      } else {
        await api.post('/api/progress/bookmarks', { questionId: qid });
        setBookmarks(s => new Set([...s, qid]));
      }
    } catch {}
  };

  return (
    <div className="content-wrap page-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Librería de Preguntas</h1>
        <p className="page-subtitle">{total} pregunta{total !== 1 ? 's' : ''} disponibles</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }}>
              <SearchIcon size={14} />
            </div>
            <input
              className="input"
              placeholder="Buscar enunciados..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
          <select className="input" value={filters.tema}   onChange={e => setFilter('tema', e.target.value)}>
            <option value="">Todos los temas</option>
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input" value={filters.examen} onChange={e => setFilter('examen', e.target.value)}>
            <option value="">Todos los exámenes</option>
            {exams.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select className="input" value={filters.tipo}   onChange={e => setFilter('tipo', e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="opcion_multiple">Opción múltiple</option>
            <option value="falso_verdadero">Falso / Verdadero</option>
            <option value="completar">Completar</option>
            <option value="asociacion">Asociación</option>
          </select>
        </div>
        {hasFilters && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{total} resultado{total !== 1 ? 's' : ''}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ tema: '', examen: '', tipo: '', search: '' }); setPage(1); }}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {loading ? <Spinner center /> : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--text-3)' }}>
                No se encontraron preguntas con los filtros aplicados.
              </div>
            ) : (
              questions.map(q => (
                <QuestionCard key={q.id} question={q} bookmarks={bookmarks} onBookmarkToggle={handleBookmarkToggle} />
              ))
            )}
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Anterior</button>
              <span style={{ fontSize: 13, color: 'var(--text-3)', padding: '0 4px' }}>Página {page} de {pages}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page === pages}>Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
