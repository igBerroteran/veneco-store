import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';

export const revalidate = 0; // Garantiza stock en tiempo real

type SearchParams = Promise<{ category?: string }>;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const currentCategory = params.category || '';

  // Filtrar según categoría
  const whereClause = currentCategory ? { category: currentCategory } : {};

  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    console.error('Error cargando catálogo:', e);
  }

  const categories = [
    { name: 'Todos', value: '' },
    { name: 'Franelas / Camisas', value: 'camisas' },
    { name: 'Gorras', value: 'gorras' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-900 pb-8 space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
            Catálogo Oficial
          </p>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight">
            Colección {currentCategory === 'camisas' ? 'Franelas' : currentCategory === 'gorras' ? 'Gorras' : 'Completa'}
          </h1>
        </div>

        {/* Filters */}
        <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-900 pb-6 overflow-x-auto font-mono text-xs uppercase tracking-wider">
          {categories.map((cat) => {
            const isActive = currentCategory === cat.value;
            const url = cat.value ? `/catalog?category=${cat.value}` : '/catalog';
            return (
              <Link
                key={cat.name}
                href={url}
                className={`px-5 py-2.5 border transition-all ${
                  isActive 
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-bold' 
                    : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-850 dark:hover:border-neutral-450 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4">
              <p className="text-neutral-500 font-serif italic text-lg">No hay productos en esta categoría por el momento.</p>
              <Link 
                href="/catalog" 
                className="inline-block text-xs font-mono tracking-widest uppercase border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white px-6 py-3 transition-colors text-neutral-500 dark:text-neutral-450"
              >
                Ver Todo el Catálogo
              </Link>
            </div>
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
    </div>
  );
}
