import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { prisma } from '@/lib/db';

export const revalidate = 0; // Evitar almacenamiento en caché para reflejar stock actual

export default async function HomePage() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    console.error('Error al cargar productos en Home:', e);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center border-b border-neutral-200 dark:border-neutral-900 overflow-hidden py-20 bg-white dark:bg-black transition-colors duration-300">
        
        {/* Fine grid design lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f0f0f_1px,transparent_1px),linear-gradient(to_bottom,#0f0f0f_1px,transparent_1px)] bg-[size:4rem_4rem] transition-all" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-4xl space-y-8">
            
            {/* Stars Arc Graphic */}
            <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-550">
              {[...Array(7)].map((_, i) => (
                <Star key={i} size={12} className="fill-current" />
              ))}
              <span className="font-mono text-xs uppercase tracking-[0.3em] ml-3 text-neutral-500 dark:text-neutral-400">
                Dropping now
              </span>
            </div>

            <h1 className="text-6xl sm:text-8xl font-black tracking-tighter uppercase leading-none font-sans">
              VENECO <br />
              <span className="text-neutral-500 dark:text-neutral-400 font-serif italic font-light lowercase">co</span>
            </h1>

            <p className="text-xl sm:text-2xl font-serif italic text-neutral-700 dark:text-neutral-300 max-w-2xl font-light tracking-wide leading-relaxed">
              "De un insulto, sacamos un gramy."
            </p>

            <p className="text-sm text-neutral-605 dark:text-neutral-400 max-w-lg leading-relaxed font-sans">
              Una oda urbana a la identidad. Ropa sobria, minimalista y de edición limitada. Confeccionada con la esencia pura de la calle venezolana.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 font-mono text-xs">
              <Link 
                href="/catalog" 
                className="inline-flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all text-center"
              >
                Comprar Colección
                <ArrowRight size={14} />
              </Link>
              <Link 
                href="#manifesto" 
                className="inline-flex items-center justify-center border border-neutral-350 hover:border-black dark:border-neutral-800 dark:hover:border-white px-8 py-4 uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all text-center"
              >
                El Manifiesto
              </Link>
            </div>

          </div>
        </div>

        {/* Subtle glowing corner */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-neutral-200/20 dark:bg-white/3 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Featured Collection Grid */}
      <section className="py-24 border-b border-neutral-200 dark:border-neutral-900 bg-white dark:bg-black transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">01 / Drops</p>
              <h2 className="text-3xl font-black tracking-tight uppercase">Colección de Estreno</h2>
            </div>
            <Link 
              href="/catalog" 
              className="group flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Ver todos los productos 
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.length === 0 ? (
              <p className="text-neutral-500 font-serif italic col-span-full">No se encontraron productos disponibles.</p>
            ) : (
              products.map((product) => (
                <Link 
                  href={`/products/${product.id}`} 
                  key={product.id}
                  className="group flex flex-col border border-neutral-200 dark:border-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700 bg-white dark:bg-neutral-950/40 p-4 transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="aspect-square w-full overflow-hidden bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 group-hover:border-neutral-300 dark:group-hover:border-neutral-800 transition-all relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {product.stock === 0 && (
                      <span className="absolute top-2 right-2 bg-red-650 text-white font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="mt-4 flex flex-col justify-between flex-grow">
                    <div className="space-y-1">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                        {product.category}
                      </p>
                      <h3 className="text-sm font-semibold tracking-wide text-neutral-850 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                        {product.name}
                      </h3>
                    </div>
                    <div className="mt-4 flex justify-between items-center pt-3 border-t border-neutral-200 dark:border-neutral-900 font-mono">
                      <span className="text-xs text-neutral-500 dark:text-neutral-450">Tallas: {product.sizes}</span>
                      <span className="text-sm font-bold text-black dark:text-white">${product.price.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

        </div>
      </section>

      {/* Category Blocks Banner */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b border-neutral-200 dark:border-neutral-900">
        
        {/* Camisas banner */}
        <Link 
          href="/catalog?category=camisas"
          className="relative h-[60vh] flex flex-col justify-end p-12 group overflow-hidden border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-900 bg-white hover:bg-neutral-50 dark:bg-neutral-950/40 dark:hover:bg-neutral-950/20 transition-colors duration-300"
        >
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-neutral-950/5 dark:bg-neutral-950/40 dark:group-hover:bg-neutral-950/20 transition-all z-10 duration-500" />
          
          <div className="relative z-20 space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-600 dark:text-neutral-450 bg-white/70 dark:bg-black/60 border border-neutral-200 dark:border-neutral-850 px-3 py-1.5 rounded-full inline-block">
              Categoría
            </span>
            <h3 className="text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">Franelas</h3>
            <p className="text-sm text-neutral-605 dark:text-neutral-400 max-w-sm font-sans leading-relaxed">
              Corte oversized y telas pesadas. Siluetas urbanas diseñadas para el día a día.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-black dark:text-white pt-2">
              Explorar Drop <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
          {/* Background overlay animation */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-200/30 dark:from-black via-transparent to-transparent z-15" />
        </Link>

        {/* Gorras banner */}
        <Link 
          href="/catalog?category=gorras"
          className="relative h-[60vh] flex flex-col justify-end p-12 group overflow-hidden bg-white hover:bg-neutral-50 dark:bg-neutral-950/40 dark:hover:bg-neutral-950/20 transition-colors duration-300"
        >
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-neutral-950/5 dark:bg-neutral-950/40 dark:group-hover:bg-neutral-950/20 transition-all z-10 duration-500" />
          
          <div className="relative z-20 space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-600 dark:text-neutral-450 bg-white/70 dark:bg-black/60 border border-neutral-200 dark:border-neutral-850 px-3 py-1.5 rounded-full inline-block">
              Categoría
            </span>
            <h3 className="text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">Gorras</h3>
            <p className="text-sm text-neutral-605 dark:text-neutral-400 max-w-sm font-sans leading-relaxed">
              Snapbacks estructuradas con bordados de alta densidad y visera plana.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-black dark:text-white pt-2">
              Explorar Drop <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
          {/* Background overlay animation */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-200/30 dark:from-black via-transparent to-transparent z-15" />
        </Link>

      </section>

      {/* Manifesto Section */}
      <section id="manifesto" className="py-32 relative bg-white dark:bg-neutral-950 transition-colors duration-300 overflow-hidden">
        
        {/* Subtle background stars grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:10rem_10rem] opacity-5 pointer-events-none" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-10">
          
          <div className="flex justify-center text-neutral-350 dark:text-neutral-550 gap-1.5">
            {[...Array(7)].map((_, i) => (
              <Star key={i} size={14} className="fill-current opacity-30 dark:opacity-20 text-neutral-800 dark:text-white" />
            ))}
          </div>

          <p className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">
            Nuestro Origen
          </p>

          <blockquote className="font-serif italic text-3xl sm:text-5xl leading-snug tracking-wide text-neutral-805 dark:text-neutral-200 transition-colors">
            "Durante años, la palabra <span className="text-black dark:text-white not-italic font-sans font-black underline decoration-neutral-300 dark:decoration-neutral-800 decoration-4 underline-offset-8">VENECO</span> fue usada con condescendencia, prejuicio e incluso desprecio en tierras ajenas. Pero en el asfalto y el orgullo venezolano hay una regla de oro: la creatividad y la resistencia son infinitas. De ese mismo insulto, hoy tejemos alta costura, de la crítica sacamos arte, y de un insulto... sacamos un Grammy."
          </blockquote>

          <div className="h-0.5 w-16 bg-neutral-300 dark:bg-neutral-850 mx-auto" />

          <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-lg mx-auto font-sans leading-relaxed">
            VENECO CO no es solo una marca de ropa. Es un escudo de identidad, sobrio, imponente y eterno. 
          </p>

        </div>
      </section>

    </div>
  );
}
