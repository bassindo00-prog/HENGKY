import { NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig, type SiteConfig } from '@/lib/store';

export async function GET() {
  const siteConfig = await getSiteConfig();
  return NextResponse.json(siteConfig);
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<SiteConfig>;
    const current = await getSiteConfig();
    const updated: SiteConfig = {
      ...current,
      ...body,
      marqueeItems: Array.isArray(body.marqueeItems) && body.marqueeItems.length === 3
        ? [
            String(body.marqueeItems[0]),
            String(body.marqueeItems[1]),
            String(body.marqueeItems[2]),
          ]
        : current.marqueeItems,
    };
    const saved = await saveSiteConfig(updated);
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: 'Invalid config payload' }, { status: 400 });
  }
}

