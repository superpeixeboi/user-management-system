'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

export default function Login() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
      // Not authenticated, stay on login page
    } finally {
      setCheckingAuth(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/sessions', { email, password });
      router.push('/');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Invalid credentials');
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
          <h1 className="text-3xl font-bold mb-6">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered"
                required
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
                  'Login'
                )}
              </button>
            </div>
          </form>
          <div className="mt-4">
            <p className="text-sm">
              Don't have an account?{' '}
              <a href="/register" className="link link-primary">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
