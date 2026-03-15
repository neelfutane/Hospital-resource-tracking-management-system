import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'nurse' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0f1a' }}>
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: 40, width: '100%', maxWidth: 400 }}>
        <h2 style={{ color: '#f9fafb', marginBottom: 8, fontSize: 22, fontWeight: 800 }}>🏥 Create Account</h2>
        <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 28 }}>Hospital Resource Tracker</p>

        {error && (
          <div style={{ background: '#4c0a0a', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {['name', 'email', 'password'].map((field) => (
            <div key={field} style={{ marginBottom: 16 }}>
              <label style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                {field}
              </label>
              <input
                name={field}
                type={field === 'password' ? 'password' : 'text'}
                value={form[field]}
                onChange={handleChange}
                required
                style={{
                  width: '100%', background: '#0a0f1a', border: '1px solid #374151',
                  borderRadius: 8, color: '#e5e7eb', padding: '10px 14px',
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          ))}

          <div style={{ marginBottom: 24 }}>
            <label style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{
                width: '100%', background: '#0a0f1a', border: '1px solid #374151',
                borderRadius: 8, color: '#e5e7eb', padding: '10px 14px',
                fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            >
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#166534' : '#16a34a',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '12px', fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;