'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-900 text-black dark:text-white py-16 mt-auto transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          
          {/* Brand & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="VENECO Logo" 
                className="h-8 w-auto object-contain dark:invert transition-all" 
              />
              <span className="font-mono text-xs tracking-[0.25em] text-neutral-500 dark:text-neutral-450">
                CO
              </span>
            </div>
            <p className="font-serif italic text-lg text-neutral-800 dark:text-neutral-200 max-w-sm tracking-wide">
              &ldquo;De un insulto, sacamos un gramy.&rdquo;
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-500 max-w-xs leading-relaxed font-sans">
              Reclamando lo nuestro. Diseño de alta costura urbana, minimalista y de alto contraste inspirado en la venezolanidad.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs tracking-[0.2em] text-neutral-550 dark:text-neutral-400 uppercase font-semibold">
              Enlaces
            </h3>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400 font-sans">
              <li>
                <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
                  Inicio / Colección
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=camisas" className="hover:text-black dark:hover:text-white transition-colors">
                  Franelas / Camisas
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=gorras" className="hover:text-black dark:hover:text-white transition-colors">
                  Gorras
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-black dark:hover:text-white transition-colors font-mono text-xs">
                  Acceso Cliente / Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Newsletter */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs tracking-[0.2em] text-neutral-550 dark:text-neutral-400 uppercase font-semibold">
              Newsletter
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-450 leading-relaxed font-sans">
              Entérate primero de los nuevos drops de edición limitada.
            </p>
            <form className="flex max-w-md border-b border-neutral-300 dark:border-neutral-800 pb-1" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Tu email" 
                className="bg-transparent text-sm w-full focus:outline-none placeholder-neutral-400 dark:placeholder-neutral-600 pr-4 py-1.5 font-sans text-black dark:text-white"
              />
              <button 
                type="submit" 
                className="text-xs font-mono tracking-widest uppercase hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors cursor-pointer text-black dark:text-white"
              >
                Unirse
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="border-t border-neutral-200 dark:border-neutral-900 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500 font-mono gap-4">
          <p>© {new Date().getFullYear()} VENECO CO. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-black dark:hover:text-neutral-300 transition-colors">Instagram</a>
            <a href="#" className="hover:text-black dark:hover:text-neutral-300 transition-colors">X (Twitter)</a>
            <a href="#" className="hover:text-black dark:hover:text-neutral-300 transition-colors">Soporte</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
