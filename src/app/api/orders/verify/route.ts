import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const isMockStripe = STRIPE_SECRET_KEY.includes('MockSecretKeyHere') || !STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (!isMockStripe) {
  try {
    stripe = new Stripe(STRIPE_SECRET_KEY);
  } catch (err) {
    console.error('Error al inicializar Stripe:', err);
  }
}

export async function POST(request: Request) {
  try {
    const { sessionId, orderId } = await request.json();

    if (!sessionId || !orderId) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // Buscar la orden
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Si ya está pagada o completada, retornamos éxito inmediato
    if (order.status !== 'pending') {
      return NextResponse.json({ success: true, order, message: 'El pedido ya fue procesado anteriormente' });
    }

    // Validar el pago
    let isPaymentValid = false;

    if (sessionId.startsWith('mock_session_')) {
      // En modo mock, asumimos que es válido si coincide con la orden
      if (order.stripeSessionId === sessionId) {
        isPaymentValid = true;
      }
    } else if (stripe) {
      // Validar con Stripe real
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
      if (stripeSession.payment_status === 'paid' && stripeSession.metadata?.orderId === orderId) {
        isPaymentValid = true;
      }
    }

    if (!isPaymentValid) {
      return NextResponse.json({ error: 'El pago no ha sido verificado o es inválido' }, { status: 400 });
    }

    // Procesar la orden de forma transaccional para actualizar el stock de forma segura
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Actualizar el estado de la orden a "paid"
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: 'paid' },
        include: { items: true },
      });

      // 2. Descontar el stock de cada producto
      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: newStock },
          });
        }
      }

      return updated;
    });

    return NextResponse.json({ success: true, order: updatedOrder, message: 'Pago verificado y stock actualizado' });
  } catch (error: any) {
    console.error('Error al verificar orden:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al verificar el pago' },
      { status: 500 }
    );
  }
}
