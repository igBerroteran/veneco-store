'use client';

import React, { useState } from 'react';
import { ShoppingBag, Minus, Plus, ChevronRight, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  sizes: string;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  
  // Parsear tallas disponibles
  const availableSizes = product.sizes.split(',').map(s => s.trim());
  
  // Estados
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || 'Ajustable');
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (product.stock === 0) return;

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
    }, quantity);

    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <div className="font-sans text-black dark:text-white transition-colors duration-300">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-neutral-500 mb-10">
        <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Inicio</Link>
        <ChevronRight size={12} />
        <Link href="/catalog" className="hover:text-black dark:hover:text-white transition-colors">Catálogo</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-700 dark:text-neutral-300">{product.name}</span>
      </nav>

      {/* Main product view grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Left Column: Image */}
        <div className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-4 relative group transition-colors duration-300">
          <div className="aspect-square w-full overflow-hidden bg-white dark:bg-black border border-neutral-200 dark:border-neutral-900 transition-colors duration-300">
            <img 
              src={product.image} 
              alt={product.name} 
              className="h-full w-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
          {product.stock === 0 && (
            <span className="absolute top-8 right-8 bg-red-650 text-white font-mono text-xs uppercase tracking-widest px-4 py-1.5 font-bold shadow-lg">
              Agotado / Sold Out
            </span>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="space-y-8">
          
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
              {product.category}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              {product.name}
            </h1>
            <p className="font-mono text-2xl font-bold pt-2 text-black dark:text-white">
              ${product.price.toFixed(2)} USD
            </p>
          </div>

          <hr className="border-neutral-200 dark:border-neutral-900" />

          {/* Description */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-semibold">
              Descripción
            </h3>
            <p className="text-sm text-neutral-605 dark:text-neutral-350 leading-relaxed font-sans transition-colors duration-300">
              {product.description}
            </p>
          </div>

          <hr className="border-neutral-200 dark:border-neutral-900" />

          {/* Size Selector */}
          {availableSizes.length > 0 && availableSizes[0] !== 'Ajustable' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest text-neutral-500">
                <span>Seleccionar Talla</span>
                <span className="text-neutral-450 dark:text-neutral-400">Guía de Tallas</span>
              </div>
              <div className="flex flex-wrap gap-3 font-mono text-xs">
                {availableSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-3 border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-bold'
                          : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-850 dark:hover:border-neutral-400 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity and CTA */}
          <div className="space-y-6 pt-4">
            
            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-3">
                <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500">
                  Cantidad
                </label>
                <div className="flex items-center border border-neutral-200 dark:border-neutral-850 rounded w-32 bg-white dark:bg-neutral-900/20 transition-colors duration-300">
                  <button 
                    onClick={handleDecrease}
                    className="px-4 py-2.5 text-neutral-500 hover:text-black dark:text-neutral-450 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="flex-1 text-center font-mono text-sm">{quantity}</span>
                  <button 
                    onClick={handleIncrease}
                    className="px-4 py-2.5 text-neutral-500 hover:text-black dark:text-neutral-450 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Cart Status / Stock notice */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-neutral-500 dark:text-neutral-400">
                {product.stock > 0 
                  ? `Disponible en stock (${product.stock} unidades)` 
                  : 'Sin stock disponible actualmente'}
              </span>
            </div>

            {/* Main Action Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addedFeedback}
              className={`w-full flex items-center justify-center gap-3 py-4.5 font-mono text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                addedFeedback 
                  ? 'bg-green-650 text-white' 
                  : product.stock === 0 
                    ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-550 border border-neutral-200 dark:border-neutral-850 cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200'
              }`}
            >
              {addedFeedback ? (
                <>
                  <Check size={16} />
                  Agregado al Carrito
                </>
              ) : product.stock === 0 ? (
                'Agotado'
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Agregar al Carrito
                </>
              )}
            </button>

          </div>

          {/* Premium attributes cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-200 dark:border-neutral-900 pt-8 text-center sm:text-left font-mono text-[10px] tracking-wider text-neutral-500 uppercase transition-colors duration-300">
            <div className="space-y-1">
              <p className="text-neutral-700 dark:text-neutral-350 font-bold">100% Algodón</p>
              <p className="text-[9px]">Premium pesado 240g</p>
            </div>
            <div className="space-y-1">
              <p className="text-neutral-700 dark:text-neutral-350 font-bold">Hecho en Venezuela</p>
              <p className="text-[9px]">Diseño y manufactura local</p>
            </div>
            <div className="space-y-1">
              <p className="text-neutral-700 dark:text-neutral-350 font-bold">Drops Limitados</p>
              <p className="text-[9px]">No re-stocks garantizados</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
