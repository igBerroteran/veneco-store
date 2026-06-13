'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { 
  XCircle, 
  Trash2, 
  Edit3, 
  ShoppingBag, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Loader 
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  name: string;
  price: number;
  image: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  size: string;
  product: Product;
}

interface OrderDetails {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

function CartPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, clearCart, setIsCartOpen, cartItems } = useCart();

  const checkoutCancelled = searchParams.get('checkout_cancelled') === 'true';
  const orderId = searchParams.get('order_id') || '';

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Cargar detalles del pedido si fue cancelado
  useEffect(() => {
    if (checkoutCancelled && orderId) {
      setLoading(true);
      fetch(`/api/orders/${orderId}`)
        .then((res) => {
          if (!res.ok) throw new Error('No se pudo cargar la información del pedido.');
          return res.json();
        })
        .then((data) => {
          if (data.status !== 'pending') {
            // Si el pedido ya no está pendiente, no permitimos editarlo/cancelarlo
            setError('Este pedido ya fue procesado o cancelado.');
          } else {
            setOrder(data);
          }
        })
        .catch((err) => {
          console.error(err);
          setError(err.message || 'Error al conectar con el servidor.');
        })
        .finally(() => setLoading(false));
    }
  }, [checkoutCancelled, orderId]);

  // 2. Acción de Cancelar Pedido
  const handleCancelOrder = async () => {
    if (!order) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al cancelar el pedido.');
      }

      setSuccessMsg('Tu pedido ha sido cancelado con éxito.');
      setOrder(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al intentar cancelar.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Acción de Editar Pedido (Cargar en carrito y cancelar pedido pendiente)
  const handleEditOrder = async () => {
    if (!order) return;
    setActionLoading(true);
    setError('');

    try {
      // Primero cancelamos/anulamos el pedido pendiente en la base de datos
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar el estado del pedido.');
      }

      // Limpiamos el carrito actual para evitar duplicados indeseados
      clearCart();

      // Agregamos cada ítem del pedido cancelado de vuelta al carrito local
      order.items.forEach((item) => {
        addToCart({
          productId: item.productId,
          name: item.product.name,
          price: item.price,
          image: item.product.image,
          size: item.size
        }, item.quantity);
      });

      // Abrir el drawer del carrito
      setIsCartOpen(true);
      
      // Redirigir al catálogo para que puedan seguir editando o reintentar
      router.push('/catalog?edited_order=true');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al cargar los productos al carrito.');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader className="animate-spin text-black dark:text-white" size={36} />
      </div>
    );
  }

  // Pantalla de Éxito de Cancelación
  if (successMsg) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center px-4 font-sans transition-colors duration-300">
        <div className="max-w-md w-full border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-8 text-center space-y-6 shadow-xl rounded">
          <XCircle size={48} className="text-neutral-500 mx-auto" />
          <h1 className="text-2xl font-black uppercase tracking-tight">Compra Cancelada</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">{successMsg}</p>
          <div className="pt-4 flex flex-col gap-3 font-mono text-xs">
            <Link href="/catalog" className="w-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 py-3 uppercase tracking-widest font-bold transition-all text-center">
              Volver a la Tienda
            </Link>
            <Link href="/dashboard" className="w-full border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white py-3 uppercase tracking-widest transition-all text-center text-neutral-600 dark:text-neutral-400">
              Ir a Mis Pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Vista de Checkout Cancelado / Pendiente de Recuperar
  if (checkoutCancelled && order) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white py-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Alerta de Checkout Interrumpido */}
          <div className="border border-yellow-200 dark:border-yellow-900 bg-yellow-50/20 dark:bg-yellow-950/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded">
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-wider bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-450 px-2 py-0.5 rounded inline-block font-bold">
                Pago No Completado
              </span>
              <h1 className="text-2xl font-black uppercase tracking-tight mt-1">¿Qué deseas hacer con tu pedido?</h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Cancelaste el pago de Stripe. Tu pedido temporal ha quedado guardado como **pendiente**.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Detalles del Pedido */}
            <div className="md:col-span-2 border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/20 p-6 space-y-6 rounded">
              <h2 className="text-sm font-mono uppercase tracking-widest text-neutral-500 font-bold border-b border-neutral-100 dark:border-neutral-900 pb-3">
                Resumen de la Orden
              </h2>

              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="h-16 w-14 overflow-hidden border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900 flex-shrink-0 rounded">
                      <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-grow flex justify-between items-center text-sm">
                      <div>
                        <h4 className="font-semibold tracking-wide text-neutral-850 dark:text-neutral-100">{item.product.name}</h4>
                        <p className="text-xs text-neutral-500 font-mono mt-0.5">
                          Talla: {item.size} • Cantidad: {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono text-neutral-600 dark:text-neutral-400">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-900/40 text-xs font-mono text-neutral-500 space-y-3">
                <div className="flex justify-between text-sm font-bold text-black dark:text-white pt-2">
                  <span className="uppercase">Total Pedido</span>
                  <span>${order.total.toFixed(2)} USD</span>
                </div>
                <div className="flex gap-2 items-start pt-2 border-t border-neutral-100 dark:border-neutral-900/60">
                  <MapPin size={14} className="text-neutral-400 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-700 dark:text-neutral-400 block">Dirección de Entrega:</span>
                    <p className="mt-0.5 text-neutral-600 dark:text-neutral-400 font-sans">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones de Recuperación */}
            <div className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-6 space-y-6 font-mono text-xs rounded">
              <h3 className="uppercase tracking-widest text-neutral-500 font-bold border-b border-neutral-100 dark:border-neutral-900 pb-3">
                Opciones
              </h3>
              
              <div className="space-y-4">
                <button
                  onClick={handleEditOrder}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 py-4 font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Edit3 size={14} />
                  Editar y Reintentar
                </button>
                <p className="text-[10px] text-neutral-500 leading-normal">
                  Carga estas prendas de vuelta a tu carrito para modificar tallas, agregar productos o cambiar dirección.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-neutral-250 dark:border-neutral-900">
                <button
                  onClick={handleCancelOrder}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 dark:border-red-900 hover:border-red-500 text-red-650 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 py-3.5 uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 size={14} />
                  Cancelar Compra
                </button>
                <p className="text-[10px] text-neutral-500 leading-normal">
                  Anula por completo esta orden pendiente de pago. Podrás volver a comprar cuando desees.
                </p>
              </div>

            </div>

          </div>

          {error && (
            <p className="text-red-500 font-mono text-xs text-center">{error}</p>
          )}

        </div>
      </div>
    );
  }

  // Vista General si no viene de una cancelación específica
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white py-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-xl mx-auto border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 p-8 text-center space-y-6 shadow-2xl rounded">
        <ShoppingBag size={48} className="text-neutral-450 mx-auto" />
        <h1 className="text-2xl font-black uppercase tracking-tight">Tu Carrito de Compras</h1>
        <p className="text-neutral-600 dark:text-neutral-450 text-sm leading-relaxed">
          {cartItems.length > 0 
            ? `Tienes ${cartItems.length} prendas seleccionadas en tu carrito. Abre el panel lateral para verlas.` 
            : 'No tienes productos en tu carrito en este momento.'}
        </p>
        <div className="pt-4 font-mono text-xs">
          <Link href="/catalog" className="inline-flex items-center gap-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-8 py-3.5 uppercase tracking-widest font-bold transition-all">
            Ir al Catálogo <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader className="animate-spin text-black dark:text-white" size={36} />
      </div>
    }>
      <CartPageContent />
    </Suspense>
  );
}
