'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Client Management', href: '/dashboard/clients', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/login');
  };

  return (
    <motion.div 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 h-screen fixed left-0 top-0 glass border-r z-50 flex flex-col items-start p-6"
    >
      <div className="flex flex-col mb-10 w-full">
        <div className="text-2xl font-bold text-primary tracking-tight">Flowlance</div>
        {user?.userType === 'agency' && user?.agencyName && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 mt-1 pl-1 truncate"
          >
            {user.agencyName}
          </motion.div>
        )}
      </div>
      
      <nav className="w-full flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all
                ${isActive ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <button 
        onClick={handleLogout}
        className="flex items-center space-x-3 w-full p-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-auto"
      >
        <LogOut size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </motion.div>
  );
}
