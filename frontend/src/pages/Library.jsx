import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { BookmarkIcon, ChevronDownIcon, ChevronUpIcon, ImageIcon, CheckIcon, SearchIcon, XIcon } from '../components/Icons';

const TIPO_LABELS = {
  opcion_multiple: 'Opción múltiple',
  falso_verdadero: 'Falso / Verdadero',
  completar:       'Completar',
  asociacion:      'Asociación',
};

const TIPOS = Object.entries(TIPO_LABELS);

/* ── Multi-select dropdown ── */
function MultiSelect({ label, options, selected, onChange, renderLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  };

  const count = selected.length;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, padding: '9px 12px', borderRadius: 'var(--r-sm)',
          border: `1px solid ${count > 0 ? 'var(--indigo)' : 'var(--border)'}`,
          background: count > 0 ? 'var(--indigo-tint)' : 'var(--surface)',
          color: count > 0 ? 'var(--indigo)' : 'var(--text-2)',
          fontSize: 13, fontWeight: count > 0 ? 500 : 400, cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {count === 0 ? label : count === 1 ? (renderLabel ? renderLabel(selected[0]) : selected[0]) : `${label} (${count})`}
        </span>
        <ChevronDownIcon size={13} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          marginTop: 4, background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
          boxShadow: '0 8px 24px oklch(0% 0 0 / 0.12)',
          maxHeight: 280, overflowY: 'auto',
        }}>
          {options.map(opt => {
            const val = typeof opt === 'string' ? opt : opt[0];
            const lbl = typeof opt === 'string' ? (renderLabel ? renderLabel(opt) : opt) : opt[1];
            const active = selected.includes(val);
            return (
              <button
                key={val}
                type="button"
                onClick={() => toggle(val)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', background: active ? 'var(--indigo-tint)' : 'transparent',
                  border: 'none', borderBottom: '1px solid var(--border-light)',
                  color: active ? 'var(--indigo)' : 'var(--text-1)',
                  fontSize: 13, textAlign: 'left', cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `1.5px solid ${active ? 'var(--indigo)' : 'var(--border-strong)'}`,
                  background: active ? 'var(--indigo)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {active && <CheckIcon size={10} style={{ color: 'white' }} />}
                </span>
                {lbl}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Question card ── */
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
            <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
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

      {expanded && (
        <div className="question-body slide-up">
          {imgData && (
            <img src={imgData} alt="Imagen clínica" style={{
              width: '100%', maxWidth: 480, borderRadius: 8, marginBottom: 18,
              border: '1px solid var(--border)', display: 'block', imageOrientation: 'from-image',
            }} />
          )}

          {keys.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
              {keys.map(k => {
                const isCorrect = answer && k === answer.respuestaCorrecta.toLowerCase();
                return (
                  <div key={k} style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    padding: '10px 13px', borderRadius: 'var(--r-sm)',
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
                  <button className="btn btn-ghost btn-sm" onClick={() => setAnswer(null)} style={{ fontSize: 12 }}>Ocultar</button>
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

/* ── Active filter chip ── */
function Chip({ label, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px 3px 10px', borderRadius: 20,
      background: 'var(--indigo-tint)', border: '1px solid oklch(86% 0.06 258)',
      color: 'var(--indigo)', fontSize: 12, fontWeight: 500,
    }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit', opacity: 0.7 }}>
        <XIcon size={11} />
      </button>
    </span>
  );
}

/* ── Main page ── */
export default function Library() {
  const [questions, setQuestions] = useState([]);
  const [topics,    setTopics]    = useState([]);
  const [exams,     setExams]     = useState([]);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [bookmarks, setBookmarks] = useState(new Set());

  const [search,    setSearch]    = useState('');
  const [temas,     setTemas]     = useState([]);
  const [examenes,  setExamenes]  = useState([]);
  const [tipos,     setTipos]     = useState([]);
  const [soloImagen, setSoloImagen] = useState(false);
  const [page,      setPage]      = useState(1);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, limit: 15 });
      if (search)        p.set('search',   search);
      if (temas.length)  p.set('tema',     temas.join(','));
      if (examenes.length) p.set('examen', examenes.join(','));
      if (tipos.length)  p.set('tipo',     tipos.join(','));
      if (soloImagen)    p.set('hasImage', 'true');
      const r = await api.get(`/api/questions?${p}`);
      setQuestions(r.data.questions);
      setTotal(r.data.total);
      setPages(r.data.pages);
    } finally { setLoading(false); }
  }, [search, temas, examenes, tipos, soloImagen, page]);

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

  const resetPage = () => setPage(1);
  const clearAll = () => { setSearch(''); setTemas([]); setExamenes([]); setTipos([]); setSoloImagen(false); setPage(1); };

  const hasFilters = search || temas.length || examenes.length || tipos.length || soloImagen;

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

      {/* Filter panel */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }}>
              <SearchIcon size={14} />
            </div>
            <input
              className="input"
              placeholder="Buscar enunciados..."
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage(); }}
              style={{ paddingLeft: 32 }}
            />
          </div>

          <MultiSelect
            label="Temas"
            options={topics}
            selected={temas}
            onChange={v => { setTemas(v); resetPage(); }}
          />

          <MultiSelect
            label="Exámenes"
            options={exams}
            selected={examenes}
            onChange={v => { setExamenes(v); resetPage(); }}
          />

          <MultiSelect
            label="Tipo"
            options={TIPOS}
            selected={tipos}
            onChange={v => { setTipos(v); resetPage(); }}
            renderLabel={v => TIPO_LABELS[v] || v}
          />

          {/* Solo con imagen toggle */}
          <button
            type="button"
            onClick={() => { setSoloImagen(s => !s); resetPage(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', borderRadius: 'var(--r-sm)',
              border: `1px solid ${soloImagen ? 'var(--indigo)' : 'var(--border)'}`,
              background: soloImagen ? 'var(--indigo-tint)' : 'var(--surface)',
              color: soloImagen ? 'var(--indigo)' : 'var(--text-2)',
              fontSize: 13, fontWeight: soloImagen ? 500 : 400, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <ImageIcon size={14} />
            Solo con imagen
          </button>
        </div>

        {/* Active chips + clear */}
        {hasFilters && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)', marginRight: 4 }}>{total} resultado{total !== 1 ? 's' : ''}</span>
            {temas.map(t => <Chip key={t} label={t} onRemove={() => { setTemas(s => s.filter(x => x !== t)); resetPage(); }} />)}
            {examenes.map(e => <Chip key={e} label={e} onRemove={() => { setExamenes(s => s.filter(x => x !== e)); resetPage(); }} />)}
            {tipos.map(t => <Chip key={t} label={TIPO_LABELS[t] || t} onRemove={() => { setTipos(s => s.filter(x => x !== t)); resetPage(); }} />)}
            {soloImagen && <Chip label="Con imagen" onRemove={() => { setSoloImagen(false); resetPage(); }} />}
            {search && <Chip label={`"${search}"`} onRemove={() => { setSearch(''); resetPage(); }} />}
            <button className="btn btn-ghost btn-sm" onClick={clearAll} style={{ fontSize: 12 }}>Limpiar todo</button>
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
