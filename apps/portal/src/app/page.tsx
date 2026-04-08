'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, User } from '../lib/api';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await api.get('/sessions/profile');
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
      }
    } catch {
      router.push('/register');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await api.delete('/sessions');
    } catch {
      // Ignore
    }
    setUser(null);
    router.push('/register');
  }

  if (!mounted || loading) {
    return (
      <div className="hero min-h-[60vh]">
        <div className="hero-content text-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="hero min-h-[60vh]">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold">Hello, {user.firstName}!</h1>
          <div className="mt-6 text-left space-y-2">
            <p>
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-semibold">Role:</span> {user.role}
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-primary mt-6">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
