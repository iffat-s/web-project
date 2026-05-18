import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, register, clearError } from '../../store/slices/authSlice';
import { FormGroup } from '../../components/common';
import toast from 'react-hot-toast';

function getHomePath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'brand_manager') return '/brand';
  return '/customer';
}

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearError());
    const res = await dispatch(login(form));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Welcome back!');
      navigate(getHomePath(res.payload.user.role));
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Loyalty Platform</h1>
          <p>Customer Loyalty & Rewards Platform</p>
        </div>
        <form onSubmit={handleSubmit}>
          <FormGroup label="Email">
            <input className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} required />
          </FormGroup>
          <FormGroup label="Password">
            <input className="input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => set('password', e.target.value)} required />
          </FormGroup>
          {error && <p style={{ color: 'var(--error)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-primary w-full" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text2)', fontSize: 13 }}>
          No account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearError());
    const res = await dispatch(register(form));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Account created! Please log in.');
      navigate('/login');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Loyalty & Rewards Platform</h1>
          <p>Create your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <FormGroup label="Full Name">
            <input className="input" placeholder="Jane Doe"
              value={form.name} onChange={e => set('name', e.target.value)} required />
          </FormGroup>
          <FormGroup label="Email">
            <input className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} required />
          </FormGroup>
          <FormGroup label="Password">
            <input className="input" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
          </FormGroup>
          <FormGroup label="Role">
            <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="customer">Customer</option>
              <option value="brand_manager">Brand Manager</option>
              <option value="admin">Admin</option>
            </select>
          </FormGroup>
          {error && <p style={{ color: 'var(--error)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-primary w-full" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text2)', fontSize: 13 }}>
          Have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
