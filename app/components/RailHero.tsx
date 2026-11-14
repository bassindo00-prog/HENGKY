'use client';

import { useEffect, useRef, useState } from 'react';
import type { SiteConfig } from '@/lib/store';
import {
  BW,
  CH,
  CW,
  ITEMS,
  PAD,
  ROWY,
  SH,
  SHEET_URL,
  SW,
} from '../data/garments';

const N = ITEMS.length;
const SLOT = 108;
const OPEN = 86;
const CX = 750;

declare global {
  interface Window {
    __closet?: {
      openG: (k: number) => void;
      step: (d: number) => void;
      closeG: () => void;
      setHov: (k: number) => void;
    };
  }
}

function paint(el: HTMLElement, k: number) {
  const ew = el.offsetWidth;
  const eh = el.offsetHeight;
  const sx = ew / BW;
  const sy = eh / CH;
  const col = k % 5;
  const row = Math.floor(k / 5);
  const xbox = col * CW - PAD;
  const ybox = ROWY[row];
  el.style.backgroundImage = `url("${SHEET_URL}")`;
  el.style.backgroundSize = `${SW * sx}px ${SH * sy}px`;
  el.style.backgroundPosition = `${-xbox * sx}px ${-ybox * sy}px`;
  el.style.clipPath = ITEMS[k].poly;
}

export default function RailHero({ config }: { config?: SiteConfig }) {
  const navLeft = config?.navLeft || 'About';
  const brandName = config?.brandName || 'BANG SABLON';
  const navRight = config?.navRight || 'Contact';
  const availText = config?.availText || 'See availability';
  const closeText = config?.closeText || 'Close';
  const m = config?.marqueeItems ?? ['OFFCUT', 'LIMITED RUN', 'NO RESTOCKS'];
  const marqItems = [m[0], '•', m[1], '•', m[2], '•'];
  const marqRepeats = Array.from({ length: 16 }, (_, r) =>
    marqItems.map((text, i) => ({ key: `${r}-${i}`, text }))
  ).flat();

  const artRef = useRef<HTMLDivElement>(null);
  const garmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLElement | null)[]>([]);
  const capRef = useRef<HTMLDivElement>(null);
  const capNameRef = useRef<HTMLElement>(null);
  const capPriceRef = useRef<HTMLSpanElement>(null);
  const bigRef = useRef<HTMLDivElement>(null);
  const big2Ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef({ hov: -1, open: -1 });

  useEffect(() => {
    const art = artRef.current;
    if (!art) return;

    const fit = () => {
      const k = Math.min(window.innerWidth / 1500, window.innerHeight / 1000);
      art.style.transform = `scale(${k})`;
      art.style.left = (window.innerWidth - 1500 * k) / 2 + 'px';
      art.style.top = (window.innerHeight - 1000 * k) / 2 + 'px';
    };

    fit();
    window.addEventListener('resize', fit);

    for (let k = 0; k < N; k++) {
      const img = imgRefs.current[k];
      if (img) paint(img, k);
    }

    const layout = () => {
      const { hov } = stateRef.current;
      for (let k = 0; k < N; k++) {
        const g = garmentRefs.current[k];
        if (!g) continue;
        let x = CX + (k - (N - 1) / 2) * SLOT;
        if (hov >= 0 && k !== hov) {
          x += Math.sign(k - hov) * OPEN;
        }
        g.style.left = x + 'px';
        g.classList.toggle('face', k === hov);
      }

      const cap = capRef.current;
      const capName = capNameRef.current;
      const capPrice = capPriceRef.current;
      if (!cap || !capName || !capPrice) return;

      if (hov >= 0) {
        const faced = garmentRefs.current[hov];
        if (faced) cap.style.left = faced.style.left;
        capName.textContent = ITEMS[hov].name;
        capPrice.textContent = ITEMS[hov].price;
        cap.classList.add('on');
      } else {
        cap.classList.remove('on');
      }
    };

    const fill = (k: number) => {
      if (numRef.current) {
        numRef.current.textContent =
          String(k + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
      }
      if (nameRef.current) nameRef.current.textContent = ITEMS[k].name;
      if (priceRef.current) priceRef.current.textContent = ITEMS[k].price;
    };

    const openG = (k: number) => {
      const big = bigRef.current;
      const g = garmentRefs.current[k];
      if (!big || !g || stateRef.current.open >= 0) return;

      stateRef.current.open = k;
      stateRef.current.hov = k;
      layout();

      const gx = parseFloat(g.style.left);
      big.getAnimations().forEach((a) => a.cancel());
      paint(big, k);
      fill(k);
      document.body.classList.add('open');

      big.animate(
        [
          { transform: `translate(${gx - 750}px, -8px) scale(.61)`, opacity: 1 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: 750, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }
      );
      g.style.visibility = 'hidden';
    };

    const step = (d: number) => {
      const big = bigRef.current;
      const big2 = big2Ref.current;
      if (!big || !big2 || stateRef.current.open < 0) return;

      const from = stateRef.current.open;
      const next = (from + d + N) % N;
      stateRef.current.open = next;
      fill(next);

      const gFrom = garmentRefs.current[from];
      const gNext = garmentRefs.current[next];
      if (gFrom) gFrom.style.visibility = '';
      if (gNext) gNext.style.visibility = 'hidden';

      stateRef.current.hov = next;
      layout();

      paint(big2, from);
      big2.getAnimations().forEach((a) => a.cancel());
      big2.animate(
        [
          { transform: 'none', opacity: 1, filter: 'blur(0)' },
          { transform: `translateX(${-d * 120}px) scale(.94)`, opacity: 0, filter: 'blur(6px)' },
        ],
        { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );

      big.getAnimations().forEach((a) => a.cancel());
      paint(big, next);
      big.animate(
        [
          { transform: `translateX(${d * 120}px) scale(.94)`, opacity: 0, filter: 'blur(6px)' },
          { transform: 'none', opacity: 1, filter: 'blur(0)' },
        ],
        { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }
      );
    };

    const closeG = () => {
      const big = bigRef.current;
      const k = stateRef.current.open;
      const g = garmentRefs.current[k];
      if (!big || !g || k < 0) return;

      const gx = parseFloat(g.style.left);
      big.getAnimations().forEach((a) => a.cancel());
      big.animate(
        [
          { transform: 'none', opacity: 1 },
          { transform: `translate(${gx - 750}px, -8px) scale(.61)`, opacity: 1 },
        ],
        { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }
      );
      document.body.classList.remove('open');

      window.setTimeout(() => {
        g.style.visibility = '';
        big.getAnimations().forEach((a) => a.cancel());
        big.style.opacity = '0';
        stateRef.current.open = -1;
        stateRef.current.hov = -1;
        layout();
      }, 650);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current.open < 0) {
        if (window.scrollY >= window.innerHeight * 0.5) return;
        if (e.key === 'ArrowRight') {
          stateRef.current.hov = Math.min(N - 1, stateRef.current.hov + 1);
          layout();
        } else if (e.key === 'ArrowLeft') {
          stateRef.current.hov =
            stateRef.current.hov < 0 ? N - 1 : Math.max(0, stateRef.current.hov - 1);
          layout();
        } else if (e.key === 'Enter' && stateRef.current.hov >= 0) {
          openG(stateRef.current.hov);
        }
      } else {
        if (e.key === 'ArrowRight') {
          step(1);
        } else if (e.key === 'ArrowLeft') {
          step(-1);
        } else if (e.key === 'Escape') {
          closeG();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    layout();

    window.__closet = {
      openG,
      step,
      closeG,
      setHov(k: number) {
        stateRef.current.hov = k;
        layout();
      },
    };

    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('keydown', onKeyDown);
      delete window.__closet;
    };
  }, []);

  const handleRackLeave = () => {
    if (stateRef.current.open >= 0) return;
    stateRef.current.hov = -1;
    for (let k = 0; k < N; k++) {
      const g = garmentRefs.current[k];
      if (!g) continue;
      const x = CX + (k - (N - 1) / 2) * SLOT;
      g.style.left = x + 'px';
      g.classList.remove('face');
    }
    capRef.current?.classList.remove('on');
  };

  const handleEnter = (k: number) => {
    if (stateRef.current.open >= 0) return;
    window.__closet?.setHov(k);
  };

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    { label: navLeft, target: 'about-sec' },
    { label: 'Teknik', target: 'teknik' },
    { label: 'Cara Order', target: 'order' },
    { label: 'Workshop', target: 'workshop' },
    { label: navRight, target: 'contact-studio' },
  ];

  return (
    <section className="hero-offcut">
      <button
        type="button"
        className="top-brand-bs"
        aria-label="Kembali ke atas"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <span>BS</span>
      </button>
      <nav className="top-nav ui dim" aria-label="Navigasi Utama">
        <div className="top-nav-links">
          {navItems.map((item) => (
            <button
              key={item.target}
              type="button"
              className="top-nav-link"
              onClick={() => scrollToSection(item.target)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="top-nav-burger"
          aria-label="Buka menu navigasi"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((prev) => !prev)}
        >
          {mobileNavOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          )}
        </button>

        {mobileNavOpen && (
          <div className="top-nav-drawer">
            {navItems.map((item) => (
              <button
                key={item.target}
                type="button"
                className="top-nav-drawer-link"
                onClick={() => scrollToSection(item.target)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>
      <div id="logo" className="dim">
        {brandName}
      </div>
      <div id="art" ref={artRef}>
        <div id="rail" className="dim" />
        <div id="rack" className="dim" onPointerLeave={handleRackLeave}>
          {ITEMS.map((item, k) => (
            <div
              key={item.name}
              className="g"
              ref={(el) => {
                garmentRefs.current[k] = el;
              }}
              onPointerEnter={() => handleEnter(k)}
              onClick={() => window.__closet?.openG(k)}
            >
              <i
                ref={(el) => {
                  imgRefs.current[k] = el;
                }}
              />
            </div>
          ))}
        </div>
        <div id="cap" className="dimmer" ref={capRef}>
          <b ref={capNameRef} />
          <span ref={capPriceRef} />
        </div>
        <button id="avail" className="pill ui dim dimmer">
          {availText}
        </button>
        <div id="det">
          <div className="hit" onClick={() => window.__closet?.closeG()} />
          <div id="big2" ref={big2Ref} />
          <div id="big" ref={bigRef} />
          <button
            id="prev"
            className="arr"
            aria-label="Previous"
            onClick={() => window.__closet?.step(-1)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            id="next"
            className="arr"
            aria-label="Next"
            onClick={() => window.__closet?.step(1)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div id="info">
            <div id="num" ref={numRef} />
            <div id="name" ref={nameRef} />
            <div id="price" ref={priceRef} />
            <button className="pill ui">{availText}</button>
          </div>
        </div>
      </div>
      <div id="band" className="dimmer">
        <div id="track">
          {marqRepeats.map((item) => (
            <span key={item.key}>{item.text}</span>
          ))}
        </div>
      </div>
      <button
        id="close"
        className="ui"
        onClick={() => window.__closet?.closeG()}
      >
        {closeText}
      </button>
    </section>
  );
}

