import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 0; // Garantiza stock en tiempo real

type RouteParams = Promise<{ id: string }>;

export default async function ProductDetailPage({
  params,
}: {
  params: RouteParams;
}) {
  const { id } = await params;
  let product = null;

  try {
    product = await prisma.product.findUnique({
      where: { id },
    });
  } catch (e) {
    console.error('Error fetching product:', e);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-black text-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}
