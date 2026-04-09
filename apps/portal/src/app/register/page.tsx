'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

export default function Register() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await api.get('/sessions/profile');
      if (res.data.success) {
        router.push('/');
        return;
      }
    } catch {
      // Not authenticated, stay on register page
    } finally {
      setCheckingAuth(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setShowPasswordHint(true);
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/users', {
        firstName,
        lastName,
        email,
        password,
      });

      const loginRes = await api.post('/sessions', { email, password });
      if (loginRes.data.success) {
        router.push('/');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Registration failed');
      } else {
        setError('Something went wrong');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted || checkingAuth) {
    return (
      <div className="hero min-h-[60vh]">
        <div className="hero-content text-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="hero min-h-[60vh]">
      <div className="hero-content text-center">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input input-bordered"
                required
                data-testid="firstName"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input input-bordered"
                required
                data-testid="lastName"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered"
                required
                data-testid="email"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setShowPasswordHint(e.target.value.length > 0 && e.target.value.length < 8);
                }}
                className="input input-bordered"
                required
                data-testid="password"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input input-bordered"
                required
                data-testid="confirmPassword"
              />
            </div>
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}
            <div className="mt-6">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>
          <div className="mt-4">
            <p className="text-sm">
              Already have an account?{' '}
              <a href="/login" className="link link-primary">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
      {showPasswordHint && (
        <div className="toast toast-top toast-end">
          <div className="alert alert-info">
            <span>Password must be at least 8 characters</span>
          </div>
        </div>
      )}
    </div>
  );
}
