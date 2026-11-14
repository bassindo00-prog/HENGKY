'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  DEFAULT_CONFIG,
  type OrderItem,
  type OrderStatus,
  type SiteConfig,
} from '@/lib/types';
import './admin.css';

const STATUSES: OrderStatus[] = ['Baru', 'Mockup', 'Produksi', 'Selesai'];

type CmsSection = 'bar1' | 'bar2' | 'bar3' | 'bar4' | 'bar5' | 'bar6';

function formatIDR(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function isImageUrl(url: string | null) {
  if (!url) return false;
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(url);
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<'orders' | 'cms'>('orders');
  const [cmsSec, setCmsSec] = useState<CmsSection>('bar1');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [filter, setFilter] = useState<'Semua' | OrderStatus>('Semua');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [savingCms, setSavingCms] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordRes, cfgRes] = await Promise.all([
        fetch('/api/orders', { cache: 'no-store' }),
        fetch('/api/config', { cache: 'no-store' }),
      ]);
      if (ordRes.ok) setOrders(await ordRes.json());
      if (cfgRes.ok) setConfig(await cfgRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Admin Dasbor — BANG SABLON';
    loadData();
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      setSelectedOrder((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    }
  };

  const deleteOrder = async (id: string) => {
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setSelectedOrder((prev) => (prev && prev.id === id ? null : prev));
    }
  };

  const saveConfig = async (e: FormEvent) => {
    e.preventDefault();
    setSavingCms(true);
    setSavedMsg('');
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSavedMsg(
          'Semua perubahan teks landing page tersimpan! Refresh halaman utama untuk melihat hasil.'
        );
      }
    } finally {
      setSavingCms(false);
    }
  };

  const filteredOrders =
    filter === 'Semua' ? orders : orders.filter((o) => o.status === filter);
  const countBaru = orders.filter((o) => o.status === 'Baru').length;
  const countProd = orders.filter((o) => o.status === 'Produksi').length;
  const totalPcs = orders.reduce((acc, o) => acc + (o.qty || 0), 0);

  return (
    <div className="adm-wrap">
      <header className="adm-top">
        <div className="adm-brand">
          <strong>{config.brandName || 'BANG SABLON'}</strong>
          <span>Dasbor Admin</span>
        </div>

        <div className="adm-tabs">
          <button
            type="button"
            className={`adm-tab${tab === 'orders' ? ' on' : ''}`}
            onClick={() => setTab('orders')}
          >
            Kelola Pemesanan
            <span className="adm-cnt">{orders.length}</span>
          </button>
          <button
            type="button"
            className={`adm-tab${tab === 'cms' ? ' on' : ''}`}
            onClick={() => setTab('cms')}
          >
            Edit Semua Teks Landing Page
          </button>
          <Link href="/" className="adm-link">
            Lihat Landing Page ↗
          </Link>
        </div>
      </header>

      <main className="adm-main">
        {tab === 'orders' ? (
          <>
            <div className="adm-kpis">
              <div className="adm-kpi">
                <span>Total Pesanan</span>
                <strong>{orders.length}</strong>
              </div>
              <div className="adm-kpi">
                <span>Pesanan Baru</span>
                <strong>{countBaru}</strong>
              </div>
              <div className="adm-kpi">
                <span>Sedang Produksi</span>
                <strong>{countProd}</strong>
              </div>
              <div className="adm-kpi">
                <span>Total Pcs Masuk</span>
                <strong>{totalPcs} pcs</strong>
              </div>
            </div>

            <div className="adm-bar">
              <div className="adm-filters">
                {(['Semua', ...STATUSES] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`adm-tab${filter === st ? ' on' : ''}`}
                    onClick={() => setFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button type="button" className="adm-tab" onClick={loadData}>
                Refresh Pesanan
              </button>
            </div>

            <div className="adm-orders">
              {loading ? (
                <div className="adm-empty">Memuat daftar pesanan...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="adm-empty">
                  Belum ada pesanan masuk. Customer yang mengirim sample desain
                  dari landing page akan langsung muncul di sini.
                </div>
              ) : (
                filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="ord-card"
                    onClick={() => setSelectedOrder(ord)}
                  >
                    <div className="ord-thumb">
                      {ord.fileUrl && isImageUrl(ord.fileUrl) ? (
                        <img
                          src={ord.fileUrl}
                          alt={ord.fileName || 'Sample desain'}
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomUrl(ord.fileUrl);
                          }}
                        />
                      ) : ord.fileName ? (
                        <span>{ord.fileName}</span>
                      ) : (
                        <span>Tanpa file</span>
                      )}
                    </div>

                    <div>
                      <div className="ord-meta-top">
                        <span className="ord-id">{ord.id}</span>
                        <span>
                          {new Date(ord.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="ord-cust">
                        {ord.customerName}
                        <a
                          className="ord-wa"
                          href={`https://wa.me/${ord.customerWhatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          WA: {ord.customerWhatsapp} ↗
                        </a>
                      </div>
                      <div className="ord-spec">
                        {ord.product}
                        {ord.technique && ord.technique !== '-' ? ` · ${ord.technique}` : ''}{' '}
                        · <strong>{ord.qty} pcs</strong>
                      </div>
                      {ord.sizes && Object.keys(ord.sizes).length > 0 && (
                        <div className="ord-sizes">
                          {Object.entries(ord.sizes).map(([sz, count]) => (
                            <span key={sz} className="ord-size-pill">
                              {sz}: <strong>{count}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                      {ord.notes && (
                        <div className="ord-notes">Catatan: {ord.notes}</div>
                      )}
                    </div>

                    <div
                      className="ord-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="ord-price">{ord.qty} pcs</div>
                      <select
                        className="ord-select"
                        value={ord.status}
                        onChange={(e) =>
                          updateStatus(ord.id, e.target.value as OrderStatus)
                        }
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            Status: {st}
                          </option>
                        ))}
                      </select>
                      <div className="ord-btn-row">
                        <button
                          type="button"
                          className="ord-dl"
                          onClick={() => setSelectedOrder(ord)}
                        >
                          Lihat Detail
                        </button>
                        <button
                          type="button"
                          className="ord-del"
                          onClick={() => deleteOrder(ord.id)}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <form className="cms-card" onSubmit={saveConfig}>
            <div className="cms-subtabs">
              {(
                [
                  ['bar1', 'Bar 1 · Header & Marquee'],
                  ['bar2', 'Bar 2 · Runway Looks'],
                  ['bar3', 'Bar 3 · Teknik Sablon'],
                  ['bar4', 'Bar 4 · Alur & Kalkulator'],
                  ['bar5', 'Bar 5 · Workshop'],
                  ['bar6', 'Bar 6 · FAQ, Studio & Footer'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`adm-tab${cmsSec === key ? ' on' : ''}`}
                  onClick={() => setCmsSec(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {cmsSec === 'bar1' && (
              <>
                <div className="cms-grid-3">
                  <div className="cms-field">
                    <label>Menu Kiri Atas</label>
                    <input
                      type="text"
                      value={config.navLeft}
                      onChange={(e) =>
                        setConfig({ ...config, navLeft: e.target.value })
                      }
                    />
                  </div>
                  <div className="cms-field">
                    <label>Nama Brand (Logo Tengah)</label>
                    <input
                      type="text"
                      value={config.brandName}
                      onChange={(e) =>
                        setConfig({ ...config, brandName: e.target.value })
                      }
                    />
                  </div>
                  <div className="cms-field">
                    <label>Menu Kanan Atas</label>
                    <input
                      type="text"
                      value={config.navRight}
                      onChange={(e) =>
                        setConfig({ ...config, navRight: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="cms-grid-2">
                  <div className="cms-field">
                    <label>Tombol Pill Bawah</label>
                    <input
                      type="text"
                      value={config.availText}
                      onChange={(e) =>
                        setConfig({ ...config, availText: e.target.value })
                      }
                    />
                  </div>
                  <div className="cms-field">
                    <label>Tombol Close Detail</label>
                    <input
                      type="text"
                      value={config.closeText}
                      onChange={(e) =>
                        setConfig({ ...config, closeText: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="cms-field">
                  <label>Teks Marquee Merah (3 Item)</label>
                  <div className="cms-grid-3">
                    {config.marqueeItems.map((item, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const next: [string, string, string] = [
                            ...config.marqueeItems,
                          ] as [string, string, string];
                          next[idx] = e.target.value;
                          setConfig({ ...config, marqueeItems: next });
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {cmsSec === 'bar2' &&
              config.looksMeta.map((lk, idx) => (
                <div key={idx} className="cms-box">
                  <div className="cms-box-title">
                    Look 0{idx + 1} — {lk.name}
                  </div>
                  <div className="cms-field">
                    <label>Nama Look (Timeline)</label>
                    <input
                      type="text"
                      value={lk.name}
                      onChange={(e) => {
                        const next = [...config.looksMeta];
                        next[idx] = { ...lk, name: e.target.value };
                        setConfig({ ...config, looksMeta: next });
                      }}
                    />
                  </div>
                  <div className="cms-grid-2">
                    <div className="cms-field">
                      <label>Pin 1 (Kaos)</label>
                      <input
                        type="text"
                        value={lk.piece1Name}
                        onChange={(e) => {
                          const next = [...config.looksMeta];
                          next[idx] = { ...lk, piece1Name: e.target.value };
                          setConfig({ ...config, looksMeta: next });
                        }}
                      />
                    </div>
                    <div className="cms-field">
                      <label>Harga Pin 1 ($)</label>
                      <input
                        type="number"
                        value={lk.piece1Price}
                        onChange={(e) => {
                          const next = [...config.looksMeta];
                          next[idx] = {
                            ...lk,
                            piece1Price: Number(e.target.value) || 0,
                          };
                          setConfig({ ...config, looksMeta: next });
                        }}
                      />
                    </div>
                  </div>
                  <div className="cms-grid-2">
                    <div className="cms-field">
                      <label>Pin 2 (Celana)</label>
                      <input
                        type="text"
                        value={lk.piece2Name}
                        onChange={(e) => {
                          const next = [...config.looksMeta];
                          next[idx] = { ...lk, piece2Name: e.target.value };
                          setConfig({ ...config, looksMeta: next });
                        }}
                      />
                    </div>
                    <div className="cms-field">
                      <label>Harga Pin 2 ($)</label>
                      <input
                        type="number"
                        value={lk.piece2Price}
                        onChange={(e) => {
                          const next = [...config.looksMeta];
                          next[idx] = {
                            ...lk,
                            piece2Price: Number(e.target.value) || 0,
                          };
                          setConfig({ ...config, looksMeta: next });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

            {cmsSec === 'bar3' && (
              <>
                <div className="cms-grid-2">
                  <div className="cms-field">
                    <label>Eyebrow</label>
                    <input
                      type="text"
                      value={config.techEyebrow}
                      onChange={(e) =>
                        setConfig({ ...config, techEyebrow: e.target.value })
                      }
                    />
                  </div>
                  <div className="cms-field">
                    <label>Judul Section</label>
                    <input
                      type="text"
                      value={config.techTitle}
                      onChange={(e) =>
                        setConfig({ ...config, techTitle: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="cms-field">
                  <label>Subjudul</label>
                  <textarea
                    rows={2}
                    value={config.techSubtitle}
                    onChange={(e) =>
                      setConfig({ ...config, techSubtitle: e.target.value })
                    }
                  />
                </div>
                {config.techniques.map((t, idx) => (
                  <div key={t.id} className="cms-box">
                    <div className="cms-box-title">
                      Teknik {t.code} — {t.name}
                    </div>
                    <div className="cms-grid-3">
                      <div className="cms-field">
                        <label>Nama Teknik</label>
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => {
                            const next = [...config.techniques];
                            next[idx] = { ...t, name: e.target.value };
                            setConfig({ ...config, techniques: next });
                          }}
                        />
                      </div>
                      <div className="cms-field">
                        <label>Badge</label>
                        <input
                          type="text"
                          value={t.badge}
                          onChange={(e) => {
                            const next = [...config.techniques];
                            next[idx] = { ...t, badge: e.target.value };
                            setConfig({ ...config, techniques: next });
                          }}
                        />
                      </div>
                      <div className="cms-field">
                        <label>Estimasi Produksi</label>
                        <input
                          type="text"
                          value={t.eta}
                          onChange={(e) => {
                            const next = [...config.techniques];
                            next[idx] = { ...t, eta: e.target.value };
                            setConfig({ ...config, techniques: next });
                          }}
                        />
                      </div>
                    </div>
                    <div className="cms-field">
                      <label>Deskripsi</label>
                      <textarea
                        rows={2}
                        value={t.desc}
                        onChange={(e) => {
                          const next = [...config.techniques];
                          next[idx] = { ...t, desc: e.target.value };
                          setConfig({ ...config, techniques: next });
                        }}
                      />
                    </div>
                    <div className="cms-grid-2">
                      <div className="cms-field">
                        <label>Min. Order</label>
                        <input
                          type="text"
                          value={t.minOrder}
                          onChange={(e) => {
                            const next = [...config.techniques];
                            next[idx] = { ...t, minOrder: e.target.value };
                            setConfig({ ...config, techniques: next });
                          }}
                        />
                      </div>
                      <div className="cms-field">
                        <label>Rekomendasi Bahan</label>
                        <input
                          type="text"
                          value={t.fabric}
                          onChange={(e) => {
                            const next = [...config.techniques];
                            next[idx] = { ...t, fabric: e.target.value };
                            setConfig({ ...config, techniques: next });
                          }}
                        />
                      </div>
                    </div>
                    <div className="cms-grid-2">
                      <div className="cms-field">
                        <label>Area Cetak Maks</label>
                        <input
                          type="text"
                          value={t.area}
                          onChange={(e) => {
                            const next = [...config.techniques];
                            next[idx] = { ...t, area: e.target.value };
                            setConfig({ ...config, techniques: next });
                          }}
                        />
                      </div>
                      <div className="cms-field">
                        <label>Standar Finishing</label>
                        <input
                          type="text"
                          value={t.finish}
                          onChange={(e) => {
                            const next = [...config.techniques];
                            next[idx] = { ...t, finish: e.target.value };
                            setConfig({ ...config, techniques: next });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {cmsSec === 'bar4' && (
              <>
                <div className="cms-grid-2">
                  <div className="cms-field">
                    <label>Eyebrow Alur</label>
                    <input
                      type="text"
                      value={config.orderEyebrow}
                      onChange={(e) =>
                        setConfig({ ...config, orderEyebrow: e.target.value })
                      }
                    />
                  </div>
                  <div className="cms-field">
                    <label>Judul Alur</label>
                    <input
                      type="text"
                      value={config.orderTitle}
                      onChange={(e) =>
                        setConfig({ ...config, orderTitle: e.target.value })
                      }
                    />
                  </div>
                </div>

                {config.steps.map((st, idx) => (
                  <div key={st.num} className="cms-box">
                    <div className="cms-box-title">Langkah {st.num}</div>
                    <div className="cms-field">
                      <label>Judul</label>
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          const next = [...config.steps];
                          next[idx] = { ...st, title: e.target.value };
                          setConfig({ ...config, steps: next });
                        }}
                      />
                    </div>
                    <div className="cms-field">
                      <label>Deskripsi</label>
                      <textarea
                        rows={2}
                        value={st.desc}
                        onChange={(e) => {
                          const next = [...config.steps];
                          next[idx] = { ...st, desc: e.target.value };
                          setConfig({ ...config, steps: next });
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div className="cms-box">
                  <div className="cms-box-title">Estimasi Produksi & Pilihan Order</div>
                  <div className="cms-grid-2">
                    <div className="cms-field">
                      <label>Judul Box Estimasi</label>
                      <input
                        type="text"
                        value={config.calcTitle}
                        onChange={(e) =>
                          setConfig({ ...config, calcTitle: e.target.value })
                        }
                      />
                    </div>
                    <div className="cms-field">
                      <label>Teks Tombol Order</label>
                      <input
                        type="text"
                        value={config.calcCtaText}
                        onChange={(e) =>
                          setConfig({ ...config, calcCtaText: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="cms-grid-3">
                    {config.products.map((p, idx) => (
                      <div key={p.id} className="cms-field">
                        <label>Artikel {idx + 1}</label>
                        <input
                          type="text"
                          value={p.label}
                          onChange={(e) => {
                            const next = [...config.products];
                            next[idx] = { ...p, label: e.target.value };
                            setConfig({ ...config, products: next });
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="cms-grid-2">
                    {config.printAddons.map((a, idx) => (
                      <div key={a.id} className="cms-field">
                        <label>Pilihan Teknik Sablon {idx + 1}</label>
                        <input
                          type="text"
                          value={a.label}
                          onChange={(e) => {
                            const next = [...config.printAddons];
                            next[idx] = { ...a, label: e.target.value };
                            setConfig({ ...config, printAddons: next });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {cmsSec === 'bar5' && (
              <>
                <div className="cms-grid-2">
                  <div className="cms-field">
                    <label>Eyebrow Workshop</label>
                    <input
                      type="text"
                      value={config.workshopEyebrow}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          workshopEyebrow: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="cms-field">
                    <label>Judul Workshop</label>
                    <input
                      type="text"
                      value={config.workshopTitle}
                      onChange={(e) =>
                        setConfig({ ...config, workshopTitle: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="cms-field">
                  <label>Deskripsi Workshop</label>
                  <textarea
                    rows={2}
                    value={config.workshopSubtitle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        workshopSubtitle: e.target.value,
                      })
                    }
                  />
                </div>
                {config.workshopCards.map((wc, idx) => (
                  <div key={idx} className="cms-box">
                    <div className="cms-box-title">Foto Workshop {idx + 1}</div>
                    <div className="cms-grid-2">
                      <div className="cms-field">
                        <label>Label Tag</label>
                        <input
                          type="text"
                          value={wc.tag}
                          onChange={(e) => {
                            const next = [...config.workshopCards];
                            next[idx] = { ...wc, tag: e.target.value };
                            setConfig({ ...config, workshopCards: next });
                          }}
                        />
                      </div>
                      <div className="cms-field">
                        <label>Judul Foto</label>
                        <input
                          type="text"
                          value={wc.title}
                          onChange={(e) => {
                            const next = [...config.workshopCards];
                            next[idx] = { ...wc, title: e.target.value };
                            setConfig({ ...config, workshopCards: next });
                          }}
                        />
                      </div>
                    </div>
                    <div className="cms-field">
                      <label>Deskripsi</label>
                      <textarea
                        rows={2}
                        value={wc.desc}
                        onChange={(e) => {
                          const next = [...config.workshopCards];
                          next[idx] = { ...wc, desc: e.target.value };
                          setConfig({ ...config, workshopCards: next });
                        }}
                      />
                    </div>
                  </div>
                ))}
                {config.workshopStats.map((ws, idx) => (
                  <div key={idx} className="cms-grid-2">
                    <div className="cms-field">
                      <label>Angka Statistik {idx + 1}</label>
                      <input
                        type="text"
                        value={ws.value}
                        onChange={(e) => {
                          const next = [...config.workshopStats];
                          next[idx] = { ...ws, value: e.target.value };
                          setConfig({ ...config, workshopStats: next });
                        }}
                      />
                    </div>
                    <div className="cms-field">
                      <label>Label Statistik {idx + 1}</label>
                      <input
                        type="text"
                        value={ws.label}
                        onChange={(e) => {
                          const next = [...config.workshopStats];
                          next[idx] = { ...ws, label: e.target.value };
                          setConfig({ ...config, workshopStats: next });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            {cmsSec === 'bar6' && (
              <>
                <div className="cms-grid-2">
                  <div className="cms-field">
                    <label>Eyebrow FAQ</label>
                    <input
                      type="text"
                      value={config.faqEyebrow}
                      onChange={(e) =>
                        setConfig({ ...config, faqEyebrow: e.target.value })
                      }
                    />
                  </div>
                  <div className="cms-field">
                    <label>Judul FAQ</label>
                    <input
                      type="text"
                      value={config.faqTitle}
                      onChange={(e) =>
                        setConfig({ ...config, faqTitle: e.target.value })
                      }
                    />
                  </div>
                </div>

                {config.faqs.map((fq, idx) => (
                  <div key={idx} className="cms-box">
                    <div className="cms-box-title">FAQ {idx + 1}</div>
                    <div className="cms-field">
                      <label>Pertanyaan</label>
                      <input
                        type="text"
                        value={fq.q}
                        onChange={(e) => {
                          const next = [...config.faqs];
                          next[idx] = { ...fq, q: e.target.value };
                          setConfig({ ...config, faqs: next });
                        }}
                      />
                    </div>
                    <div className="cms-field">
                      <label>Jawaban</label>
                      <textarea
                        rows={2}
                        value={fq.a}
                        onChange={(e) => {
                          const next = [...config.faqs];
                          next[idx] = { ...fq, a: e.target.value };
                          setConfig({ ...config, faqs: next });
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div className="cms-box">
                  <div className="cms-box-title">Kartu Studio &amp; Footer</div>
                  <div className="cms-grid-2">
                    <div className="cms-field">
                      <label>Eyebrow Studio</label>
                      <input
                        type="text"
                        value={config.studioEyebrow}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            studioEyebrow: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="cms-field">
                      <label>Judul Studio</label>
                      <input
                        type="text"
                        value={config.studioHeading}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            studioHeading: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="cms-grid-2">
                    <div className="cms-field">
                      <label>Alamat Workshop</label>
                      <input
                        type="text"
                        value={config.address}
                        onChange={(e) =>
                          setConfig({ ...config, address: e.target.value })
                        }
                      />
                    </div>
                    <div className="cms-field">
                      <label>Jam Operasional</label>
                      <input
                        type="text"
                        value={config.hours}
                        onChange={(e) =>
                          setConfig({ ...config, hours: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="cms-grid-2">
                    <div className="cms-field">
                      <label>WhatsApp Studio</label>
                      <input
                        type="text"
                        value={config.whatsapp}
                        onChange={(e) =>
                          setConfig({ ...config, whatsapp: e.target.value })
                        }
                      />
                    </div>
                    <div className="cms-field">
                      <label>Email Studio</label>
                      <input
                        type="email"
                        value={config.email}
                        onChange={(e) =>
                          setConfig({ ...config, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="cms-grid-3">
                    <div className="cms-field">
                      <label>Tombol Chat Studio</label>
                      <input
                        type="text"
                        value={config.studioCtaText}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            studioCtaText: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="cms-field">
                      <label>Footer Tagline</label>
                      <input
                        type="text"
                        value={config.footerTagline}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            footerTagline: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="cms-field">
                      <label>Footer Lokasi / Tahun</label>
                      <input
                        type="text"
                        value={config.footerLocation}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            footerLocation: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="cms-save" disabled={savingCms}>
              {savingCms ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
            </button>
            {savedMsg && <div className="cms-saved">{savedMsg}</div>}
          </form>
        )}
      </main>

      {selectedOrder && (
        <div
          className="det-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
        >
          <div className="det-modal">
            <div className="det-head">
              <div>
                <h2>Detail Pesanan — {selectedOrder.id}</h2>
                <p>
                  Diterima pada{' '}
                  {new Date(selectedOrder.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                type="button"
                className="det-x"
                aria-label="Tutup"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="det-grid">
              <div className="det-box">
                <span>Nama / Brand Customer</span>
                <strong>{selectedOrder.customerName}</strong>
              </div>
              <div className="det-box">
                <span>Nomor WhatsApp</span>
                <strong>
                  <a
                    href={`https://wa.me/${selectedOrder.customerWhatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#3d64ff', textDecoration: 'none' }}
                  >
                    {selectedOrder.customerWhatsapp} ↗
                  </a>
                </strong>
              </div>
              <div className="det-box">
                <span>Artikel / Pilihan Order</span>
                <strong>
                  {selectedOrder.product}
                  {selectedOrder.technique && selectedOrder.technique !== '-'
                    ? ` · ${selectedOrder.technique}`
                    : ''}
                </strong>
              </div>
              <div className="det-box">
                <span>Total Order</span>
                <strong>{selectedOrder.qty} pcs</strong>
              </div>
            </div>

            <div className="det-box">
              <span>Rincian Jumlah per Ukuran (Dewasa &amp; Anak)</span>
              <div className="det-sizes-grid">
                {['S', 'M', 'L', 'XL', 'XXL', 'Anak S', 'Anak M', 'Anak L', 'Anak XL'].map(
                  (sz) => (
                    <div key={sz} className="det-size-cell">
                      <span>{sz}</span>
                      <strong>{selectedOrder.sizes?.[sz] ?? 0}</strong>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="det-box">
              <span>Catatan Posisi &amp; Ukuran Cetak</span>
              <strong>{selectedOrder.notes || '— Tidak ada catatan —'}</strong>
            </div>

            <div className="det-sample">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8a8e96' }}>
                  Sample Gambar / File Sablonan
                </span>
                {selectedOrder.fileName && (
                  <span style={{ fontSize: 12, color: '#cbd5e1' }}>
                    {selectedOrder.fileName}
                  </span>
                )}
              </div>

              {selectedOrder.fileUrl && isImageUrl(selectedOrder.fileUrl) ? (
                <img
                  src={selectedOrder.fileUrl}
                  alt={selectedOrder.fileName || 'Sample desain'}
                  onClick={() => setZoomUrl(selectedOrder.fileUrl)}
                />
              ) : selectedOrder.fileUrl ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#cbd5e1', fontSize: 13 }}>
                  File terlampir: <strong>{selectedOrder.fileName}</strong>
                </div>
              ) : (
                <div style={{ padding: 20, textAlign: 'center', color: '#8a8e96', fontSize: 13 }}>
                  Customer tidak melampirkan file sample.
                </div>
              )}
            </div>

            <div className="det-foot">
              <select
                className="ord-select"
                value={selectedOrder.status}
                onChange={(e) =>
                  updateStatus(selectedOrder.id, e.target.value as OrderStatus)
                }
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    Status: {st}
                  </option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: 10 }}>
                {selectedOrder.fileUrl && (
                  <a
                    href={selectedOrder.fileUrl}
                    download={selectedOrder.fileName || true}
                    className="ord-dl"
                    style={{ padding: '0 16px' }}
                  >
                    Unduh File Sample
                  </a>
                )}
                <button
                  type="button"
                  className="ord-del"
                  style={{ padding: '0 16px' }}
                  onClick={() => deleteOrder(selectedOrder.id)}
                >
                  Hapus Pesanan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {zoomUrl && (
        <div className="zoom-bg" onClick={() => setZoomUrl(null)}>
          <img src={zoomUrl} alt="Zoom sample" />
        </div>
      )}
    </div>
  );
}
