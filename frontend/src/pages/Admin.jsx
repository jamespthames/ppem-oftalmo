import { useEffect, useState } from 'react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { PlusIcon, EditIcon, TrashIcon, UploadIcon, CheckIcon, ShieldIcon } from '../components/Icons';

const TEMAS = ['Catarata', 'Córnea', 'Glaucoma', 'Oculoplástica', 'Pediatría y Estrabismo', 'Retina', 'Uveítis', 'Óptica y Optometría'];
const TIPOS = ['opcion_multiple', 'falso_verdadero', 'completar', 'asociacion'];
const EMPTY = { examen: '', tema: TEMAS[0], numero: '', tipo: 'opcion_multiple', enunciado: '', opciones: { A: '', B: '', C: '', D: '' }, respuestaCorrecta: 'A', nota: '' };

/* ── Stats tab ── */
function StatsTab() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/api/admin/stats').then(r => setData(r.data)).catch(() => {}); }, []);
  if (!data) return <Spinner center />;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-num">{data.totalQ}</div><div className="stat-label">Preguntas</div></div>
        <div className="stat-card"><div className="stat-num indigo">{data.totalUsers}</div><div className="stat-label">Usuarios</div></div>
      </div>

      {data.weakTopics?.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginBottom: 14 }}>Temas más débiles (colectivo)</h3>
          <div className="card" style={{ overflow: 'hidden', marginBottom: 28 }}>
            <table className="data-table">
              <thead><tr><th>Tema</th><th>Respondidas</th><th>Incorrectas</th><th>Tasa de error</th></tr></thead>
              <tbody>
                {data.weakTopics.map(t => (
                  <tr key={t.tema}>
                    <td style={{ fontWeight: 500 }}>{t.tema}</td>
                    <td>{t.total}</td>
                    <td style={{ color: 'var(--wrong)' }}>{t.wrong}</td>
                    <td><span className={`badge ${t.errorRate >= 50 ? 'badge-wrong' : t.errorRate >= 30 ? 'badge-amber' : 'badge-correct'}`}>{t.errorRate}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {data.hardestQuestions?.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginBottom: 14 }}>Preguntas más difíciles</h3>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead><tr><th>Enunciado</th><th>Tema</th><th>Intentos</th><th>Error</th></tr></thead>
              <tbody>
                {data.hardestQuestions.map(q => (
                  <tr key={q.id}>
                    <td style={{ fontSize: 12.5, maxWidth: 280 }}>{q.enunciado}</td>
                    <td><span className="badge badge-neutral">{q.tema}</span></td>
                    <td>{q.total}</td>
                    <td><span className={`badge ${q.errorRate >= 60 ? 'badge-wrong' : 'badge-amber'}`}>{q.errorRate}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!data.weakTopics?.length && (
        <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '48px 0' }}>
          Aún no hay datos de respuestas para analizar.
        </p>
      )}
    </div>
  );
}

/* ── Question form ── */
function QuestionForm({ initial, onSave, onCancel }) {
  const [form,    setForm]    = useState(initial || EMPTY);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const upd    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updOpt = (k, v) => setForm(f => ({ ...f, opciones: { ...f.opciones, [k]: v } }));

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await onSave(form); }
    catch (err) { setError(err.response?.data?.error || 'Error al guardar'); setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="feedback-box feedback-wrong" style={{ marginBottom: 16 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label className="field-label">Examen</label>
          <input className="input" value={form.examen} onChange={e => upd('examen', e.target.value)} placeholder="ej. I Semestral 2019" required />
        </div>
        <div>
          <label className="field-label">Número</label>
          <input className="input" type="number" value={form.numero} onChange={e => upd('numero', e.target.value)} required min={1} />
        </div>
        <div>
          <label className="field-label">Tema</label>
          <select className="input" value={form.tema} onChange={e => upd('tema', e.target.value)}>
            {TEMAS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Tipo</label>
          <select className="input" value={form.tipo} onChange={e => upd('tipo', e.target.value)}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label className="field-label">Enunciado</label>
        <textarea className="input" value={form.enunciado} onChange={e => upd('enunciado', e.target.value)} required rows={4} />
      </div>

      {form.tipo === 'opcion_multiple' && (
        <>
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Opciones</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['A', 'B', 'C', 'D'].map(k => (
                <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    background: 'var(--indigo-tint)', border: '1px solid oklch(86% 0.06 258)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600, color: 'var(--indigo)',
                  }}>{k}</span>
                  <input className="input" value={form.opciones[k] || ''} onChange={e => updOpt(k, e.target.value)} placeholder={`Opción ${k}`} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Respuesta correcta</label>
            <select className="input" style={{ maxWidth: 100 }} value={form.respuestaCorrecta} onChange={e => upd('respuestaCorrecta', e.target.value)}>
              {['A', 'B', 'C', 'D'].map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </>
      )}

      <div style={{ marginBottom: 22 }}>
        <label className="field-label">Nota (opcional)</label>
        <input className="input" value={form.nota} onChange={e => upd('nota', e.target.value)} placeholder="Aclaración o comentario adicional" />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> : (initial ? 'Guardar cambios' : 'Crear pregunta')}
        </button>
        {onCancel && <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  );
}

/* ── Users tab ── */
function UsersTab() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState({ name: '', email: '', password: '', role: 'student' });
  const [adding,   setAdding]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error,    setError]    = useState('');

  const load = () => {
    setLoading(true);
    api.get('/api/admin/users').then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault(); setError(''); setAdding(true);
    try {
      await api.post('/api/admin/users', form);
      setForm({ name: '', email: '', password: '', role: 'student' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear usuario');
    } finally { setAdding(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return;
    await api.delete(`/api/admin/users/${id}`);
    load();
  };

  const handleRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    if (!confirm(`¿Cambiar rol de este usuario a "${newRole}"?`)) return;
    await api.patch(`/api/admin/users/${id}/role`, { role: newRole });
    load();
  };

  if (loading) return <Spinner center />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ color: 'var(--text-2)', fontSize: 13.5, margin: 0 }}>{users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}</p>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(f => !f)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PlusIcon size={13} /> Nuevo usuario
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
          <h3 className="section-title" style={{ marginBottom: 14 }}>Agregar usuario</h3>
          {error && <div className="feedback-box feedback-wrong" style={{ marginBottom: 12 }}>{error}</div>}
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Nombre</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">Correo electrónico</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
            </div>
            <div>
              <label className="form-label">Rol</label>
              <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="student">Residente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={adding}>
                {adding ? <span className="spinner spinner-sm" /> : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Registrado</th><th></th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td style={{ color: 'var(--text-2)', fontSize: 12 }}>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge-indigo' : 'badge-neutral'}`}>{u.role === 'admin' ? 'Admin' : 'Residente'}</span>
                </td>
                <td style={{ color: 'var(--text-4)', fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString('es-CR')}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleRole(u.id, u.role)} title="Cambiar rol" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShieldIcon size={13} /> Rol
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.name)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <TrashIcon size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Import tab ── */
function ImportTab() {
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');

  const doImport = async () => {
    setError(''); setLoading(true);
    try {
      const questions = JSON.parse(text);
      const r = await api.post('/api/admin/import', { questions });
      setResult(r.data.imported); setText('');
    } catch (err) {
      setError(err.response?.data?.error || 'JSON inválido o error al importar');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <p style={{ color: 'var(--text-2)', fontSize: 13.5, marginBottom: 18, lineHeight: 1.6 }}>
        Pega el contenido de un archivo <code style={{ background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4, fontSize: 12, border: '1px solid var(--border)' }}>questions_db.json</code> (array de preguntas en el formato estándar del sistema).
      </p>

      {error  && <div className="feedback-box feedback-wrong"   style={{ marginBottom: 14 }}>{error}</div>}
      {result !== null && (
        <div className="feedback-box feedback-correct" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckIcon size={15} />
          {result} pregunta{result !== 1 ? 's' : ''} importada{result !== 1 ? 's' : ''} correctamente.
        </div>
      )}

      <textarea
        className="input"
        rows={12}
        value={text}
        onChange={e => { setText(e.target.value); setResult(null); }}
        placeholder='[{ "examen": "...", "tema": "...", "numero": 1, ... }]'
        style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5 }}
      />

      <button
        className="btn btn-primary"
        style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7 }}
        onClick={doImport}
        disabled={!text.trim() || loading}
      >
        {loading
          ? <><span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> Importando...</>
          : <><UploadIcon size={14} /> Importar preguntas</>
        }
      </button>
    </div>
  );
}

/* ── Questions tab ── */
function QuestionsTab() {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(null);
  const [creating,  setCreating]  = useState(false);
  const [page,      setPage]      = useState(1);
  const [pages,     setPages]     = useState(1);
  const [filterTema, setFilterTema] = useState('');

  const load = async () => {
    setLoading(true);
    const p = new URLSearchParams({ page, limit: 20 });
    if (filterTema) p.set('tema', filterTema);
    const r = await api.get(`/api/admin/questions?${p}`);
    setQuestions(r.data.questions);
    setPages(r.data.pages);
    setLoading(false);
  };
  useEffect(() => { load(); }, [page, filterTema]);

  const handleSave = async (form) => {
    if (editing) { await api.put(`/api/admin/questions/${editing.id}`, form); setEditing(null); }
    else { await api.post('/api/admin/questions', form); setCreating(false); }
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta pregunta? Esta acción no se puede deshacer.')) return;
    await api.delete(`/api/admin/questions/${id}`);
    load();
  };

  if (creating) return (
    <div>
      <h3 className="section-title" style={{ marginBottom: 24 }}>Nueva pregunta</h3>
      <QuestionForm onSave={handleSave} onCancel={() => setCreating(false)} />
    </div>
  );

  if (editing) return (
    <div>
      <h3 className="section-title" style={{ marginBottom: 24 }}>Editar pregunta</h3>
      <QuestionForm
        initial={editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <select className="input" style={{ maxWidth: 210 }} value={filterTema} onChange={e => { setFilterTema(e.target.value); setPage(1); }}>
          <option value="">Todos los temas</option>
          {TEMAS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <PlusIcon size={13} /> Nueva pregunta
        </button>
      </div>

      {loading ? <Spinner center /> : (
        <>
          <div className="card" style={{ overflow: 'hidden', marginBottom: 14 }}>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Examen</th><th>Tema</th><th>Enunciado</th><th>Tipo</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {questions.map(q => (
                  <tr key={q.id}>
                    <td style={{ color: 'var(--text-4)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{q.numero}</td>
                    <td style={{ fontSize: 11.5, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{q.examen}</td>
                    <td><span className="badge badge-indigo">{q.tema}</span></td>
                    <td style={{ fontSize: 12.5, maxWidth: 260, color: 'var(--text-2)' }}>
                      {q.enunciado.slice(0, 65)}{q.enunciado.length > 65 ? '…' : ''}
                    </td>
                    <td><span className="badge badge-neutral">{q.tipo}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditing({ ...q, opciones: typeof q.opciones === 'string' ? JSON.parse(q.opciones) : q.opciones })}
                          style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <EditIcon size={12} /> Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(q.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <TrashIcon size={12} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p-1)} disabled={page===1}>Anterior</button>
              <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Pág. {page} / {pages}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p+1)} disabled={page===pages}>Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('stats');

  return (
    <div className="content-wrap page-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Administración</h1>
        <p className="page-subtitle">Gestión de preguntas y estadísticas globales del programa</p>
      </div>

      <div className="tab-row" style={{ marginBottom: 28 }}>
        {[['stats', 'Estadísticas'], ['questions', 'Preguntas'], ['users', 'Usuarios'], ['import', 'Importar JSON']].map(([k, v]) => (
          <button key={k} className={`tab-pill${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{v}</button>
        ))}
      </div>

      {tab === 'stats'     && <StatsTab />}
      {tab === 'questions' && <QuestionsTab />}
      {tab === 'users'     && <UsersTab />}
      {tab === 'import'    && <ImportTab />}
    </div>
  );
}
