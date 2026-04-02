'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePathname, useRouter } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

  // Onboarding Guard
  useEffect(() => {
    if (mounted && isAuthenticated && user && !user.currentWorkspace) {
      if (pathname !== '/onboarding') {
        router.push('/onboarding');
      }
    }
  }, [mounted, isAuthenticated, user, pathname, router]);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
