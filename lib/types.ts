export type OrderStatus = 'Baru' | 'Mockup' | 'Produksi' | 'Selesai';

export interface OrderItem {
  id: string;
  createdAt: string;
  customerName: string;
  customerWhatsapp: string;
  product: string;
  technique: string;
  qty: number;
  sizes?: Record<string, number>;
  notes: string;
  fileName: string | null;
  fileUrl: string | null;
  status: OrderStatus;
}

export interface TechniqueConfig {
  id: string;
  code: string;
  badge: string;
  name: string;
  desc: string;
  minOrder: string;
  priceFrom: string;
  fabric: string;
  area: string;
  eta: string;
  finish: string;
}

export interface StepConfig {
  num: string;
  title: string;
  desc: string;
}

export interface ProductOption {
  id: string;
  label: string;
  base: number;
}

export interface AddonOption {
  id: string;
  label: string;
  add: number;
}

export interface WorkshopCardConfig {
  tag: string;
  title: string;
  desc: string;
}

export interface StatConfig {
  value: string;
  label: string;
}

export interface FaqConfig {
  q: string;
  a: string;
}

export interface LookTextConfig {
  name: string;
  piece1Name: string;
  piece1Price: number;
  piece2Name: string;
  piece2Price: number;
}

export interface SiteConfig {
  navLeft: string;
  brandName: string;
  navRight: string;
  availText: string;
  closeText: string;
  marqueeItems: [string, string, string];
  looksMeta: LookTextConfig[];
  techEyebrow: string;
  techTitle: string;
  techSubtitle: string;
  techniques: TechniqueConfig[];
  orderEyebrow: string;
  orderTitle: string;
  steps: StepConfig[];
  calcTitle: string;
  calcCtaText: string;
  products: ProductOption[];
  printAddons: AddonOption[];
  workshopEyebrow: string;
  workshopTitle: string;
  workshopSubtitle: string;
  workshopCards: WorkshopCardConfig[];
  workshopStats: StatConfig[];
  faqEyebrow: string;
  faqTitle: string;
  faqs: FaqConfig[];
  studioEyebrow: string;
  studioHeading: string;
  address: string;
  hours: string;
  whatsapp: string;
  email: string;
  studioCtaText: string;
  footerTagline: string;
  footerLocation: string;
}

export interface StoreData {
  siteConfig: SiteConfig;
  orders: OrderItem[];
}

export const DEFAULT_CONFIG: SiteConfig = {
  navLeft: 'About',
  brandName: 'BANG SABLON',
  navRight: 'Contact',
  availText: 'See availability',
  closeText: 'Close',
  marqueeItems: ['OFFCUT', 'LIMITED RUN', 'NO RESTOCKS'],

  looksMeta: [
    { name: 'Cobalt Skull Tee', piece1Name: 'Cobalt Skull Plastisol Tee', piece1Price: 425, piece2Name: 'Wide Cargo Pant', piece2Price: 165 },
    { name: 'Silver Type Tee', piece1Name: 'Metallic Silver Screen Tee', piece1Price: 650, piece2Name: 'Straight Tech Trouser', piece2Price: 180 },
    { name: 'Gothic Print Tee', piece1Name: 'Gothic Red & White Tee', piece1Price: 390, piece2Name: 'Wide Cargo Pant', piece2Price: 165 },
    { name: 'Barbed Heart Tee', piece1Name: 'Barbed Heart Discharge Tee', piece1Price: 720, piece2Name: 'Wide Pleated Trouser', piece2Price: 180 },
    { name: 'Puff Emblem Tee', piece1Name: '3D Puff Emblem Heavy Tee', piece1Price: 310, piece2Name: 'Graphite Cargo Pant', piece2Price: 175 },
    { name: 'Rose & Chain Tee', piece1Name: 'Rose & Chain Plastisol Tee', piece1Price: 210, piece2Name: 'Pleated Wide Trouser', piece2Price: 195 },
  ],

  techEyebrow: '03 / Teknik & Spesifikasi',
  techTitle: 'Presisi di setiap lapisan tinta.',
  techSubtitle:
    'Dari sablon manual plastisol hingga puff 3D dan discharge — seluruh proses dikerjakan in-house untuk standar brand streetwear.',
  techniques: [
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
  ],

  orderEyebrow: '04 / Alur Produksi',
  orderTitle: 'Dari file desain ke rak koleksi.',
  steps: [
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
  ],
  calcTitle: 'Estimasi Produksi',
  calcCtaText: 'Kirim Sample Desain & Pesan',
  products: [
    { id: 'tee20', label: 'Heavy Tee 20s', base: 65000 },
    { id: 'ls24', label: 'Longsleeve 24s', base: 85000 },
    { id: 'hoodie', label: 'Boxy Hoodie 330gsm', base: 185000 },
  ],
  printAddons: [
    { id: 'plastisol', label: 'Plastisol', add: 20000 },
    { id: 'discharge', label: 'Discharge', add: 30000 },
    { id: 'puff', label: 'Puff 3D', add: 45000 },
    { id: 'dtf', label: 'DTF Full Color', add: 15000 },
  ],

  workshopEyebrow: '05 / Di Meja Sablon',
  workshopTitle: 'Dari screen ke kain, tanpa kompromi.',
  workshopSubtitle:
    'Dokumentasi langsung dari workshop kami — mulai dari tarikan rakel, curing suhu tinggi, hingga inspeksi detail tinta timbul.',
  workshopCards: [
    {
      tag: '01 — Manual Screen Pull',
      title: 'Tarikan Rakel Presisi',
      desc: 'Tekanan merata di atas meja vakum untuk memastikan tinta plastisol menutup serat kain hitam dengan pekat.',
    },
    {
      tag: '02 — Tunnel Curing',
      title: 'Pematangan Suhu 170°C',
      desc: 'Mengunci elastisitas tinta agar hasil sablon tahan cuci dan tidak mudah retak.',
    },
    {
      tag: '03 — Detail & QC',
      title: 'Puff 3D & Inspeksi Akhir',
      desc: 'Pengecekan ketebalan tinta, kerapatan register warna, dan finishing sebelum dikemas.',
    },
  ],
  workshopStats: [
    { value: '1.200+', label: 'Pcs / Bulan Kapasitas' },
    { value: '170°C', label: 'Standar Curing Tinta' },
    { value: '100%', label: 'Garansi Lolos QC' },
  ],

  faqEyebrow: '06 / Tanya Jawab & Studio',
  faqTitle: 'Pertanyaan seputar produksi.',
  faqs: [
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
  ],
  studioEyebrow: 'Workshop Bang Sablon',
  studioHeading: 'Kunjungi studio atau konsultasi desain langsung.',
  address: 'Jl. Kemang Timur No. 42, Jakarta Selatan',
  hours: 'Senin – Sabtu, 09.00 – 18.00 WIB',
  whatsapp: '+62 812-9000-2626',
  email: 'studio@bangsablon.id',
  studioCtaText: 'Chat Workshop Sekarang',
  footerTagline: 'Custom Screen Printing & Apparel Workshop',
  footerLocation: 'Jakarta · Indonesia · © 2026',
};

