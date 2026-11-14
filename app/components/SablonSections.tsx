'use client';

import { useState, type FormEvent } from 'react';
import type { SiteConfig } from '@/lib/store';
import './sablon.css';

const TECHNIQUES = [
  {
    id: 'plastisol',
    code: '01',
    badge: 'Best Seller',
    name: 'Plastisol Ink',
    desc: 'Tinta berbasis PVC dengan warna pekat, detail halftone presisi, dan daya tahan cuci tinggi di atas kain gelap.',
    minOrder: 'Min. 12 pcs',
    priceFrom: 'Rp 85.000',
    fabric: 'Heavyweight Cotton 20s / 24s',
    area: 'A3+ (32 × 45 cm)',
    eta: '5–7 Hari Kerja',
    finish: 'Curing 170°C + Matte Press',
  },
  {
    id: 'discharge',
    code: '02',
    badge: 'Soft Touch',
    name: 'Discharge & Waterbased',
    desc: 'Tinta meresap langsung ke serat kain tanpa lapisan tebal, menghasilkan tekstur lembut dan tampilan vintage natural.',
    minOrder: 'Min. 24 pcs',
    priceFrom: 'Rp 95.000',
    fabric: 'Combed 24s Reaktif',
    area: 'A3+ (32 × 45 cm)',
    eta: '6–8 Hari Kerja',
    finish: 'Steam Fixation + Soft Wash',
  },
  {
    id: 'puff',
    code: '03',
    badge: '3D Raised',
    name: 'High-Density / Puff',
    desc: 'Efek timbul 3D dengan tepi tajam untuk tipografi streetwear, logo statement, dan detail grafis bertekstur.',
    minOrder: 'Min. 24 pcs',
    priceFrom: 'Rp 110.000',
    fabric: 'Heavyweight 20s / Fleece 330gsm',
    area: 'A3 (30 × 42 cm)',
    eta: '7–9 Hari Kerja',
    finish: 'Multi-layer Build + Heat Cure',
  },
  {
    id: 'dtf',
    code: '04',
    badge: 'No Min.',
    name: 'DTF & Custom Label',
    desc: 'Cetak full-color tanpa batas warna untuk order satuan maupun produksi lengkap dengan woven label & neck print.',
    minOrder: 'Min. 1 pcs',
    priceFrom: 'Rp 75.000',
    fabric: 'Semua Jenis Kain Katun & Fleece',
    area: 'A3+ (32 × 45 cm)',
    eta: '2–4 Hari Kerja',
    finish: 'Double Press + Peel QC',
  },
] as const;

const PRODUCTS = [
  { id: 'tee20', label: 'Heavy Tee 20s', base: 65000 },
  { id: 'ls24', label: 'Longsleeve 24s', base: 85000 },
  { id: 'hoodie', label: 'Boxy Hoodie 330gsm', base: 185000 },
] as const;

const PRINT_ADDONS = [
  { id: 'plastisol', label: 'Plastisol', add: 20000 },
  { id: 'discharge', label: 'Discharge', add: 30000 },
  { id: 'puff', label: 'Puff 3D', add: 45000 },
  { id: 'dtf', label: 'DTF Full Color', add: 15000 },
] as const;

const QTYS = [12, 24, 50, 100] as const;

const STEPS = [
  {
    num: '01',
    title: 'Kirim Desain & Briefing',
    desc: 'Kirim file vector (AI/PDF/CDR) atau PNG resolusi tinggi 300 DPI beserta posisi cetak dan ukuran sablon.',
  },
  {
    num: '02',
    title: 'Pilih Bahan & Teknik Tinta',
    desc: 'Konsultasikan gramasi kain (20s, 24s, atau Fleece 330gsm) dan jenis tinta yang paling pas untuk karakter desain.',
  },
  {
    num: '03',
    title: 'Approval Mockup & Proofing',
    desc: 'Kami siapkan digital mockup skala presisi dan color-check sebelum masuk ke meja sablon.',
  },
  {
    num: '04',
    title: 'Produksi, QC & Pengiriman',
    desc: 'Setiap pcs melalui proses curing suhu standar industri, inspeksi jahitan/cetakan, dan packing siap kirim.',
  },
];

const FAQS = [
  {
    q: 'Minimum order sablon berapa pcs?',
    a: 'Untuk sablon manual (Plastisol) minimum 12 pcs per desain. Discharge & Puff 3D minimum 24 pcs. Untuk satuan atau sample tanpa minimum bisa menggunakan DTF Full Color.',
  },
  {
    q: 'Format file desain apa yang harus dikirim?',
    a: 'Disarankan file vector (.AI, .PDF, .CDR, atau .EPS) dengan font sudah di-convert to curves. Jika hanya ada PNG/PSD, pastikan resolusi minimal 300 DPI sesuai ukuran cetak.',
  },
  {
    q: 'Apakah bisa makloon (bawa kaos/bahan sendiri)?',
    a: 'Bisa. Kami menerima jasa sablon makloon untuk brand yang sudah memiliki bahan atau jahitan sendiri, dengan toleransi test print 1 pcs sebelum produksi massal.',
  },
  {
    q: 'Berapa lama waktu pengerjaan produksi?',
    a: 'Estimasi normal 5–7 hari kerja setelah approval mockup dan DP masuk. Untuk kebutuhan event mendesak tersedia layanan express 2–3 hari kerja.',
  },
  {
    q: 'Apakah ada garansi hasil cetak?',
    a: 'Setiap batch melewati proses curing 170°C dan QC manual. Jika ada cacat cetak, sablon luntur, atau salah ukuran di luar toleransi, kami ganti baru 100%.',
  },
];

const ADULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;
const KID_SIZES = ['Anak S', 'Anak M', 'Anak L', 'Anak XL'] as const;

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.52 2 2.04 6.48 2.04 12c0 1.94.55 3.83 1.6 5.45L2 22l4.68-1.59A9.93 9.93 0 0 0 12.04 22c5.52 0 10-4.48 10-10S17.56 2 12.04 2Zm5.83 14.12c-.25.7-1.44 1.34-2 1.42-.52.08-1.18.11-1.91-.12-.44-.14-1-.33-1.72-.64-3.02-1.3-4.99-4.34-5.14-4.54-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.28-.3.6-.38.8-.38.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.08.15.13.33.03.53-.1.2-.15.33-.3.5-.15.18-.32.4-.45.54-.15.15-.31.32-.13.62.18.3.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.48 1.53.3.15.48.13.66-.08.18-.2.76-.88.96-1.18.2-.3.4-.25.68-.15.28.1 1.77.84 2.07.99.3.15.5.23.58.35.08.13.08.73-.17 1.43Z" />
    </svg>
  );
}

export default function SablonSections({ config }: { config?: SiteConfig }) {
  const techniques = config?.techniques?.length ? config.techniques : TECHNIQUES;
  const products = config?.products?.length ? config.products : PRODUCTS;
  const printAddons = config?.printAddons?.length ? config.printAddons : PRINT_ADDONS;
  const steps = config?.steps?.length ? config.steps : STEPS;
  const faqs = config?.faqs?.length ? config.faqs : FAQS;

  const [techIdx, setTechIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<{
    group: 'product' | 'addon';
    id: string;
  }>({ group: 'product', id: products[0].id });
  const [qty, setQty] = useState<number>(24);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Customer order modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [sizes, setSizes] = useState<Record<string, number>>({
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
    'Anak S': 0,
    'Anak M': 0,
    'Anak L': 0,
    'Anak XL': 0,
  });
  const [manualQty, setManualQty] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [lastOrderWaUrl, setLastOrderWaUrl] = useState('');

  const activeTech = techniques[techIdx] ?? techniques[0];
  const selectedItem =
    selectedChoice.group === 'product'
      ? (products.find((p) => p.id === selectedChoice.id) ?? products[0])
      : (printAddons.find((a) => a.id === selectedChoice.id) ?? printAddons[0]);
  const totalSizeQty = Object.values(sizes).reduce((a, b) => a + (b || 0), 0);
  const effectiveQty = totalSizeQty > 0 ? totalSizeQty : manualQty;

  const updateSize = (sz: string, val: number) => {
    const nextSizes = { ...sizes, [sz]: Math.max(0, val) };
    setSizes(nextSizes);
    const sum = Object.values(nextSizes).reduce((a, b) => a + (b || 0), 0);
    setManualQty(sum);
  };

  const brandName = config?.brandName || 'BANG SABLON';
  const techEyebrow = config?.techEyebrow || '03 / Teknik & Spesifikasi';
  const techTitle = config?.techTitle || 'Presisi di setiap lapisan tinta.';
  const techSubtitle =
    config?.techSubtitle ||
    'Dari sablon manual plastisol hingga puff 3D dan discharge — seluruh proses dikerjakan in-house untuk standar brand streetwear.';
  const orderEyebrow = config?.orderEyebrow || '04 / Alur Produksi';
  const orderTitle = config?.orderTitle || 'Dari file desain ke rak koleksi.';
  const calcTitle = config?.calcTitle || 'Estimasi Produksi';
  const calcCtaText = config?.calcCtaText || 'Kirim Sample Desain & Pesan';
  const workshopEyebrow = config?.workshopEyebrow || '05 / Di Meja Sablon';
  const workshopTitle =
    config?.workshopTitle || 'Dari screen ke kain, tanpa kompromi.';
  const workshopSubtitle =
    config?.workshopSubtitle ||
    'Dokumentasi langsung dari workshop kami — mulai dari tarikan rakel, curing suhu tinggi, hingga inspeksi detail tinta timbul.';
  const workshopCards = config?.workshopCards?.length === 3
    ? config.workshopCards
    : [
        { tag: '01 — Manual Screen Pull', title: 'Tarikan Rakel Presisi', desc: 'Tekanan merata di atas meja vakum untuk memastikan tinta plastisol menutup serat kain hitam dengan pekat.' },
        { tag: '02 — Tunnel Curing', title: 'Pematangan Suhu 170°C', desc: 'Mengunci elastisitas tinta agar hasil sablon tahan cuci dan tidak mudah retak.' },
        { tag: '03 — Detail & QC', title: 'Puff 3D & Inspeksi Akhir', desc: 'Pengecekan ketebalan tinta, kerapatan register warna, dan finishing sebelum dikemas.' },
      ];
  const workshopStats = config?.workshopStats?.length === 3
    ? config.workshopStats
    : [
        { value: '1.200+', label: 'Pcs / Bulan Kapasitas' },
        { value: '170°C', label: 'Standar Curing Tinta' },
        { value: '100%', label: 'Garansi Lolos QC' },
      ];
  const faqEyebrow = config?.faqEyebrow || '06 / Tanya Jawab & Studio';
  const faqTitle = config?.faqTitle || 'Pertanyaan seputar produksi.';
  const studioEyebrow = config?.studioEyebrow || `Workshop ${brandName}`;
  const studioHeading = config?.studioHeading || 'Kunjungi studio atau konsultasi desain langsung.';
  const address = config?.address || 'Jl. Kemang Timur No. 42, Jakarta Selatan';
  const hours = config?.hours || 'Senin – Sabtu, 09.00 – 18.00 WIB';
  const whatsapp = config?.whatsapp || '+62 853-8647-6716';
  const email = config?.email || 'studio@bangsablon.id';
  const studioCtaText = config?.studioCtaText || 'Chat Workshop Sekarang';
  const footerTagline = config?.footerTagline || 'Custom Screen Printing & Apparel Workshop';
  const footerLocation = config?.footerLocation || 'Jakarta · Indonesia · © 2026';
  const rawDigits = whatsapp.replace(/\D/g, '') || '6285386476716';
  const waDigits = rawDigits.startsWith('0') ? '62' + rawDigits.slice(1) : rawDigits;
  const generalWaUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(
    `Halo ${brandName}, saya mau konsultasi & pesan sablon custom.`
  )}`;

  const handleFileChange = (file: File | null) => {
    setSampleFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file && file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleOrderSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!customerName.trim() || !customerWhatsapp.trim()) {
      setErrorMsg('Nama dan nomor WhatsApp wajib diisi.');
      return;
    }
    if (effectiveQty <= 0) {
      setErrorMsg('Isi Total pcs atau jumlah ukuran (Dewasa / Anak).');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('customerName', customerName.trim());
      fd.append('customerWhatsapp', customerWhatsapp.trim());
      fd.append('product', selectedItem.label);
      fd.append('technique', '-');
      fd.append('qty', String(effectiveQty));
      fd.append('sizes', JSON.stringify(sizes));
      fd.append('notes', notes.trim());
      if (sampleFile) fd.append('file', sampleFile);

      const res = await fetch('/api/orders', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal mengirim pesanan.');
      } else {
        const sizeDetails = Object.entries(sizes)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        const waMsg = [
          `Halo ${brandName}, saya baru saja kirim pesanan:`,
          `• ID Pesanan: ${data.id}`,
          `• Nama / Brand: ${customerName.trim()}`,
          `• Pilihan: ${selectedItem.label}`,
          `• Total: ${effectiveQty} pcs${sizeDetails ? ` (${sizeDetails})` : ''}`,
          notes.trim() ? `• Catatan: ${notes.trim()}` : '',
        ]
          .filter(Boolean)
          .join('\n');
        const waUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(waMsg)}`;
        setLastOrderWaUrl(waUrl);
        setCreatedId(data.id);
        setCustomerName('');
        setCustomerWhatsapp('');
        setNotes('');
        setManualQty(0);
        setSizes({
          S: 0,
          M: 0,
          L: 0,
          XL: 0,
          XXL: 0,
          'Anak S': 0,
          'Anak M': 0,
          'Anak L': 0,
          'Anak XL': 0,
        });
        handleFileChange(null);
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sablon-wrap">
      {/* Bar 3: Teknik Sablon & Spesifikasi */}
      <section id="teknik" className="sablon-sec">
        <div className="s-eyebrow">{techEyebrow}</div>
        <div className="s-head-row">
          <h2 className="s-title">{techTitle}</h2>
          <p className="s-sub">{techSubtitle}</p>
        </div>

        <div className="tech-grid">
          {techniques.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className={`tech-card${i === techIdx ? ' active' : ''}`}
              onClick={() => setTechIdx(i)}
            >
              <div className="tech-top">
                <span>{t.code}</span>
                <span className="tech-badge">{t.badge}</span>
              </div>
              <div className="tech-name">{t.name}</div>
              <p className="tech-desc">{t.desc}</p>
              <div className="tech-price">
                <span>{t.minOrder}</span>
                <strong>{t.eta}</strong>
              </div>
            </button>
          ))}
        </div>

        <div className="spec-bar">
          <div className="spec-item">
            <span>Rekomendasi Bahan</span>
            <strong>{activeTech.fabric}</strong>
          </div>
          <div className="spec-item">
            <span>Area Cetak Maks</span>
            <strong>{activeTech.area}</strong>
          </div>
          <div className="spec-item">
            <span>Estimasi Produksi</span>
            <strong>{activeTech.eta}</strong>
          </div>
          <div className="spec-item">
            <span>Standar Finishing</span>
            <strong>{activeTech.finish}</strong>
          </div>
        </div>
      </section>

      {/* Bar 4: Cara Order & Kalkulator Estimasi */}
      <section id="order" className="sablon-sec">
        <div className="order-grid">
          <div>
            <div className="s-eyebrow">{orderEyebrow}</div>
            <h2 className="s-title" style={{ marginTop: 14 }}>
              {orderTitle}
            </h2>

            <div className="steps-list">
              {steps.map((st) => (
                <div key={st.num} className="step-row">
                  <div className="step-num">{st.num}</div>
                  <div className="step-body">
                    <h3>{st.title}</h3>
                    <p>{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="calc-card">
            <div className="calc-head">
              <h3>{calcTitle}</h3>
              <span>Instan</span>
            </div>

            <div className="calc-group">
              <label>Pilih Artikel</label>
              <div className="chip-row">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`chip${selectedChoice.group === 'product' && selectedChoice.id === p.id ? ' on' : ''}`}
                    onClick={() =>
                      setSelectedChoice({ group: 'product', id: p.id })
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="calc-group">
              <label>Pilihan Lainnya</label>
              <div className="chip-row">
                {printAddons.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`chip${selectedChoice.group === 'addon' && selectedChoice.id === a.id ? ' on' : ''}`}
                    onClick={() =>
                      setSelectedChoice({ group: 'addon', id: a.id })
                    }
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="calc-total">
              <div>
                <small>Pilihan Dipilih</small>
                <strong style={{ fontSize: 20 }}>{selectedItem.label}</strong>
              </div>
              <div className="calc-per">
                <span>Status</span>
                <b>Siap Produksi</b>
              </div>
            </div>

            <button
              type="button"
              className="calc-cta"
              onClick={() => {
                setCreatedId(null);
                setErrorMsg('');
                setModalOpen(true);
              }}
            >
              <span>{calcCtaText}</span>
              <svg
                width="18"
                height="12"
                viewBox="0 0 18 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M1 6h15M11 1l5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Bar 5: Live Workshop & Proses Menyablon */}
      <section id="workshop" className="sablon-sec">
        <div className="s-eyebrow">{workshopEyebrow}</div>
        <div className="s-head-row">
          <h2 className="s-title">{workshopTitle}</h2>
          <p className="s-sub">{workshopSubtitle}</p>
        </div>

        <div className="ws-grid">
          <div className="ws-card tall">
            <img
              src="/images/workshop-pull.jpg"
              alt="Proses menarik rakel sablon manual di atas kaos hitam"
            />
            <div className="ws-cap">
              <span>{workshopCards[0].tag}</span>
              <strong>{workshopCards[0].title}</strong>
              <p>{workshopCards[0].desc}</p>
            </div>
          </div>

          <div className="ws-right">
            <div className="ws-card">
              <img
                src="/images/workshop-curing.jpg"
                alt="Proses curing kaos hasil sablon di rak pemanas"
              />
              <div className="ws-cap">
                <span>{workshopCards[1].tag}</span>
                <strong>{workshopCards[1].title}</strong>
                <p>{workshopCards[1].desc}</p>
              </div>
            </div>

            <div className="ws-card">
              <img
                src="/images/workshop-detail.jpg"
                alt="Inspeksi detail hasil sablon puff 3D pada kaos katun"
              />
              <div className="ws-cap">
                <span>{workshopCards[2].tag}</span>
                <strong>{workshopCards[2].title}</strong>
                <p>{workshopCards[2].desc}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ws-stats">
          {workshopStats.map((ws) => (
            <div key={ws.label} className="ws-stat">
              <strong>{ws.value}</strong>
              <span>{ws.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bar 6: FAQ & Kontak Studio */}
      <section id="contact-studio" className="sablon-sec">
        <div className="faq-grid">
          <div>
            <div className="s-eyebrow">{faqEyebrow}</div>
            <h2 className="s-title" style={{ marginTop: 14 }}>
              {faqTitle}
            </h2>

            <div className="faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={item.q}
                    className={`faq-item${isOpen ? ' open' : ''}`}
                  >
                    <button
                      type="button"
                      className="faq-q"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                    >
                      <span>{item.q}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      >
                        <path d="M8 2v12M2 8h12" />
                      </svg>
                    </button>
                    {isOpen && <div className="faq-a">{item.a}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="studio-card">
            <div className="s-eyebrow">{studioEyebrow}</div>
            <h3>{studioHeading}</h3>

            <div className="studio-rows">
              <div className="studio-row">
                <span>Alamat Workshop</span>
                <strong>{address}</strong>
              </div>
              <div className="studio-row">
                <span>Jam Operasional</span>
                <strong>{hours}</strong>
              </div>
              <div className="studio-row">
                <span>Email</span>
                <strong>{email}</strong>
              </div>
            </div>

            <a
              href={generalWaUrl}
              target="_blank"
              rel="noreferrer"
              className="studio-cta"
            >
              <WhatsAppIcon size={18} />
              <span>{studioCtaText}</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="sablon-footer">
        <div>
          <strong>{brandName}</strong> — {footerTagline}
        </div>
        <div>{footerLocation}</div>
      </footer>

      {modalOpen && (
        <div
          className="ord-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <form className="ord-modal" onSubmit={handleOrderSubmit}>
            <div className="ord-head">
              <div>
                <h3>Kirim Sample &amp; Pesan Sablon</h3>
                <p>Desain dan detail pesanan akan langsung masuk ke dasbor studio.</p>
              </div>
              <button
                type="button"
                className="ord-x"
                aria-label="Tutup"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="ord-summary">
              <div>
                <span>{selectedItem.label}</span>
              </div>
              <div className="ord-total-wrap">
                <span>Total:</span>
                <input
                  type="number"
                  min={0}
                  className="ord-total-input"
                  value={effectiveQty || ''}
                  placeholder="0"
                  aria-label="Total pcs"
                  onChange={(e) =>
                    setManualQty(Math.max(0, Number(e.target.value) || 0))
                  }
                />
                <span>pcs</span>
              </div>
            </div>

            {createdId ? (
              <div className="ord-done">
                <strong>Pesanan Diterima — {createdId}</strong>
                <p>
                  Sample desain dan detail pesanan Anda sudah masuk ke dasbor{' '}
                  {brandName}. Klik tombol di bawah untuk langsung lanjut ke WhatsApp.
                </p>
                {lastOrderWaUrl && (
                  <a
                    href={lastOrderWaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="wa-btn"
                  >
                    <WhatsAppIcon size={18} />
                    <span>Lanjut ke WhatsApp</span>
                  </a>
                )}
                <button
                  type="button"
                  className="calc-cta"
                  style={{ marginTop: 10 }}
                  onClick={() => setModalOpen(false)}
                >
                  Selesai
                </button>
              </div>
            ) : (
              <>
                <div className="ord-field">
                  <label htmlFor="ord-name">Nama / Brand</label>
                  <input
                    id="ord-name"
                    type="text"
                    placeholder="Contoh: Hengki / Streetwear Studio"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="ord-field">
                  <label htmlFor="ord-wa">Nomor WhatsApp</label>
                  <input
                    id="ord-wa"
                    type="tel"
                    placeholder="Contoh: 081290002626"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    required
                  />
                </div>

                <div className="ord-field">
                  <label>Jumlah per Ukuran (Dewasa &amp; Anak)</label>
                  <div className="size-sec">
                    <div className="size-cat">Ukuran Dewasa</div>
                    <div className="size-grid">
                      {ADULT_SIZES.map((sz) => (
                        <div key={sz} className="size-box">
                          <span>{sz}</span>
                          <input
                            type="number"
                            min={0}
                            value={sizes[sz] || ''}
                            placeholder="0"
                            onChange={(e) =>
                              updateSize(sz, Number(e.target.value) || 0)
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="size-cat" style={{ marginTop: 4 }}>
                      Ukuran Anak
                    </div>
                    <div className="size-grid">
                      {KID_SIZES.map((sz) => (
                        <div key={sz} className="size-box">
                          <span>{sz.replace('Anak ', '')}</span>
                          <input
                            type="number"
                            min={0}
                            value={sizes[sz] || ''}
                            placeholder="0"
                            onChange={(e) =>
                              updateSize(sz, Number(e.target.value) || 0)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ord-field">
                  <label>Upload Sample Gambar / File Sablonan</label>
                  <label className="ord-drop">
                    <input
                      type="file"
                      accept="image/*,.pdf,.ai,.cdr,.eps,.svg"
                      onChange={(e) =>
                        handleFileChange(e.target.files?.[0] ?? null)
                      }
                    />
                    {sampleFile ? (
                      <div className="ord-preview">
                        {previewUrl && <img src={previewUrl} alt="Preview" />}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>
                            {sampleFile.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#8a8e96', marginTop: 2 }}>
                            {(sampleFile.size / 1024).toFixed(1)} KB — Klik untuk ganti file
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: '#8a8e96' }}>
                        Klik untuk pilih gambar mockup / file sablon (.PNG, .JPG, .PDF, .AI, .SVG)
                      </div>
                    )}
                  </label>
                </div>

                <div className="ord-field">
                  <label htmlFor="ord-notes">Catatan Posisi &amp; Ukuran Cetak</label>
                  <textarea
                    id="ord-notes"
                    rows={2}
                    placeholder="Contoh: Sablon depan A3, belakang logo kecil di tengkuk..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {errorMsg && <div className="ord-err">{errorMsg}</div>}

                <button type="submit" className="calc-cta" disabled={submitting}>
                  {submitting ? 'Mengirim ke Studio...' : 'Kirim Pesanan & Sample'}
                </button>
              </>
            )}
          </form>
        </div>
      )}
      <a
        href={generalWaUrl}
        target="_blank"
        rel="noreferrer"
        className="wa-fab"
        aria-label="Chat WhatsApp"
      >
        <WhatsAppIcon size={26} />
      </a>
    </div>
  );
}

