import { useEffect, useState } from 'react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { PlusIcon, EditIcon, TrashIcon, UploadIcon, CheckIcon, ShieldIcon } from '../components/Icons';

const TYPE_BADGE = { feature: 'badge-indigo', fix: 'badge-wrong', content: 'badge-correct', improvement: 'badge-amber' };
const TYPE_LABELS_CL = { feature: 'Nueva función', fix: 'Corrección', content: 'Contenido', improvement: 'Mejora' };

const TEMAS = ['Catarata', 'Córnea', 'Glaucoma', 'Oculoplástica', 'Pediatría y Estrabismo', 'Retina', 'Uveítis', 'Óptica y Optometría'];
const TIPOS = ['opcion_multiple', 'falso_verdadero', 'completar', 'asociacion'];
const EMPTY = { examen: '', tema: TEMAS[0], numero: '', tipo: 'opcion_multiple', enunciado: '', opciones: { A: '', B: '', C: '', D: '' }, respuestaCorrecta: 'A', nota: '', explicacion: '' };

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
          <div className="card table-scroll" style={{ marginBottom: 28 }}>
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
          <div className="card table-scroll">
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

      <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
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

      <div style={{ marginBottom: 14 }}>
        <label className="field-label">Nota (opcional)</label>
        <input className="input" value={form.nota} onChange={e => upd('nota', e.target.value)} placeholder="Aclaración o comentario adicional" />
      </div>

      <div style={{ marginBottom: 22 }}>
        <label className="field-label">Explicación (opcional)</label>
        <textarea className="input" value={form.explicacion || ''} onChange={e => upd('explicacion', e.target.value)} placeholder="Explicación detallada de la respuesta correcta" rows={3} />
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
          <form onSubmit={handleAdd} className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
            <div className="form-full-row" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={adding}>
                {adding ? <span className="spinner spinner-sm" /> : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card table-scroll">
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
function QuestionsTab({ pendingEdit, clearPendingEdit }) {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(null);

  useEffect(() => {
    if (pendingEdit) { setEditing(pendingEdit); clearPendingEdit && clearPendingEdit(); }
  }, [pendingEdit]);
  const [creating,  setCreating]  = useState(false);
  const [page,      setPage]      = useState(1);
  const [pages,     setPages]     = useState(1);
  const [filterTema, setFilterTema] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = async () => {
    setLoading(true);
    const p = new URLSearchParams({ page, limit: 20 });
    if (filterTema) p.set('tema', filterTema);
    if (search) p.set('search', search);
    const r = await api.get(`/api/admin/questions?${p}`);
    setQuestions(r.data.questions);
    setPages(r.data.pages);
    setLoading(false);
  };
  useEffect(() => { load(); }, [page, filterTema, search]);
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

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
        <input
          className="input"
          style={{ maxWidth: 320, flex: 1 }}
          type="text"
          placeholder="Buscar por enunciado…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
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
          <div className="card table-scroll" style={{ marginBottom: 14 }}>
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

/* ── Changelog tab ── */
function ChangelogTab() {
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState({ title: '', description: '', type: 'feature' });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const load = () => {
    setLoading(true);
    api.get('/api/changelog').then(r => setEntries(r.data.entries || r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/api/changelog', form);
      setForm({ title: '', description: '', type: 'feature' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta entrada?')) return;
    await api.delete(`/api/changelog/${id}`);
    load();
  };

  return (
    <div>
      <div className="card" style={{ padding: '20px 22px', marginBottom: 24 }}>
        <h3 className="section-title" style={{ marginBottom: 16 }}>Nueva entrada</h3>
        {error && <div className="feedback-box feedback-wrong" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
            <div>
              <label className="form-label">Título</label>
              <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">Tipo</label>
              <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {Object.entries(TYPE_LABELS_CL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Descripción</label>
            <textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? <span className="spinner spinner-sm" /> : <><PlusIcon size={13} /> Publicar</>}
            </button>
          </div>
        </form>
      </div>

      {loading ? <Spinner center /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map(e => (
            <div key={e.id} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                <span className={`badge ${TYPE_BADGE[e.type] || 'badge-neutral'}`}>{TYPE_LABELS_CL[e.type] || e.type}</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', flex: 1 }}>{e.title}</span>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <TrashIcon size={12} />
                </button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 6px', lineHeight: 1.6 }}>{e.description}</p>
              <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
                {new Date(e.createdAt).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Reports tab ── */
function CommentsTab({ onEditQuestion }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await api.get('/api/admin/comments');
    setComments(r.data.comments);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;
    await api.delete(`/api/admin/comments/${id}`);
    load();
  };

  const handleEditFull = async (questionId) => {
    const r = await api.get(`/api/admin/questions/${questionId}`);
    onEditQuestion(r.data.question);
  };

  if (loading) return <Spinner center />;
  if (!comments.length) return <p style={{ color: 'var(--text-3)', fontSize: 14 }}>No hay comentarios todavía.</p>;

  // Group by question
  const grouped = comments.reduce((acc, c) => {
    const k = c.question.id;
    if (!acc[k]) acc[k] = { question: c.question, comments: [] };
    acc[k].comments.push(c);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
        {comments.length} comentario(s) en {Object.keys(grouped).length} pregunta(s). Edita la pregunta para corregirla.
      </p>
      {Object.values(grouped).map(({ question, comments: cs }) => (
        <div key={question.id} className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-indigo">{question.tema}</span>
                <span className="badge badge-neutral">{question.examen} · #{question.numero}</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{question.enunciado}</p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleEditFull(question.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}
            >
              <EditIcon size={12} /> Editar pregunta
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border-1)' }}>
            {cs.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginBottom: 3 }}>
                    <strong style={{ color: 'var(--text-2)' }}>{c.user.name}</strong> · {new Date(c.createdAt).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.45 }}>{c.text}</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c.id)} style={{ color: 'var(--wrong)' }}>
                  <TrashIcon size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/api/admin/reports').then(r => setReports(r.data.reports || r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleResolve = async (id) => {
    await api.patch(`/api/admin/reports/${id}/resolve`);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este reporte?')) return;
    await api.delete(`/api/admin/reports/${id}`);
    load();
  };

  if (loading) return <Spinner center />;

  if (!reports.length) return (
    <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)' }}>No hay reportes pendientes</p>
  );

  return (
    <div className="card table-scroll">
      <table className="data-table">
        <thead>
          <tr><th>Pregunta</th><th>Tema</th><th>Reportado por</th><th>Motivo</th><th>Fecha</th><th></th></tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id}>
              <td style={{ fontSize: 12.5, maxWidth: 200, color: 'var(--text-2)' }}>
                {(r.question?.enunciado || '').slice(0, 60)}{(r.question?.enunciado || '').length > 60 ? '…' : ''}
              </td>
              <td><span className="badge badge-neutral">{r.question?.tema}</span></td>
              <td style={{ fontSize: 12.5 }}>{r.user?.name || '—'}</td>
              <td style={{ fontSize: 12.5, color: 'var(--text-2)', maxWidth: 160 }}>{r.reason}</td>
              <td style={{ fontSize: 11, color: 'var(--text-4)', whiteSpace: 'nowrap' }}>
                {new Date(r.createdAt).toLocaleDateString('es-CR')}
              </td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleResolve(r.id)}>Resolver</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)} style={{ display: 'flex', alignItems: 'center' }}>
                    <TrashIcon size={12} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('stats');
  const [pendingEdit, setPendingEdit] = useState(null);

  const handleEditFromComment = (q) => {
    const normalized = { ...q, opciones: typeof q.opciones === 'string' ? JSON.parse(q.opciones) : q.opciones };
    setPendingEdit(normalized);
    setTab('questions');
  };

  return (
    <div className="content-wrap page-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Administración</h1>
        <p className="page-subtitle">Gestión de preguntas y estadísticas globales del programa</p>
      </div>

      <div className="tab-row" style={{ marginBottom: 28 }}>
        {[['stats','Estadísticas'], ['questions','Preguntas'], ['comments','Comentarios'], ['users','Usuarios'], ['reports','Reportes'], ['changelog','Changelog'], ['import','Importar JSON']].map(([k, v]) => (
          <button key={k} className={`tab-pill${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{v}</button>
        ))}
      </div>

      {tab === 'stats'      && <StatsTab />}
      {tab === 'questions'  && <QuestionsTab pendingEdit={pendingEdit} clearPendingEdit={() => setPendingEdit(null)} />}
      {tab === 'comments'   && <CommentsTab onEditQuestion={handleEditFromComment} />}
      {tab === 'users'      && <UsersTab />}
      {tab === 'reports'    && <ReportsTab />}
      {tab === 'changelog'  && <ChangelogTab />}
      {tab === 'import'     && <ImportTab />}
    </div>
  );
}
