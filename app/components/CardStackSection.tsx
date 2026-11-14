'use client';

import { useState, type MouseEvent } from 'react';
import './cardstack.css';

interface DeckCategory {
  id: 'bola' | 'mancing' | 'kata';
  title: string;
  subtitle: string;
  cards: { src: string; alt: string }[];
}

const DECKS: DeckCategory[] = [
  {
    id: 'bola',
    title: 'Kaos Bola',
    subtitle: '10 Desain',
    cards: Array.from({ length: 10 }, (_, i) => ({
      src: `/images/cards/bola-${i + 1}.svg`,
      alt: `Desain Kaos Bola #${i + 1}`,
    })),
  },
  {
    id: 'mancing',
    title: 'Kaos Mancing',
    subtitle: '10 Desain',
    cards: Array.from({ length: 10 }, (_, i) => ({
      src: `/images/cards/mancing-${i + 1}.svg`,
      alt: `Desain Kaos Mancing #${i + 1}`,
    })),
  },
  {
    id: 'kata',
    title: 'Kaos Kata-Kata',
    subtitle: '10 Desain',
    cards: Array.from({ length: 10 }, (_, i) => ({
      src: `/images/cards/kata-${i + 1}.svg`,
      alt: `Desain Kaos Kata-Kata #${i + 1}`,
    })),
  },
];

const STACK_ANGLES = [-9, 7, -6, 5, -4, 4, -3, 2, -1.5, 0];

export default function CardStackSection() {
  const [openDeck, setOpenDeck] = useState<string | null>(null);
  const [hoverDeck, setHoverDeck] = useState<string | null>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  const handleMouseMove = (id: string, e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setHoverDeck(id);
    setTilt({ x: nx, y: ny });
  };

  return (
    <section id="katalog-card" className="cs-sec">
      <div className="cs-head">
        <div>
          <div className="cs-eyebrow">02B / Koleksi Desain Pilihan</div>
          <h2 className="cs-title">
            Tumpukan desain siap sablon, tap untuk sebar.
          </h2>
        </div>
        <p className="cs-sub">
          Arahkan kursor atau tap tumpukan kartu Kaos Bola, Kaos Mancing, dan
          Kaos Kata-Kata untuk melihat 10 pilihan desain di tiap kategori.
        </p>
      </div>

      <div className="cs-decks-grid">
        {DECKS.map((deck) => {
          const isOpen = openDeck === deck.id;
          const isHovered = hoverDeck === deck.id;

          return (
            <div
              key={deck.id}
              className={`cs-deck-box${isOpen ? ' open' : ''}`}
            >
              <div className="cs-deck-top">
                <h3>{deck.title}</h3>
                {isOpen ? (
                  <button
                    type="button"
                    className="cs-collapse-btn"
                    onClick={() => setOpenDeck(null)}
                  >
                    Tumpuk Lagi ✕
                  </button>
                ) : (
                  <span>{deck.subtitle}</span>
                )}
              </div>

              {!isOpen ? (
                <>
                  <div
                    className="cs-stack-stage"
                    role="button"
                    tabIndex={0}
                    aria-label={`Sebar 10 kartu ${deck.title}`}
                    onClick={() => setOpenDeck(deck.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpenDeck(deck.id);
                      }
                    }}
                    onMouseMove={(e) => handleMouseMove(deck.id, e)}
                    onMouseLeave={() => {
                      setHoverDeck(null);
                      setTilt({ x: 0, y: 0 });
                    }}
                  >
                    {deck.cards.map((card, idx) => {
                      const baseRot = STACK_ANGLES[idx] ?? 0;
                      const depth = idx - 4.5;
                      const tx = isHovered ? tilt.x * (8 + idx * 2.4) : depth * 1.4;
                      const ty = isHovered ? tilt.y * (6 + idx * 1.6) - idx * 1.5 : -idx * 1.2;
                      const rot = isHovered ? baseRot + tilt.x * (idx * 0.9) : baseRot;
                      const rx = isHovered ? -tilt.y * 10 : 0;
                      const ry = isHovered ? tilt.x * 12 : 0;

                      return (
                        <div
                          key={card.src}
                          className="cs-stack-card"
                          style={{
                            zIndex: idx + 1,
                            transform: `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) rotateX(${rx}deg) rotateY(${ry}deg)`,
                          }}
                        >
                          <img src={card.src} alt={card.alt} loading="lazy" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="cs-tap-hint">Tap untuk sebar 10 card →</div>
                </>
              ) : (
                <div className="cs-spread-grid">
                  {deck.cards.map((card, idx) => (
                    <button
                      key={card.src}
                      type="button"
                      className="cs-spread-card"
                      style={{ animationDelay: `${idx * 35}ms` }}
                      onClick={() => setZoomSrc(card.src)}
                    >
                      <img src={card.src} alt={card.alt} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {zoomSrc && (
        <div
          className="cs-zoom-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setZoomSrc(null);
          }}
        >
          <div className="cs-zoom-box">
            <button
              type="button"
              className="cs-zoom-close"
              aria-label="Tutup preview"
              onClick={() => setZoomSrc(null)}
            >
              ✕
            </button>
            <img src={zoomSrc} alt="Preview desain kaos" />
          </div>
        </div>
      )}
    </section>
  );
}
