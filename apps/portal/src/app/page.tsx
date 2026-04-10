'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await api.get('/sessions/profile');
      if (res.data.success && res.data.data) {
        router.push('/admin');
        return;
      }
    } catch {
      router.push('/register');
    } finally {
      setLoading(false);
    }
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

  return null;
}
