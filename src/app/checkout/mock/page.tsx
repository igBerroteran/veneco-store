'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, ShieldCheck, XCircle, ArrowLeft, Loader } from 'lucide-react';
import Link from 'next/link';

interface Product {
  name: string;
  price: number;
}

interface OrderItem {
  product: Product;
  quantity: number;
  size: string;
}

interface OrderDetails {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  total: number;
  status: string;
  items: OrderItem[];
}

import { Suspense } from 'react';

function MockCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || '';
  const sessionId = searchParams.get('session_id') || '';

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(!!orderId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(!orderId ? 'Falta ID de pedido' : '');

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setError('No se pudo cargar la orden');
        }
      } catch (err) {
        console.error(err);
        setError('Error al conectar con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleSimulatePayment = async (success: boolean) => {
    if (isProcessing) return;
    setIsProcessing(true);

    if (!success) {
      router.push(`/cart?checkout_cancelled=true&order_id=${orderId}`);
      return;
    }

    try {
      const res = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Fallo en la simulación del pago');
      }

      router.push(`/checkout/success?session_id=${sessionId}&order_id=${orderId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al procesar el pago simulado');
      setIsProcessing(false);
    }
  };  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-white dark:bg-black min-h-[70vh]">
        <Loader className="animate-spin text-black dark:text-white" size={32} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-white dark:bg-black min-h-[70vh] text-center space-y-6 px-4 text-black dark:text-white transition-colors duration-300">
        <XCircle size={48} className="text-red-500" />
        <h1 className="text-2xl font-black uppercase">Error de Checkout</h1>
        <p className="text-neutral-600 dark:text-neutral-450 text-sm max-w-sm">{error || 'El pedido solicitado no existe o no tienes acceso.'}</p>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono border border-neutral-200 dark:border-neutral-800 px-6 py-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-neutral-600 dark:text-neutral-400 hover:text-white dark:hover:text-black transition-colors uppercase">
          <ArrowLeft size={14} /> Volver a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center bg-white dark:bg-black py-20 px-4 sm:px-6 lg:px-8 font-sans text-black dark:text-white transition-colors duration-300">
      <div className="max-w-xl w-full border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/40 p-8 sm:p-10 space-y-8 shadow-2xl transition-colors">
        
        {/* Header Warning */}
        <div className="text-center space-y-3 pb-4 border-b border-neutral-200 dark:border-neutral-900">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-55 text-yellow-750 border border-yellow-200 dark:bg-yellow-950 dark:text-yellow-500 dark:border-yellow-900 font-mono text-[9px] uppercase tracking-wider rounded-full mb-2">
            Simulador de Pagos Stripe
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white flex items-center justify-center gap-2">
            <CreditCard size={22} />
            Pasarela de Pruebas
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-450 max-w-sm mx-auto font-sans leading-relaxed">
            Stripe no está configurado o está en modo local. Puedes simular el resultado de la transacción.
          </p>
        </div>

        {/* Order details summary */}
        <div className="space-y-4 text-xs font-mono border-b border-neutral-200 dark:border-neutral-900 pb-6">
          <h3 className="uppercase tracking-widest text-neutral-500 font-bold">Resumen del Pedido</h3>
          
          <div className="space-y-2 text-neutral-750 dark:text-neutral-300">
            <div className="flex justify-between">
              <span className="text-neutral-500">Pedido ID:</span>
              <span className="text-black dark:text-white font-bold">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Cliente:</span>
              <span className="text-black dark:text-white">{order.customerName} ({order.customerEmail})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Dirección:</span>
              <span className="text-black dark:text-white truncate max-w-xs">{order.shippingAddress}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-900/40 space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>{item.product.name} (Talla: {item.size}) x{item.quantity}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-900/60 flex justify-between text-sm font-bold text-black dark:text-white">
            <span className="uppercase">Total a Pagar</span>
            <span>${order.total.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Action Buttons to Simulate success / cancel */}
        <div className="flex flex-col sm:flex-row gap-4 font-mono text-xs pt-2">
          
          {/* Cancel Button */}
          <button
            onClick={() => handleSimulatePayment(false)}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 border border-red-200 dark:border-red-900 hover:border-red-500 text-red-650 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 py-4.5 uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
          >
            <XCircle size={16} />
            Declinar Pago
          </button>

          {/* Success Button */}
          <button
            onClick={() => handleSimulatePayment(true)}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 py-4.5 font-bold uppercase tracking-widest transition-all disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-500 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader className="animate-spin" size={16} />
                Procesando...
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Simular Pago Exitoso
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
}

export default function MockCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center bg-white dark:bg-black min-h-[70vh]">
        <Loader className="animate-spin text-black dark:text-white" size={32} />
      </div>
    }>
      <MockCheckoutContent />
    </Suspense>
  );
}
