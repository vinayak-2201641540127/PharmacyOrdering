import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/errors';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    };

    try {
      if (mode === 'register') {
        await register({
          ...payload,
          fullName: String(formData.get('fullName') ?? ''),
        });
      } else {
        await login(payload);
      }

      navigate('/products');
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Unable to complete the authentication request.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel auth-panel">
      <div className="hero-copy">
        <p className="eyebrow">Secure access</p>
        <h2>Patient checkout and pharmacist review in one flow</h2>
        <p>
          Use the same API-backed authentication service for customers and admins. Newly
          registered users are created as customers by default.
        </p>
      </div>

      <div className="auth-toggle">
        <button
          className={mode === 'login' ? 'toggle-button active' : 'toggle-button'}
          onClick={() => setMode('login')}
          type="button"
        >
          Login
        </button>
        <button
          className={mode === 'register' ? 'toggle-button active' : 'toggle-button'}
          onClick={() => setMode('register')}
          type="button"
        >
          Register
        </button>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        {mode === 'register' ? (
          <label>
            Full name
            <input name="fullName" placeholder="Aarav Kapoor" required type="text" />
          </label>
        ) : null}

        <label>
          Email
          <input name="email" placeholder="patient@hcl.com" required type="email" />
        </label>

        <label>
          Password
          <input name="password" placeholder="Minimum 8 characters" required type="password" />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
    </section>
  );
}
