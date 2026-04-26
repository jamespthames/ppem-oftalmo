import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon } from '../components/Icons';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'var(--indigo-tint)',
              border: '1.5px solid oklch(86% 0.06 258)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <EyeIcon size={20} style={{ color: 'var(--indigo)' }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.2 }}>
                PPEM Oftalmología
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>Universidad de Costa Rica</div>
            </div>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.15 }}>
            Crear cuenta
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            Acceso exclusivo para residentes PPEM.
          </p>
        </div>

        {error && <div className="feedback-box feedback-wrong" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label">Nombre completo</label>
            <input className="input" type="text" placeholder="Dr. Nombre Apellido" value={form.name} onChange={upd('name')} required />
          </div>
          <div>
            <label className="field-label">Correo electrónico</label>
            <input className="input" type="email" placeholder="residente@ucr.ac.cr" value={form.email} onChange={upd('email')} required />
          </div>
          <div>
            <label className="field-label">Contraseña</label>
            <input className="input" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={upd('password')} required minLength={6} />
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> : 'Crear cuenta'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-3)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--indigo)', textDecoration: 'none', fontWeight: 500 }}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
