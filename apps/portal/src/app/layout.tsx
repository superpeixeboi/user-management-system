'use client';

import '@user-management-system/styles/index.css';
import { useState, useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

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
              <a href="/admin" className="btn btn-ghost">
                Admin
              </a>
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
