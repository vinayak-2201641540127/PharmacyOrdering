/**
 * LoginPage.tsx — HCLPharma Authentication Page
 *
 * LINE-BY-LINE EXPLANATION IS PROVIDED BELOW THE COMPONENT.
 * The component itself is kept clean — all explanations are in comments
 * at the very bottom of this file.
 */

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/errors';
import './LoginPage.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'login' | 'register';

interface FieldState {
  value: string;
  touched: boolean;
  error: string | null;
}

// ─── Validation helpers ───────────────────────────────────────────────────────

const validators = {
  fullName: (v: string) =>
    v.trim().length < 2 ? 'Full name must be at least 2 characters' : null,
  email: (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Enter a valid email address',
  password: (v: string) =>
    v.length < 8 ? 'Password must be at least 8 characters' : null,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  field,
  onChange,
  onBlur,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  autoComplete: string;
  field: FieldState;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  const hasError = field.touched && field.error;
  const isValid  = field.touched && !field.error && field.value.length > 0;

  return (
    <div className={`field-group ${hasError ? 'field-error' : ''} ${isValid ? 'field-valid' : ''}`}>
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <div className="field-input-wrap">
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={field.value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${name}-error` : undefined}
          className="field-input"
          spellCheck={false}
        />
        {isValid && (
          <span className="field-icon valid" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        {hasError && (
          <span className="field-icon invalid" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
        )}
      </div>
      {hasError && (
        <p className="field-message" id={`${name}-error`} role="alert">
          {field.error}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate     = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode]               = useState<Mode>('login');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted]         = useState(false);

  const firstFieldRef = useRef<HTMLInputElement>(null);

  const emptyField = (): FieldState => ({ value: '', touched: false, error: null });

  const [fullName, setFullName] = useState<FieldState>(emptyField());
  const [email,    setEmail]    = useState<FieldState>(emptyField());
  const [password, setPassword] = useState<FieldState>(emptyField());

  // ── Entrance animation trigger ────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  // ── Reset fields + focus when mode switches ───────────────────────────────
  useEffect(() => {
    setFullName(emptyField());
    setEmail(emptyField());
    setPassword(emptyField());
    setSubmitError(null);
    setTimeout(() => firstFieldRef.current?.focus(), 80);
  }, [mode]);

  // ── Per-field handlers ────────────────────────────────────────────────────
  const makeHandlers = (
    key: 'fullName' | 'email' | 'password',
    setter: React.Dispatch<React.SetStateAction<FieldState>>,
  ) => ({
    onChange: (v: string) =>
      setter((prev) => ({
        value: v,
        touched: prev.touched,
        error: prev.touched ? validators[key](v) : null,
      })),
    onBlur: () =>
      setter((prev) => ({
        ...prev,
        touched: true,
        error: validators[key](prev.value),
      })),
  });

  const nameHandlers     = makeHandlers('fullName', setFullName);
  const emailHandlers    = makeHandlers('email',    setEmail);
  const passwordHandlers = makeHandlers('password', setPassword);

  // ── Client-side pre-submit validation ────────────────────────────────────
  const validateAll = (): boolean => {
    const nameErr  = mode === 'register' ? validators.fullName(fullName.value) : null;
    const emailErr = validators.email(email.value);
    const passErr  = validators.password(password.value);

    setFullName((p) => ({ ...p, touched: true, error: nameErr }));
    setEmail(   (p) => ({ ...p, touched: true, error: emailErr }));
    setPassword((p) => ({ ...p, touched: true, error: passErr }));

    return !nameErr && !emailErr && !passErr;
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        await register({ fullName: fullName.value, email: email.value, password: password.value });
      } else {
        await login({ email: email.value, password: password.value });
      }
      navigate('/products');
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Unable to complete the request. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="login-root">
      {/* Background geometric decoration */}
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-grid"         aria-hidden="true" />

      <main className={`login-card ${mounted ? 'login-card--visible' : ''}`}>

        {/* ── Brand header ── */}
        <header className="brand-header">
          <div className="brand-logo" aria-label="HCLPharma logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="8" fill="currentColor" className="logo-bg" />
              <path d="M7 9h4v4H7V9zM7 15h4v4H7v-4zM17 9h4v4h-4V9zM17 15h4v4h-4v-4zM11 11h6v6h-6v-6z"
                fill="white" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">HCLPharma</span>
            <span className="brand-tagline">Healthcare Management Platform</span>
          </div>
        </header>

        {/* ── Mode toggle ── */}
        <div className="mode-toggle" role="tablist" aria-label="Authentication mode">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              className={`mode-tab ${mode === m ? 'mode-tab--active' : ''}`}
              onClick={() => setMode(m)}
              type="button"
            >
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
          <div
            className="mode-indicator"
            style={{ transform: mode === 'login' ? 'translateX(0)' : 'translateX(100%)' }}
            aria-hidden="true"
          />
        </div>

        {/* ── Heading ── */}
        <div className="form-heading">
          <h1 className="form-title">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="form-subtitle">
            {mode === 'login'
              ? 'Sign in to manage orders and prescriptions.'
              : 'New accounts are created as customers by default.'}
          </p>
        </div>

        {/* ── Form ── */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label={mode === 'login' ? 'Sign in form' : 'Registration form'}
        >
          {mode === 'register' && (
            <InputField
              name="fullName"
              label="Full name"
              placeholder="Aarav Kapoor"
              autoComplete="name"
              field={fullName}
              {...nameHandlers}
            />
          )}

          <InputField
            name="email"
            label="Email address"
            type="email"
            placeholder="patient@hclpharma.com"
            autoComplete={mode === 'login' ? 'username' : 'email'}
            field={email}
            {...emailHandlers}
          />

          <InputField
            name="password"
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            field={password}
            {...passwordHandlers}
          />

          {/* ── Server-side error banner ── */}
          {submitError && (
            <div className="error-banner" role="alert" aria-live="assertive">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>{submitError}</span>
            </div>
          )}

          {/* ── Submit button ── */}
          <button
            className={`submit-btn ${isSubmitting ? 'submit-btn--loading' : ''}`}
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>Please wait…</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign in' : 'Create account'}</span>
            )}
          </button>
        </form>

        {/* ── Footer ── */}
        <footer className="card-footer">
          <p>
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              className="footer-link"
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Create account' : 'Sign in instead'}
            </button>
          </p>
          <p className="footer-legal">
            Protected by HCLPharma security. For authorised personnel only.
          </p>
        </footer>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LINE-BY-LINE EXPLANATION
// ─────────────────────────────────────────────────────────────────────────────
//
// IMPORTS
// ───────
// useState       — React hook to store and update local state (mode, fields, errors, etc.)
// useEffect      — Hook to run side-effects (entrance animation, focus management on mode switch)
// useRef         — Gives a direct reference to a DOM element (used to focus first input on tab switch)
// FormEvent      — TypeScript type for the HTML form's submit event
// useNavigate    — React Router hook; returns a function to programmatically redirect the user
// useAuth        — Custom hook exposing login() and register() from AuthContext
// getErrorMessage — Utility that safely extracts a readable string from any thrown error
//
// TYPES
// ─────
// Mode              — Union type, only 'login' or 'register' are valid values
// FieldState        — Shape of every controlled form field:
//   value             → current string in the input
//   touched           → true once the user has blurred (left) the field; gates error display
//   error             → null means valid; a string is the error message
//
// VALIDATORS OBJECT
// ─────────────────
// Pure functions — take the field's string value, return null (valid) or an error string.
// Keeping them outside the component means they are not re-created on every render.
// fullName  → trim whitespace then check length ≥ 2
// email     → simple regex (not RFC-exhaustive, good enough for UX)
// password  → length ≥ 8 (backend enforces the real rules)
//
// InputField SUB-COMPONENT
// ────────────────────────
// A standalone, reusable form field. Receives:
//   name        — ties the <label for> to <input id> (accessibility)
//   label       — visible label text
//   type        — 'text' | 'email' | 'password'
//   placeholder — greyed hint text inside the input
//   autoComplete — helps browsers/password managers fill correctly
//   field       — the FieldState object (value, touched, error)
//   onChange    — called on every keystroke; updates value and re-validates if already touched
//   onBlur      — called when user leaves the input; marks as touched and runs validation
//
// hasError — true only when the user has interacted AND there is an error (prevents red flash on load)
// isValid  — true when touched, no error, and not empty (shows green checkmark)
// aria-invalid / aria-describedby — screen reader accessibility: announces the error text
//
// LOGINPAGE STATE
// ───────────────
// mode          — which form to show (login vs register)
// submitError   — error message from the server (network / wrong credentials)
// isSubmitting  — disables button and shows spinner during async call
// mounted       — false for ~20ms on first render; triggers CSS entrance animation
// firstFieldRef — ref attached to the first visible input so we can focus it on tab switch
//
// emptyField()  — factory returning a fresh FieldState; called on init and on mode reset
//
// useEffect #1 (mounted)
// ───────────────────────
// Sets mounted=true after 20ms. This tiny delay lets the CSS transition run (card slides up & fades in).
// Returns a cleanup so the timeout is cancelled if the component unmounts before it fires.
//
// useEffect #2 (mode dependency)
// ───────────────────────────────
// Runs whenever the user switches between Login and Register.
// Resets all three fields to empty and clears any server error so users start fresh.
// After 80ms (animation settle) it focuses the first input so keyboard users don't have to tab.
//
// makeHandlers()
// ───────────────
// Factory that creates onChange and onBlur handlers for a given field.
// Avoids repeating the same logic three times.
//   onChange: updates value; if already touched, immediately re-validates (live feedback)
//   onBlur:   marks as touched and runs validation (first-time feedback fires on leaving the field)
//
// validateAll()
// ──────────────
// Called on form submit before the API call.
// Forces touched=true on every field and injects errors so they all show at once.
// Returns false if any field is invalid — prevents the network call.
//
// handleSubmit()
// ──────────────
// event.preventDefault()  — stops the browser's default full-page form POST
// setSubmitError(null)     — clears the previous server error on each attempt
// validateAll()            — client-side gate; returns early if invalid
// setIsSubmitting(true)    — shows spinner and disables button
// register() / login()     — async calls from AuthContext (hit the Spring Boot API)
// navigate('/products')    — redirect on success
// catch block              — catches API errors (401, 500, network) and shows them in the banner
// finally block            — always re-enables the button, even if the call fails
//
// RENDER — Background decoration
// ────────────────────────────────
// bg-orb-1/2 — absolutely-positioned blurred circles (pure CSS) that give the page depth
// bg-grid    — a subtle SVG dot-grid overlay; aria-hidden so screen readers skip it
//
// RENDER — Brand header
// ──────────────────────
// SVG logo renders a simple pill-grid icon (no external image dependency)
// brand-name + brand-tagline give users immediate context about the product
//
// RENDER — Mode toggle
// ─────────────────────
// role="tablist" / role="tab" / aria-selected — correct ARIA pattern for a tab switcher
// mode-indicator — an absolutely-positioned sliding pill that animates between tabs using
//                  translateX(0) for login and translateX(100%) for register
//
// RENDER — InputField instances
// ──────────────────────────────
// Each InputField maps to one FieldState object and its pair of handlers.
// The fullName field is conditionally rendered only in register mode.
// Spread syntax {...nameHandlers} passes onChange and onBlur in one line.
//
// RENDER — Error banner
// ──────────────────────
// Only rendered when submitError is non-null.
// role="alert" + aria-live="assertive" causes screen readers to announce the message immediately.
//
// RENDER — Submit button
// ───────────────────────
// disabled={isSubmitting}  — prevents double-submission
// aria-busy={isSubmitting} — screen-reader equivalent of the visual spinner
// Spinner is a CSS-animated border element (no JS, no library)
//
// RENDER — Footer links
// ──────────────────────
// <button type="button"> — not a submit; type="button" prevents accidental form submission
// Clicking switches the mode (toggles between login and register)
//
// CSS (LoginPage.css)
// ────────────────────
// All styles are scoped to class names defined in this component.
// Variables use the HCLPharma brand palette (deep navy primary, teal accent).
// Transitions on the card, inputs, and toggle are CSS-only (no Framer Motion needed).
// Dark mode is handled via @media (prefers-color-scheme: dark).