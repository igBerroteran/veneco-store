'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, LogOut, ShieldAlert, Menu, X, Sun, Moon } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface UserSession {
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const [session, setSession] = useState<UserSession | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const pathname = usePathname();
  const router = useRouter();

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setSession(data.user);
      }
    } catch (e) {
      console.error('Error fetching session:', e);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchSession();
      // Leer tema de localStorage
      const savedTheme = localStorage.getItem('veneco_theme') || 'dark';
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    };
    initialize();
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('veneco_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setSession(null);
        router.push('/');
        router.refresh();
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const isLinkActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-900 bg-white/95 dark:bg-black/90 backdrop-blur-md text-black dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="VENECO Logo" 
                className="h-10 w-auto object-contain dark:invert transition-all" 
              />
              <span className="font-mono text-xs tracking-[0.25em] text-neutral-550 dark:text-neutral-450 hidden sm:block">
                CO
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-widest uppercase">
            <Link 
              href="/" 
              className={`transition-colors duration-250 hover:text-black dark:hover:text-white ${isLinkActive('/') ? 'text-black dark:text-white font-bold' : 'text-neutral-555 dark:text-neutral-400'}`}
            >
              Colección
            </Link>
            <Link 
              href="/catalog?category=camisas" 
              className={`transition-colors duration-250 hover:text-black dark:hover:text-white ${pathname.includes('category=camisas') ? 'text-black dark:text-white font-bold' : 'text-neutral-555 dark:text-neutral-400'}`}
            >
              Camisas
            </Link>
            <Link 
              href="/catalog?category=gorras" 
              className={`transition-colors duration-250 hover:text-black dark:hover:text-white ${pathname.includes('category=gorras') ? 'text-black dark:text-white font-bold' : 'text-neutral-555 dark:text-neutral-400'}`}
            >
              Gorras
            </Link>
          </nav>

          {/* User & Cart Actions */}
          <div className="flex items-center gap-3">
            
            {/* Admin link if role is admin */}
            {session && session.role === 'admin' && (
              <Link 
                href="/admin/dashboard" 
                className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 dark:border-neutral-880 rounded bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs tracking-wider uppercase text-neutral-700 dark:text-neutral-300 transition-all font-mono"
                title="Panel de Administración"
              >
                <ShieldAlert size={14} className="text-red-500 animate-pulse" />
                Admin
              </Link>
            )}

            {/* Dashboard / Auth Link */}
            {session ? (
              <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
                <Link 
                  href="/dashboard" 
                  className={`hover:text-black dark:hover:text-white ${isLinkActive('/dashboard') ? 'text-black dark:text-white font-bold' : 'text-neutral-555 dark:text-neutral-400'}`}
                >
                  Mi Cuenta
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-neutral-555 dark:text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="hidden sm:block text-xs font-mono tracking-widest uppercase text-neutral-555 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Ingresar
              </Link>
            )}

            {/* Light/Dark Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white cursor-pointer"
              aria-label="Alternar Tema"
              title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Shopping Cart Trigger */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white cursor-pointer"
              aria-label="Carrito"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-black dark:bg-white text-[9px] font-bold text-white dark:text-black font-mono">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-neutral-555 dark:text-neutral-450 hover:text-black dark:hover:text-white md:hidden cursor-pointer"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-900 bg-white dark:bg-black py-4 px-6 space-y-4 tracking-wider uppercase text-sm font-medium transition-colors duration-300">
          <Link 
            href="/" 
            className="block text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white py-1"
            onClick={() => setMenuOpen(false)}
          >
            Colección
          </Link>
          <Link 
            href="/catalog?category=camisas" 
            className="block text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white py-1"
            onClick={() => setMenuOpen(false)}
          >
            Camisas
          </Link>
          <Link 
            href="/catalog?category=gorras" 
            className="block text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white py-1"
            onClick={() => setMenuOpen(false)}
          >
            Gorras
          </Link>
          <hr className="border-neutral-200 dark:border-neutral-900" />
          {session ? (
            <>
              <Link 
                href="/dashboard" 
                className="block text-neutral-600 hover:text-black dark:text-neutral-450 dark:hover:text-white py-1 font-mono text-xs lowercase"
                onClick={() => setMenuOpen(false)}
              >
                Mi Cuenta ({session.email})
              </Link>
              <button 
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="flex items-center gap-2 text-red-500 py-1 font-mono text-xs w-full text-left cursor-pointer"
              >
                <LogOut size={14} /> Cerrar Sesión
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              className="block text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white py-1"
              onClick={() => setMenuOpen(false)}
            >
              Ingresar / Registrarse
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
