import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { CheckIcon, XIcon, ArrowRightIcon, ArrowLeftIcon } from '../components/Icons';

export default function PracticeSession() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const startTime  = useRef(Date.now());

  const [idx,        setIdx]        = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [feedback,   setFeedback]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [results,    setResults]    = useState([]);

  const timed        = state?.timed;
  const timeLimitSec = state?.timeLimitSec;
  const [timeLeft, setTimeLeft] = useState(timeLimitSec || 0);
  const timerRef = useRef(null);

  const questions = state?.questions || [];
  const sessionId = state?.sessionId;
  const question  = questions[idx];

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleTimeUp = () => {
    const durationSec = Math.round((Date.now() - startTime.current) / 1000);
    api.post(`/api/sessions/${sessionId}/complete`, { durationSec }).catch(() => {});
    navigate('/practice/results', { state: { results, durationSec } });
  };

  useEffect(() => {
    if (!sessionId) navigate('/practice', { replace: true });
  }, []);

  useEffect(() => {
    if (!timed || !timeLimitSec) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timed]);

  if (!question) return null;

  const opciones = question.opciones || {};
  const keys     = Object.keys(opciones);

  const handleSelect = (k) => { if (!feedback) setSelected(k); };

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const r = await api.post(`/api/sessions/${sessionId}/answer`, { questionId: question.id, answerGiven: selected });
      setFeedback(r.data);
      setResults(prev => [...prev, { question, selected, ...r.data }]);
    } finally { setSubmitting(false); }
  };

  const handleNext = async () => {
    if (idx < questions.length - 1) {
      setIdx(i => i + 1); setSelected(null); setFeedback(null);
    } else {
      const durationSec = Math.round((Date.now() - startTime.current) / 1000);
      await api.post(`/api/sessions/${sessionId}/complete`, { durationSec });
      navigate('/practice/results', { state: { results, durationSec } });
    }
  };

  const progress = ((idx + (feedback ? 1 : 0)) / questions.length) * 100;
  const correctSoFar = results.filter(r => r.isCorrect).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { if (window.confirm('¿Salir de la práctica? Se perderá el progreso de esta sesión.')) navigate('/practice'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)', flexShrink: 0 }}
          >
            <ArrowLeftIcon size={14} />
            Salir
          </button>

          <div style={{ flex: 1 }}>
            <div className="progress-track">
              <div className="progress-fill gradient" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
            {timed && (
              <div style={{
                fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 14,
                color: timeLeft < 60 ? 'var(--wrong)' : timeLeft < 120 ? 'var(--amber)' : 'var(--text-1)',
                padding: '4px 12px', borderRadius: 'var(--r-sm)',
                background: timeLeft < 60 ? 'var(--wrong-tint)' : 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}>
                {formatTime(timeLeft)}
              </div>
            )}
            {results.length > 0 && (
              <span style={{ fontSize: 12, color: 'var(--correct)', fontWeight: 500 }}>
                {correctSoFar}/{results.length}
              </span>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
              {idx + 1}<span style={{ color: 'var(--text-4)' }}>/{questions.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '36px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 660 }}>
          {/* Meta */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
            <span className="badge badge-indigo">{question.tema}</span>
            <span style={{ fontSize: 12, color: 'var(--text-4)' }}>Pregunta {idx + 1} de {questions.length}</span>
          </div>

          {/* Clinical image */}
          {question.imagenBase64 && (
            <img
              src={question.imagenBase64}
              alt="Imagen clínica"
              style={{ width: '100%', maxWidth: 500, borderRadius: 10, marginBottom: 24, border: '1px solid var(--border)', display: 'block', boxShadow: 'var(--shadow-sm)' }}
            />
          )}

          {/* Question */}
          <div className="card page-in" style={{ padding: '22px 26px', marginBottom: 20 }}>
            <p style={{ fontSize: 15.5, lineHeight: 1.72, color: 'var(--text-1)', margin: 0 }}>
              {question.enunciado}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
            {keys.map(k => {
              let cls = 'answer-option';
              if (feedback) {
                if (k.toUpperCase() === feedback.respuestaCorrecta.toUpperCase()) cls += ' correct';
                else if (k === selected) cls += ' wrong';
              } else if (k === selected) {
                cls += ' selected';
              }
              return (
                <button key={k} className={cls} onClick={() => handleSelect(k)} disabled={!!feedback}>
                  <span className="option-letter">{k.toUpperCase()}</span>
                  <span>{opciones[k]}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="slide-up" style={{ marginBottom: 20 }}>
              <div className={`feedback-box ${feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong'}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  {feedback.isCorrect ? <CheckIcon size={16} /> : <XIcon size={16} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: feedback.nota ? 4 : 0 }}>
                    {feedback.isCorrect ? 'Respuesta correcta' : `Incorrecto — la respuesta era ${feedback.respuestaCorrecta.toUpperCase()}`}
                  </div>
                  {feedback.nota && <div style={{ fontSize: 12.5, marginTop: 3, opacity: 0.8 }}>{feedback.nota}</div>}
                </div>
              </div>
              {feedback?.explicacion && (
                <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, background: 'oklch(96% 0.02 258)', border: '1px solid oklch(88% 0.04 258)', fontSize: 13 }}>
                  <strong style={{ color: 'var(--indigo)', fontSize: 11, display: 'block', marginBottom: 3 }}>Explicación</strong>
                  {feedback.explicacion}
                </div>
              )}
            </div>
          )}

          {/* Action */}
          {!feedback ? (
            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={handleSubmit}
              disabled={!selected || submitting}
            >
              {submitting ? <span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> : 'Confirmar respuesta'}
            </button>
          ) : (
            <button className="btn btn-primary btn-lg btn-full" onClick={handleNext} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {idx < questions.length - 1 ? <><span>Siguiente pregunta</span><ArrowRightIcon size={15} /></> : <><span>Ver resultados</span><ArrowRightIcon size={15} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
