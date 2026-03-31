'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setUser, setLoading]);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
