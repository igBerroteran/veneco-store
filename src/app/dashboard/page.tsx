import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Calendar, Package, MapPin, CheckCircle, Clock, Truck } from 'lucide-react';
import Link from 'next/link';
import CancelOrderButton from './CancelOrderButton';
import { Order, OrderItem, Product } from '@prisma/client';

type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product;
  })[];
};

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Si es administrador, redirigir al panel de administrador
  if (session.role === 'admin') {
    redirect('/admin/dashboard');
  }

  // Buscar las órdenes de este cliente
  let orders: OrderWithItems[] = [];
  try {
    orders = await prisma.order.findMany({
      where: { userId: session.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    console.error('Error fetching client orders:', e);
  }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-450 dark:border-green-900 uppercase">
            <CheckCircle size={10} /> Pagado
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-455 dark:border-blue-900 uppercase">
            <Truck size={10} /> Enviado
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-neutral-50 text-neutral-700 border border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800 uppercase">
            <Package size={10} /> Entregado
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900 uppercase">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950 dark:text-yellow-500 dark:border-yellow-900 uppercase">
            <Clock size={10} /> Pendiente
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white py-16 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Welcome Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-900 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2">Panel del Cliente</p>
            <h1 className="text-4xl font-black uppercase tracking-tight">Hola, {session.name}</h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-450 font-mono mt-1">Registrado como: {session.email}</p>
          </div>
          <Link 
            href="/catalog" 
            className="text-xs font-mono tracking-widest uppercase border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white px-5 py-3 transition-colors text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-transparent"
          >
            Continuar Comprando
          </Link>
        </div>

        {/* Orders Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-mono uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-900 pb-4">
            Historial de Compras
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-200 dark:border-neutral-900 p-8">
              <Package size={36} className="mx-auto text-neutral-400 dark:text-neutral-600 mb-4" />
              <p className="text-neutral-600 dark:text-neutral-450 font-serif italic mb-4">Aún no has realizado ninguna compra.</p>
              <Link 
                href="/catalog" 
                className="inline-block text-xs font-mono tracking-widest uppercase bg-black text-white dark:bg-white dark:text-black px-6 py-3 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                Explorar Colección
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order) => (
                <div key={order.id} className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/20 p-6 space-y-6 transition-colors">
                  
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-xs font-mono text-neutral-500 dark:text-neutral-450 pb-4 border-b border-neutral-200 dark:border-neutral-900/60">
                    <div className="space-y-1">
                      <p className="uppercase text-neutral-500">ID de Pedido</p>
                      <p className="font-bold text-black dark:text-white text-sm">{order.id}</p>
                    </div>
                    <div className="flex flex-wrap gap-6">
                      <div className="space-y-1">
                        <p className="uppercase text-neutral-500">Fecha</p>
                        <p className="text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(order.createdAt).toLocaleDateString('es-VE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="uppercase text-neutral-500">Total</p>
                        <p className="text-black dark:text-white font-bold text-sm">${order.total.toFixed(2)} USD</p>
                      </div>
                      <div className="space-y-1">
                        <p className="uppercase text-neutral-500">Estado</p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          {order.status === 'pending' && (
                            <CancelOrderButton orderId={order.id} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Progress Tracker */}
                  <div className="py-6 border-b border-neutral-100 dark:border-neutral-900/60">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-neutral-500 mb-4">
                      <span>Progreso de Entrega</span>
                      <span className="font-bold text-black dark:text-white">
                        {order.status === 'pending' && 'En espera de pago'}
                        {order.status === 'paid' && 'Preparando envío'}
                        {order.status === 'shipped' && 'En tránsito (Camino a destino)'}
                        {order.status === 'completed' && 'Entregado'}
                        {order.status === 'cancelled' && 'Cancelado'}
                      </span>
                    </div>
                    {order.status !== 'cancelled' ? (
                      <div className="relative flex items-center justify-between px-2 sm:px-6">
                        {/* Connecting Line */}
                        <div className="absolute left-6 right-6 top-[11px] h-0.5 bg-neutral-100 dark:bg-neutral-900 z-0" />
                        <div 
                          className="absolute left-6 top-[11px] h-0.5 bg-black dark:bg-white z-0 transition-all duration-500" 
                          style={{
                            width: 
                              order.status === 'pending' ? '0%' :
                              order.status === 'paid' ? '33.33%' :
                              order.status === 'shipped' ? '66.66%' :
                              order.status === 'completed' ? '100%' : '0%'
                          }}
                        />

                        {/* Steps */}
                        {[
                          { label: 'Recibido', val: 'pending' },
                          { label: 'Confirmado', val: 'paid' },
                          { label: 'Enviado', val: 'shipped' },
                          { label: 'Entregado', val: 'completed' }
                        ].map((step, idx) => {
                          const stepsOrder = ['pending', 'paid', 'shipped', 'completed'];
                          const currentIdx = stepsOrder.indexOf(order.status);
                          const stepIdx = stepsOrder.indexOf(step.val);
                          const isDone = stepIdx <= currentIdx;
                          const isActive = step.val === order.status;

                          return (
                            <div key={step.val} className="relative z-10 flex flex-col items-center">
                              <div 
                                className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-mono transition-all duration-300 ${
                                  isDone 
                                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                                    : 'bg-white text-neutral-400 border-neutral-200 dark:bg-black dark:border-neutral-800'
                                } ${isActive ? 'ring-4 ring-neutral-205/50 dark:ring-neutral-900/80 scale-110 font-bold' : ''}`}
                              >
                                {idx + 1}
                              </div>
                              <span className={`text-[9px] font-mono uppercase mt-1.5 tracking-wider hidden sm:block ${
                                isActive ? 'text-black dark:text-white font-bold' : 'text-neutral-500'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 p-3 text-xs text-red-650 dark:text-red-400 font-mono uppercase tracking-wider rounded text-center">
                        Este pedido ha sido cancelado
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div className="h-16 w-14 overflow-hidden border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900 flex-shrink-0">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-grow flex justify-between items-center text-sm">
                          <div>
                            <h4 className="font-semibold tracking-wide text-neutral-800 dark:text-neutral-100">{item.product.name}</h4>
                            <p className="text-xs text-neutral-500 font-mono mt-0.5">
                              Talla: {item.size} • Cantidad: {item.quantity}
                            </p>
                          </div>
                          <span className="font-mono text-neutral-600 dark:text-neutral-400">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address & Admin Notes Footer */}
                  <div className="pt-4 border-t border-neutral-200 dark:border-neutral-900/40 text-xs font-mono text-neutral-500 space-y-4">
                    <div className="flex gap-2 items-start">
                      <MapPin size={14} className="text-neutral-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-neutral-700 dark:text-neutral-400">Dirección de Envío:</p>
                        <p className="mt-0.5 text-neutral-600 dark:text-neutral-400">{order.shippingAddress}</p>
                      </div>
                    </div>

                    {(order.trackingNumber || order.adminNotes) && (
                      <div className="pl-6 border-l-2 border-neutral-200 dark:border-neutral-900 space-y-2.5">
                        {order.trackingNumber && (
                          <div>
                            <span className="font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider text-[10px] block">Número de Seguimiento (Envío):</span>
                            <span className="text-blue-600 dark:text-blue-450 font-bold bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded inline-block mt-0.5">{order.trackingNumber}</span>
                          </div>
                        )}
                        {order.adminNotes && (
                          <div>
                            <span className="font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider text-[10px] block">Nota de la Tienda:</span>
                            <p className="text-neutral-800 dark:text-neutral-200 mt-0.5 bg-neutral-50 dark:bg-neutral-900/20 p-2.5 rounded border border-neutral-100 dark:border-neutral-900/80 leading-relaxed font-sans">{order.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
