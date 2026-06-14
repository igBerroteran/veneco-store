import React from 'react';
import Link from 'next/link';
import { ArrowRight, Home, ShoppingBag, LogIn } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-md w-full border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 p-8 sm:p-10 text-center space-y-8 shadow-2xl rounded">
        
        {/* Large 404 Title */}
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">Error 404</p>
          <h1 className="text-7xl font-black tracking-tighter uppercase font-mono">
            404
          </h1>
          <h2 className="text-lg font-bold uppercase tracking-tight">Ruta No Encontrada</h2>
        </div>

        {/* Divider line */}
        <div className="h-0.5 bg-neutral-100 dark:bg-neutral-900 w-16 mx-auto" />

        {/* Friendly Message */}
        <p className="text-xs text-neutral-600 dark:text-neutral-450 leading-relaxed max-w-sm mx-auto">
          La página que buscas no existe o fue movida. Puedes volver al inicio o explorar nuestro catálogo exclusivo de streetwear.
        </p>

        {/* Navigation list */}
        <div className="pt-2 flex flex-col gap-3 font-mono text-xs text-left">
          <Link 
            href="/" 
            className="flex items-center justify-between border border-neutral-200 dark:border-neutral-850 px-4 py-3.5 hover:border-black dark:hover:border-white hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-all rounded text-black dark:text-white"
          >
            <span className="flex items-center gap-2">
              <Home size={14} /> Inicio
            </span>
            <ArrowRight size={12} />
          </Link>

          <Link 
            href="/catalog" 
            className="flex items-center justify-between border border-neutral-200 dark:border-neutral-850 px-4 py-3.5 hover:border-black dark:hover:border-white hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-all rounded text-black dark:text-white"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag size={14} /> Ver Catálogo
            </span>
            <ArrowRight size={12} />
          </Link>

          <Link 
            href="/login" 
            className="flex items-center justify-between border border-neutral-200 dark:border-neutral-850 px-4 py-3.5 hover:border-black dark:hover:border-white hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-all rounded text-black dark:text-white"
          >
            <span className="flex items-center gap-2">
              <LogIn size={14} /> Iniciar Sesión
            </span>
            <ArrowRight size={12} />
          </Link>
        </div>

      </div>
    </div>
  );
}
