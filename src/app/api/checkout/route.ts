import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Inicializar Stripe solo si no es la clave de prueba de marcador de posición
const isMockStripe = STRIPE_SECRET_KEY.includes('MockSecretKeyHere') || !STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;

if (!isMockStripe) {
  try {
    stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-18.acacia' as any, // Versión más reciente
    });
  } catch (err) {
    console.error('Error al inicializar Stripe:', err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    // No requerimos sesión obligatoria para comprar (puede ser invitado),
    // pero si hay sesión, asociamos la orden al cliente.
    const { items, customerEmail, customerName, shippingAddress } = await request.json();

    if (!items || items.length === 0 || !customerEmail || !customerName || !shippingAddress) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios para el checkout' },
        { status: 400 }
      );
    }

    // 1. Validar productos en la base de datos (precios y stock)
    const orderItemsToCreate = [];
    let totalOrderAmount = 0;

    for (const item of items) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!dbProduct) {
        return NextResponse.json(
          { error: `El producto ${item.name} ya no está disponible` },
          { status: 404 }
        );
      }

      if (dbProduct.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${dbProduct.name}. Disponible: ${dbProduct.stock}` },
          { status: 400 }
        );
      }

      const itemPrice = dbProduct.price;
      const subtotal = itemPrice * item.quantity;
      totalOrderAmount += subtotal;

      orderItemsToCreate.push({
        productId: dbProduct.id,
        quantity: item.quantity,
        price: itemPrice,
        size: item.size || 'Ajustable',
      });
    }

    // 2. Crear la orden temporal con estado "pending"
    const order = await prisma.order.create({
      data: {
        userId: session?.id || null,
        customerEmail,
        customerName,
        shippingAddress,
        total: totalOrderAmount,
        status: 'pending',
        items: {
          create: orderItemsToCreate,
        },
      },
    });

    // 3. Si Stripe está en modo Mock o no está configurado, usamos pasarela simulada
    if (isMockStripe || !stripe) {
      console.log('Pasarela Stripe en modo SIMULADO. Redirigiendo a pasarela interna de pruebas.');
      // Crear un id de sesión simulado
      const mockSessionId = `mock_session_${order.id}_${Date.now()}`;
      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: mockSessionId },
      });

      return NextResponse.json({
        url: `${APP_URL}/checkout/mock?order_id=${order.id}&session_id=${mockSessionId}`,
        isMock: true,
      });
    }

    // 4. Si Stripe está configurado correctamente, crear sesión Stripe Checkout
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [`${APP_URL}${item.image}`],
        },
        unit_amount: Math.round(item.price * 100), // Stripe usa centavos
      },
      quantity: item.quantity,
    }));

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${APP_URL}/cart?checkout_cancelled=true`,
      customer_email: customerEmail,
      metadata: {
        orderId: order.id,
      },
    });

    // Actualizar orden con el id de sesión de Stripe
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error('Error en checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar el pago' },
      { status: 500 }
    );
  }
}
