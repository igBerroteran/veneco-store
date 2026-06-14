'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, ArrowRight, Loader } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

interface OrderDetails {
  id: string;
  customerName: string;
  total: number;
}

import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || '';

  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(!!orderId);

  // Limpiar el carrito y traer información de la orden
  useEffect(() => {
    clearCart();

    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error('Error fetching success order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, clearCart]);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-white dark:bg-black min-h-[70vh]">
        <Loader className="animate-spin text-black dark:text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center bg-white dark:bg-black py-20 px-4 sm:px-6 lg:px-8 font-sans text-black dark:text-white transition-colors duration-300">
      <div className="max-w-md w-full border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/40 p-8 sm:p-10 space-y-8 text-center shadow-2xl transition-colors">
        
        {/* Success Icon */}
        <div className="flex justify-center text-black dark:text-white">
          <CheckCircle2 size={56} className="animate-bounce" />
        </div>

        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            Transacción Completada
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            ¡Pago Exitoso!
          </h1>
          {order && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans">
              Gracias por tu compra, <span className="text-black dark:text-white font-semibold">{order.customerName}</span>.
            </p>
          )}
        </div>

        <hr className="border-neutral-200 dark:border-neutral-900" />

        {/* Order Info Badge */}
        {order ? (
          <div className="bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-850 p-4 space-y-2 rounded text-left font-mono text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex justify-between">
              <span>Pedido ID:</span>
              <span className="text-black dark:text-white font-bold">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Pagado:</span>
              <span className="text-black dark:text-white font-bold">${order.total.toFixed(2)} USD</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-500 font-mono">
            Tu pedido está siendo procesado por nuestro taller.
          </p>
        )}

        <div className="space-y-4 pt-4 font-mono text-xs">
          <p className="font-serif italic text-sm text-neutral-500 dark:text-neutral-400">
            &ldquo;De un insulto, sacamos un Grammy.&rdquo;
          </p>
          <p className="text-[11px] text-neutral-550 max-w-xs mx-auto font-sans leading-relaxed">
            Te hemos enviado un correo de confirmación de compra con los detalles del envío. Tu pedido llegará pronto.
          </p>
        </div>

        <div className="flex flex-col gap-3 font-mono text-xs pt-4">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 py-4 font-bold uppercase tracking-widest transition-all cursor-pointer"
          >
            Ver mis Pedidos
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/catalog"
            className="w-full flex items-center justify-center gap-2 border border-neutral-250 hover:border-black dark:border-neutral-850 dark:hover:border-white text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white py-4 uppercase tracking-widest transition-all cursor-pointer"
          >
            <ShoppingBag size={14} />
            Seguir Comprando
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center bg-white dark:bg-black min-h-[70vh]">
        <Loader className="animate-spin text-black dark:text-white" size={32} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
