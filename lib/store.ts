import fs from 'fs';
import path from 'path';
import {
  DEFAULT_CONFIG,
  type OrderItem,
  type OrderStatus,
  type SiteConfig,
  type StoreData,
} from './types';

export * from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
export const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

const DEFAULT_STORE: StoreData = {
  siteConfig: DEFAULT_CONFIG,
  orders: [],
};

function getSupabaseEnv() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const url = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'samples';
  if (!url || !key) return null;
  return { url, key, bucket };
}

function supabaseHeaders(key: string, extra?: Record<string, string>) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  };
}

export function normalizeConfig(cfg?: Partial<SiteConfig> | null): SiteConfig {
  const src = cfg ?? {};
  return {
    ...DEFAULT_CONFIG,
    ...src,
    marqueeItems:
      Array.isArray(src.marqueeItems) && src.marqueeItems.length === 3
        ? src.marqueeItems
        : DEFAULT_CONFIG.marqueeItems,
    looksMeta:
      Array.isArray(src.looksMeta) && src.looksMeta.length === 6
        ? src.looksMeta
        : DEFAULT_CONFIG.looksMeta,
    techniques:
      Array.isArray(src.techniques) && src.techniques.length > 0
        ? src.techniques
        : DEFAULT_CONFIG.techniques,
    steps:
      Array.isArray(src.steps) && src.steps.length > 0
        ? src.steps
        : DEFAULT_CONFIG.steps,
    products:
      Array.isArray(src.products) && src.products.length > 0
        ? src.products
        : DEFAULT_CONFIG.products,
    printAddons:
      Array.isArray(src.printAddons) && src.printAddons.length > 0
        ? src.printAddons
        : DEFAULT_CONFIG.printAddons,
    workshopCards:
      Array.isArray(src.workshopCards) && src.workshopCards.length === 3
        ? src.workshopCards
        : DEFAULT_CONFIG.workshopCards,
    workshopStats:
      Array.isArray(src.workshopStats) && src.workshopStats.length === 3
        ? src.workshopStats
        : DEFAULT_CONFIG.workshopStats,
    faqs:
      Array.isArray(src.faqs) && src.faqs.length > 0
        ? src.faqs
        : DEFAULT_CONFIG.faqs,
  };
}

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function readStore(): StoreData {
  ensureDirs();
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
    return structuredClone(DEFAULT_STORE);
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      siteConfig: normalizeConfig(parsed.siteConfig),
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    return structuredClone(DEFAULT_STORE);
  }
}

export function writeStore(data: StoreData): void {
  ensureDirs();
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

interface SupabaseOrderRow {
  id: string;
  created_at: string;
  customer_name: string;
  customer_whatsapp: string;
  product: string;
  technique: string;
  qty: number;
  sizes?: Record<string, number> | null;
  notes?: string | null;
  file_name?: string | null;
  file_url?: string | null;
  status: OrderStatus;
}

function mapRowToOrder(row: SupabaseOrderRow): OrderItem {
  return {
    id: row.id,
    createdAt: row.created_at,
    customerName: row.customer_name,
    customerWhatsapp: row.customer_whatsapp,
    product: row.product,
    technique: row.technique || '-',
    qty: row.qty,
    sizes: row.sizes ?? {},
    notes: row.notes ?? '',
    fileName: row.file_name ?? null,
    fileUrl: row.file_url ?? null,
    status: row.status,
  };
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const sb = getSupabaseEnv();
  if (!sb) {
    return readStore().siteConfig;
  }

  try {
    const res = await fetch(
      `${sb.url}/rest/v1/site_config?id=eq.default&select=config`,
      {
        headers: supabaseHeaders(sb.key),
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      console.error(`Supabase getSiteConfig failed (${res.status})`);
      return normalizeConfig(null);
    }

    const rows = (await res.json()) as Array<{ config?: Partial<SiteConfig> }>;
    if (!rows.length || !rows[0].config) {
      return normalizeConfig(null);
    }
    return normalizeConfig(rows[0].config);
  } catch (err) {
    console.error('Supabase getSiteConfig error:', err);
    return normalizeConfig(null);
  }
}

export async function saveSiteConfig(config: SiteConfig): Promise<SiteConfig> {
  const normalized = normalizeConfig(config);
  const sb = getSupabaseEnv();
  if (!sb) {
    const store = readStore();
    store.siteConfig = normalized;
    writeStore(store);
    return normalized;
  }

  const res = await fetch(`${sb.url}/rest/v1/site_config`, {
    method: 'POST',
    headers: supabaseHeaders(sb.key, {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    }),
    body: JSON.stringify({
      id: 'default',
      config: normalized,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    throw new Error(`Supabase saveSiteConfig failed (${res.status})`);
  }

  return normalized;
}

export async function listOrders(): Promise<OrderItem[]> {
  const sb = getSupabaseEnv();
  if (!sb) {
    return readStore().orders;
  }

  try {
    const res = await fetch(
      `${sb.url}/rest/v1/orders?select=*&order=created_at.desc`,
      {
        headers: supabaseHeaders(sb.key),
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      console.error(`Supabase listOrders failed (${res.status})`);
      return [];
    }

    const rows = (await res.json()) as SupabaseOrderRow[];
    return rows.map(mapRowToOrder);
  } catch (err) {
    console.error('Supabase listOrders error:', err);
    return [];
  }
}

export async function createOrder(order: OrderItem): Promise<OrderItem> {
  const sb = getSupabaseEnv();
  if (!sb) {
    const store = readStore();
    store.orders.unshift(order);
    writeStore(store);
    return order;
  }

  const res = await fetch(`${sb.url}/rest/v1/orders`, {
    method: 'POST',
    headers: supabaseHeaders(sb.key, {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify({
      id: order.id,
      created_at: order.createdAt,
      customer_name: order.customerName,
      customer_whatsapp: order.customerWhatsapp,
      product: order.product,
      technique: order.technique,
      qty: order.qty,
      sizes: order.sizes ?? {},
      notes: order.notes,
      file_name: order.fileName,
      file_url: order.fileUrl,
      status: order.status,
    }),
  });

  if (!res.ok) {
    throw new Error(`Supabase createOrder failed (${res.status})`);
  }

  const rows = (await res.json()) as SupabaseOrderRow[];
  return rows[0] ? mapRowToOrder(rows[0]) : order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderItem | null> {
  const sb = getSupabaseEnv();
  if (!sb) {
    const store = readStore();
    const order = store.orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    writeStore(store);
    return order;
  }

  const res = await fetch(
    `${sb.url}/rest/v1/orders?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: supabaseHeaders(sb.key, {
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      }),
      body: JSON.stringify({ status }),
    }
  );

  if (!res.ok) {
    throw new Error(`Supabase updateOrderStatus failed (${res.status})`);
  }

  const rows = (await res.json()) as SupabaseOrderRow[];
  return rows[0] ? mapRowToOrder(rows[0]) : null;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const sb = getSupabaseEnv();
  if (!sb) {
    const store = readStore();
    const nextOrders = store.orders.filter((o) => o.id !== id);
    if (nextOrders.length === store.orders.length) return false;
    store.orders = nextOrders;
    writeStore(store);
    return true;
  }

  const res = await fetch(
    `${sb.url}/rest/v1/orders?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: supabaseHeaders(sb.key, {
        Prefer: 'return=representation',
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Supabase deleteOrder failed (${res.status})`);
  }

  const rows = (await res.json()) as SupabaseOrderRow[];
  return rows.length > 0;
}

export async function uploadSampleFile(
  savedName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const sb = getSupabaseEnv();
  if (!sb) {
    ensureDirs();
    fs.writeFileSync(path.join(UPLOADS_DIR, savedName), buffer);
    return `/uploads/${savedName}`;
  }

  const uploadUrl = `${sb.url}/storage/v1/object/${sb.bucket}/${encodeURIComponent(savedName)}`;
  let res = await fetch(uploadUrl, {
    method: 'POST',
    headers: supabaseHeaders(sb.key, {
      'Content-Type': contentType || 'application/octet-stream',
      'x-upsert': 'true',
    }),
    body: new Uint8Array(buffer),
  });

  if (res.status === 404 || res.status === 400) {
    // Ensure public bucket exists if not yet created
    await fetch(`${sb.url}/storage/v1/bucket`, {
      method: 'POST',
      headers: supabaseHeaders(sb.key, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id: sb.bucket, name: sb.bucket, public: true }),
    });

    res = await fetch(uploadUrl, {
      method: 'POST',
      headers: supabaseHeaders(sb.key, {
        'Content-Type': contentType || 'application/octet-stream',
        'x-upsert': 'true',
      }),
      body: new Uint8Array(buffer),
    });
  }

  if (!res.ok) {
    throw new Error(`Supabase storage upload failed (${res.status})`);
  }

  return `${sb.url}/storage/v1/object/public/${sb.bucket}/${encodeURIComponent(savedName)}`;
}
