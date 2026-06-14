'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, CreditCard, Loader } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { 
    cartItems, 
    cartTotal, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart 
  } = useCart();

  const router = useRouter();

  // Campos del formulario de envío
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Cargar email y nombre de usuario si ya ha iniciado sesión
  useEffect(() => {
    if (isCartOpen) {
      const fetchUserData = async () => {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setEmail(data.user.email || '');
              setName(data.user.name || '');
            }
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchUserData();
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (cartItems.length === 0) {
      setErrorMessage('El carrito está vacío');
      return;
    }

    if (!email || !name || !address) {
      setErrorMessage('Por favor completa todos los datos de envío');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          customerEmail: email,
          customerName: name,
          shippingAddress: address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar el checkout');
      }

      // Redirigir a Stripe Checkout (o checkout simulado)
      if (data.url) {
        setIsCartOpen(false);
        router.push(data.url);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-neutral-950 text-black dark:text-white border-l border-neutral-200 dark:border-neutral-900 flex flex-col h-full shadow-2xl transition-colors duration-300">
          
          {/* Header */}
          <div className="px-6 py-6 border-b border-neutral-200 dark:border-neutral-900 flex items-center justify-between transition-colors">
            <h2 className="text-sm font-mono tracking-widest uppercase font-semibold">
              Tu Carrito
            </h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-1 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-serif italic">Tu carrito está vacío.</p>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-xs font-mono tracking-widest uppercase border border-black dark:border-white px-4 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer text-black dark:text-white bg-transparent"
                >
                  Ver Productos
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-4 border-b border-neutral-100 dark:border-neutral-900/60 pb-6 transition-colors">
                  {/* Thumbnail */}
                  <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-sm font-semibold tracking-wide">
                        <h3>{item.name}</h3>
                        <p className="ml-4 font-mono">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-450 font-mono">
                        Talla: {item.size}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-neutral-200 dark:border-neutral-850 rounded bg-white dark:bg-neutral-900/40 transition-colors">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="px-2.5 py-1 text-neutral-500 dark:text-neutral-455 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 font-mono">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="px-2.5 py-1 text-neutral-500 dark:text-neutral-455 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => removeFromCart(item.productId, item.size)}
                        className="text-neutral-400 hover:text-red-500 dark:text-neutral-550 dark:hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Formulario de envío si hay artículos */}
            {cartItems.length > 0 && (
              <form id="checkout-form" onSubmit={handleCheckout} className="border-t border-neutral-200 dark:border-neutral-900 pt-6 mt-8 space-y-4 text-xs transition-colors">
                <h3 className="text-neutral-500 dark:text-neutral-400 font-mono uppercase tracking-widest font-semibold pb-1">
                  Datos de Envío y Contacto
                </h3>
                
                <div>
                  <label className="block text-neutral-500 mb-1 font-mono uppercase">Email</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-850 px-3 py-2 text-sm text-black dark:text-white focus:outline-none transition-colors rounded"
                  />
                </div>

                <div>
                  <label className="block text-neutral-500 mb-1 font-mono uppercase">Nombre Completo</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="w-full bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-850 px-3 py-2 text-sm text-black dark:text-white focus:outline-none transition-colors rounded"
                  />
                </div>

                <div>
                  <label className="block text-neutral-500 mb-1 font-mono uppercase">Dirección de Entrega</label>
                  <textarea 
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, Ciudad, Estado, Código Postal"
                    className="w-full bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-850 px-3 py-2 text-sm text-black dark:text-white focus:outline-none transition-colors resize-none rounded"
                  />
                </div>

                {errorMessage && (
                  <p className="text-red-500 font-mono text-xs mt-2">{errorMessage}</p>
                )}
              </form>
            )}
          </div>

          {/* Footer of Drawer */}
          {cartItems.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-neutral-900 px-6 py-6 bg-white dark:bg-neutral-950/80 space-y-4 transition-colors">
              <div className="flex justify-between text-sm font-semibold tracking-wide">
                <p className="uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Subtotal</p>
                <p className="font-mono text-lg">${cartTotal.toFixed(2)} USD</p>
              </div>
              <p className="text-[10px] text-neutral-550 dark:text-neutral-500 font-mono italic">
                Impuestos y envío calculados al finalizar el pago.
              </p>
              
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 py-4 font-mono text-xs font-bold uppercase tracking-widest transition-all disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-500 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    Proceder al Pago
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
