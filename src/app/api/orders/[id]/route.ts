import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// Obtener un solo pedido (Detalle)
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    return NextResponse.json(
      { error: 'Error al obtener el pedido' },
      { status: 500 }
    );
  }
}

// Actualizar estado del pedido (Solo Administrador)
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    const { id } = await params;
    const body = await request.json();

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Si no es administrador, restringir cambios a solo cancelación de pedidos pendientes
    if (!session || session.role !== 'admin') {
      if (body.status !== 'cancelled') {
        return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
      }
      if (existingOrder.status !== 'pending') {
        return NextResponse.json({ error: 'Solo se pueden cancelar pedidos pendientes' }, { status: 400 });
      }
      if (existingOrder.userId && (!session || existingOrder.userId !== session.id)) {
        return NextResponse.json({ error: 'Acceso no autorizado a este pedido' }, { status: 403 });
      }
    }

    const updateData: {
      status?: string;
      adminNotes?: string;
      trackingNumber?: string;
    } = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.adminNotes !== undefined && session?.role === 'admin') updateData.adminNotes = body.adminNotes;
    if (body.trackingNumber !== undefined && session?.role === 'admin') updateData.trackingNumber = body.trackingNumber;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
