import { NextResponse } from 'next/server';
import path from 'path';
import {
  createOrder,
  listOrders,
  uploadSampleFile,
  type OrderItem,
} from '@/lib/store';

export async function GET() {
  const orders = await listOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const customerName = String(formData.get('customerName') ?? '').trim();
    const customerWhatsapp = String(formData.get('customerWhatsapp') ?? '').trim();
    const product = String(formData.get('product') ?? '').trim();
    const technique = String(formData.get('technique') ?? '').trim();
    const rawSizes = String(formData.get('sizes') ?? '{}');
    let sizes: Record<string, number> = {};
    try {
      const parsed = JSON.parse(rawSizes) as Record<string, unknown>;
      for (const [k, v] of Object.entries(parsed)) {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) sizes[k] = Math.floor(n);
      }
    } catch {
      sizes = {};
    }
    const sizeSum = Object.values(sizes).reduce((a, b) => a + b, 0);
    const qtyInput = Number(formData.get('qty') ?? 0);
    const qty = sizeSum > 0 ? sizeSum : (Number.isFinite(qtyInput) && qtyInput > 0 ? qtyInput : 12);
    const notes = String(formData.get('notes') ?? '').trim();
    const file = formData.get('file');

    if (!customerName || !customerWhatsapp) {
      return NextResponse.json(
        { error: 'Nama dan nomor WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    const id = 'BS-' + String(Date.now()).slice(-6);

    let fileName: string | null = null;
    let fileUrl: string | null = null;

    if (file && file instanceof File && file.size > 0) {
      const ext = path.extname(file.name) || '.png';
      const safeBase = path
        .basename(file.name, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 40);
      const savedName = `${id}_${safeBase}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      fileName = file.name;
      fileUrl = await uploadSampleFile(
        savedName,
        buffer,
        file.type || 'application/octet-stream'
      );
    }

    const newOrder: OrderItem = {
      id,
      createdAt: new Date().toISOString(),
      customerName,
      customerWhatsapp,
      product,
      technique,
      qty,
      sizes,
      notes,
      fileName,
      fileUrl,
      status: 'Baru',
    };

    const saved = await createOrder(newOrder);

    return NextResponse.json(saved, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Gagal menyimpan pesanan.' },
      { status: 500 }
    );
  }
}

