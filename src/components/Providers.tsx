'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePathname, useRouter } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
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
          
          // Navigation Guard: Redirect to onboarding if no workspace
          const isPublicPath = ['/', '/login', '/register', '/onboarding'].includes(pathname);
          if (data.user && !data.user.currentWorkspace && !isPublicPath) {
            router.push('/onboarding');
          }
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
  }, [setUser, setLoading, pathname, router]);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
