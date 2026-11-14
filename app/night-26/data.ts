export interface Piece {
  name: string;
  price: number;
  crop: [number, number];
  pin: [number, number];
}

export interface Look {
  name: string;
  file: string;
  url: string;
  tone: string;
  pieces: [Piece, Piece];
}

const CDN =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/';

export function H(file: string, w: number): string {
  return (
    'https://images.higgs.ai/?default=1&output=webp&url=' +
    encodeURIComponent(CDN + file) +
    '&w=' +
    w +
    '&q=85'
  );
}

export const LOOKS: Look[] = [
  {
    name: 'Cobalt Skull Tee',
    file: 'model-0.png',
    url: '/images/model-0.png?v=3',
    tone: 'rgba(40,80,255,.30)',
    pieces: [
      { name: 'Cobalt Skull Plastisol Tee', price: 425, crop: [300, 1080], pin: [0.56, 0.32] },
      { name: 'Wide Cargo Pant', price: 165, crop: [1020, 2010], pin: [0.4, 0.7] },
    ],
  },
  {
    name: 'Silver Type Tee',
    file: 'model-1.png',
    url: '/images/model-1.png?v=3',
    tone: 'rgba(200,210,230,.24)',
    pieces: [
      { name: 'Metallic Silver Screen Tee', price: 650, crop: [230, 1100], pin: [0.56, 0.32] },
      { name: 'Straight Tech Trouser', price: 180, crop: [1040, 2010], pin: [0.4, 0.72] },
    ],
  },
  {
    name: 'Gothic Print Tee',
    file: 'model-2.png',
    url: '/images/model-2.png?v=3',
    tone: 'rgba(179,18,27,.26)',
    pieces: [
      { name: 'Gothic Red & White Tee', price: 390, crop: [230, 1040], pin: [0.56, 0.32] },
      { name: 'Wide Cargo Pant', price: 165, crop: [1000, 2010], pin: [0.4, 0.7] },
    ],
  },
  {
    name: 'Barbed Heart Tee',
    file: 'model-3.png',
    url: '/images/model-3.png?v=3',
    tone: 'rgba(80,86,100,.30)',
    pieces: [
      { name: 'Barbed Heart Discharge Tee', price: 720, crop: [260, 1440], pin: [0.56, 0.34] },
      { name: 'Wide Pleated Trouser', price: 180, crop: [1360, 2010], pin: [0.42, 0.76] },
    ],
  },
  {
    name: 'Puff Emblem Tee',
    file: 'model-4.png',
    url: '/images/model-4.png?v=3',
    tone: 'rgba(90,96,110,.30)',
    pieces: [
      { name: '3D Puff Emblem Heavy Tee', price: 310, crop: [240, 1110], pin: [0.56, 0.32] },
      { name: 'Graphite Cargo Pant', price: 175, crop: [1060, 2010], pin: [0.4, 0.7] },
    ],
  },
  {
    name: 'Rose & Chain Tee',
    file: 'model-5.png',
    url: '/images/model-5.png?v=3',
    tone: 'rgba(179,18,27,.24)',
    pieces: [
      { name: 'Rose & Chain Plastisol Tee', price: 210, crop: [320, 1000], pin: [0.56, 0.32] },
      { name: 'Pleated Wide Trouser', price: 195, crop: [940, 2010], pin: [0.42, 0.7] },
    ],
  },
];

