'use client';

import '@user-management-system/styles/index.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, User } from '../lib/api';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await api.get('/sessions/profile');
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
      }
    } catch {
      setUser(null);
    } finally {
      setCheckingAuth(false);
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  async function handleLogout() {
    try {
      await api.delete('/sessions');
    } catch {
      // Ignore
    }
    setUser(null);
    router.push('/register');
  }

  if (checkingAuth) {
    return (
      <html lang="en" data-theme={theme}>
        <head>
          <title>User Portal</title>
        </head>
        <body>
          <div className="min-h-screen bg-base-100 text-base-content flex items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" data-theme={theme}>
      <head>
        <title>User Portal</title>
      </head>
      <body>
        <div className="min-h-screen bg-base-100 text-base-content">
          <nav className="navbar bg-base-200 shadow-md">
            <div className="flex-1">
              <a href="/" className="btn btn-ghost text-xl">
                Portal
              </a>
            </div>
            <div className="flex-none">
              {user && (
                <>
                  <a href="/admin" className="btn btn-ghost">
                    Admin
                  </a>
                  <button onClick={handleLogout} className="btn btn-ghost">
                    Logout
                  </button>
                </>
              )}
              <button onClick={toggleTheme} className="btn btn-ghost btn-circle">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </nav>
          <main className="container mx-auto p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
