import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await getSession();

  // Verificar que esté autenticado y tenga rol de administrador
  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  // 1. Obtener todos los pedidos
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Obtener todos los productos
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // 3. Calcular estadísticas
  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'completed');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const stats = {
    totalRevenue,
    totalOrdersCount,
    productsCount: products.length,
    outOfStockCount,
  };

  return (
    <div className="bg-black text-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminDashboardClient 
          initialProducts={products} 
          initialOrders={orders} 
          stats={stats} 
          adminName={session.name} 
        />
      </div>
    </div>
  );
}
