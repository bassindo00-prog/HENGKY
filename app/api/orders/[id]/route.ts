import { NextResponse } from 'next/server';
import { deleteOrder, updateOrderStatus, type OrderStatus } from '@/lib/store';

const VALID_STATUSES: OrderStatus[] = ['Baru', 'Mockup', 'Produksi', 'Selesai'];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = (await request.json()) as { status?: OrderStatus };
  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
  }

  const order = await updateOrderStatus(id, body.status);
  if (!order) {
    return NextResponse.json({ error: 'Order tidak ditemukan.' }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const deleted = await deleteOrder(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Order tidak ditemukan.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

