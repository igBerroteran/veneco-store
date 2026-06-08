'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      router.refresh();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-white dark:bg-black text-black dark:text-white py-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-md w-full border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/40 p-8 sm:p-10 space-y-8 shadow-2xl transition-colors">
        
        {/* Logo and Slogan */}
        <div className="text-center space-y-3">
          <img 
            src="/logo.svg" 
            alt="VENECO" 
            className="h-12 w-auto mx-auto object-contain dark:invert transition-all" 
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            Crear cuenta de cliente
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          <div className="space-y-4">
            
            <div>
              <label htmlFor="name" className="block text-xs font-mono uppercase text-neutral-500 mb-1">
                Nombre Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-4 py-3 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors rounded"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-mono uppercase text-neutral-500 mb-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@veneco.store"
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-4 py-3 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors rounded"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-mono uppercase text-neutral-500 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-4 py-3 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors rounded"
              />
            </div>

          </div>

          {error && (
            <p className="text-red-500 font-mono text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 py-4 font-mono text-xs font-bold uppercase tracking-widest transition-all disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-550 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin" size={14} />
                Registrando...
              </>
            ) : (
              <>
                Crear Cuenta
                <ArrowRight size={14} />
              </>
            )}
          </button>

        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-neutral-555 font-mono">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-black dark:text-white hover:underline uppercase tracking-wider pl-1 font-bold">
              Inicia Sesión
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
