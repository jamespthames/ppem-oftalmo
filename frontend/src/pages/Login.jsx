import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Wordmark */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'var(--indigo-tint)',
              border: '1.5px solid oklch(86% 0.06 258)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 600, lineHeight: 1.2, color: 'var(--text-1)' }}>
                PPEM Oftalmología
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>Universidad de Costa Rica</div>
            </div>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.15 }}>
            Bienvenido de vuelta
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            Inicia sesión para continuar estudiando.
          </p>
        </div>

        {error && (
          <div className="feedback-box feedback-wrong" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label">Correo electrónico</label>
            <input
              className="input"
              type="email"
              placeholder="residente@ucr.ac.cr"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="field-label">Contraseña</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <span className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> : 'Iniciar sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-3)' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: 'var(--indigo)', textDecoration: 'none', fontWeight: 500 }}>
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}
