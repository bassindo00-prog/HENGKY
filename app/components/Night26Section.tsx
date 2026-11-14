'use client';

import { useEffect, useRef, useState } from 'react';
import type { SiteConfig } from '@/lib/store';
import { LOOKS } from '../night-26/data';
import '../night-26/night26.css';

const TABLE = [
  [0, 0, 1, 0, 0, 1, 1],
  [1, 160, 0.94, 12, 1.2, 0.9, 1],
  [2, 284, 0.85, 59, 4, 0.72, 1],
  [3, 362, 0.78, 95, 8, 0.55, 0.55],
  [3.6, 392, 0.74, 110, 11, 0.48, 0],
] as const;

const N = LOOKS.length;
const DWELL = 5200;

function wrap(d: number): number {
  return (((d + 3) % 6) + 6) % 6 - 3;
}

function sampleTable(a: number) {
  if (a >= 3.6) return TABLE[4];
  for (let i = 0; i < TABLE.length - 1; i++) {
    const r0 = TABLE[i];
    const r1 = TABLE[i + 1];
    if (a <= r1[0]) {
      const t = (a - r0[0]) / (r1[0] - r0[0]);
      return [
        a,
        r0[1] + (r1[1] - r0[1]) * t,
        r0[2] + (r1[2] - r0[2]) * t,
        r0[3] + (r1[3] - r0[3]) * t,
        r0[4] + (r1[4] - r0[4]) * t,
        r0[5] + (r1[5] - r0[5]) * t,
        r0[6] + (r1[6] - r0[6]) * t,
      ];
    }
  }
  return TABLE[4];
}

export default function Night26Section({
  isStandalone = false,
  config,
}: {
  isStandalone?: boolean;
  config?: SiteConfig;
}) {
  const looks = LOOKS.map((l, idx) => {
    const meta = config?.looksMeta?.[idx];
    if (!meta) return l;
    return {
      ...l,
      name: meta.name || l.name,
      pieces: [
        { ...l.pieces[0], name: meta.piece1Name || l.pieces[0].name, price: meta.piece1Price ?? l.pieces[0].price },
        { ...l.pieces[1], name: meta.piece2Name || l.pieces[1].name, price: meta.piece2Price ?? l.pieces[1].price },
      ] as typeof l.pieces,
    };
  });
  const runwayRef = useRef<HTMLDivElement>(null);
  const floorGlowRef = useRef<HTMLDivElement>(null);
  const modelsRef = useRef<HTMLDivElement>(null);
  const modelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pinsRef = useRef<HTMLDivElement>(null);
  const pinWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pinBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const viewRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const segFillRefs = useRef<(HTMLElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const oldPriceRef = useRef<HTMLSpanElement>(null);
  const newPriceRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const bagBtnRef = useRef<HTMLButtonElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(2);
  const [cardLook, setCardLook] = useState(2);
  const [paused, setPaused] = useState(false);
  const [bag, setBag] = useState<Set<string>>(() => new Set());
  const [bagCount, setBagCount] = useState(0);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  const runtimeRef = useRef({
    pos: 2,
    active: 2,
    paused: false,
    tweening: false,
    tweenFrom: 2,
    tweenTo: 2,
    tweenStart: 0,
    tweenDur: 760,
    dragging: false,
    dragStartX: 0,
    dragStartPos: 2,
    swallowClick: false,
    lastX: -999,
    lastY: -999,
    dwellStart: 0,
    geom: { mh: 634, mw: 421, u: 1, cx: 400, feet: 540 },
    pinTimers: [] as number[],
    swapTimers: [] as number[],
    toastTimer: 0,
    priceAnim: { fromOld: 555, toOld: 555, fromNew: 500, toNew: 500, start: 0, active: false },
  });

  const bagRef = useRef(bag);
  bagRef.current = bag;

  const showToast = (msg: string) => {
    const rt = runtimeRef.current;
    window.clearTimeout(rt.toastTimer);
    setToastMsg(msg);
    setToastOpen(true);
    rt.toastTimer = window.setTimeout(() => setToastOpen(false), 1700);
  };

  const applyThumbCrop = (k: number, lookIdx: number) => {
    const th = thumbRefs.current[k];
    if (!th) return;
    const w = th.offsetWidth || 80;
    const h = th.offsetHeight || 100;
    const [y0, y1] = LOOKS[lookIdx].pieces[k].crop;
    const scale = Math.min(h / (y1 - y0), w / 560);
    th.style.backgroundImage = `url("${LOOKS[lookIdx].url}")`;
    th.style.backgroundSize = `${1360 * scale}px ${2048 * scale}px`;
    th.style.backgroundPosition = `${w / 2 - 680 * scale}px ${h / 2 - ((y0 + y1) / 2) * scale}px`;
  };

  const showPins = () => {
    const rt = runtimeRef.current;
    rt.pinTimers.forEach((t) => window.clearTimeout(t));
    rt.pinTimers = [];
    for (let k = 0; k < 2; k++) {
      const btn = pinBtnRefs.current[k];
      if (!btn) continue;
      btn.classList.remove('in');
      const t = window.setTimeout(() => btn.classList.add('in'), 120 + k * 120);
      rt.pinTimers.push(t);
    }
  };

  const hidePins = () => {
    const rt = runtimeRef.current;
    rt.pinTimers.forEach((t) => window.clearTimeout(t));
    rt.pinTimers = [];
    for (let k = 0; k < 2; k++) {
      pinBtnRefs.current[k]?.classList.remove('in');
      pinWrapRefs.current[k]?.classList.remove('open');
    }
  };

  const go = (targetIdx: number, dir?: number) => {
    const rt = runtimeRef.current;
    const normTarget = ((targetIdx % N) + N) % N;
    let d = wrap(normTarget - rt.pos);
    if (dir && Math.abs(Math.abs(d) - 3) < 0.01) {
      d = dir * 3;
    }

    rt.tweenFrom = rt.pos;
    rt.tweenTo = rt.pos + d;
    rt.tweenStart = performance.now();
    rt.tweenDur = 760 + Math.max(0, Math.abs(d) - 1) * 140;
    rt.tweening = true;
    rt.active = normTarget;
    rt.dwellStart = performance.now();
    setActive(normTarget);

    if (floorGlowRef.current) {
      floorGlowRef.current.style.setProperty('--glow', LOOKS[normTarget].tone);
    }

    hidePins();

    const oldSum = LOOKS[normTarget].pieces[0].price + LOOKS[normTarget].pieces[1].price;
    const oldBundle = Math.round(oldSum * 0.9);
    rt.priceAnim = {
      fromOld: rt.priceAnim.toOld,
      toOld: oldSum,
      fromNew: rt.priceAnim.toNew,
      toNew: oldBundle,
      start: performance.now(),
      active: true,
    };

    rt.swapTimers.forEach((t) => window.clearTimeout(t));
    rt.swapTimers = [];
    cardRefs.current.forEach((c) => c?.classList.add('out'));

    const tFill = window.setTimeout(() => {
      setCardLook(normTarget);
      requestAnimationFrame(() => {
        applyThumbCrop(0, normTarget);
        applyThumbCrop(1, normTarget);
      });
    }, 420);
    const tC0 = window.setTimeout(() => cardRefs.current[0]?.classList.remove('out'), 420 + 180);
    const tC1 = window.setTimeout(() => cardRefs.current[1]?.classList.remove('out'), 420 + 320);
    rt.swapTimers.push(tFill, tC0, tC1);
  };

  const flyToBag = (pieceIdx: number, onArrive: () => void) => {
    const th = thumbRefs.current[pieceIdx];
    const bagBtn = bagBtnRef.current;
    if (!th || !bagBtn) {
      onArrive();
      return;
    }
    const r0 = th.getBoundingClientRect();
    const r1 = bagBtn.getBoundingClientRect();
    const flyer = document.createElement('div');
    flyer.className = 'flyer';
    flyer.style.left = `${r0.left}px`;
    flyer.style.top = `${r0.top}px`;
    flyer.style.width = `${r0.width}px`;
    flyer.style.height = `${r0.height}px`;
    flyer.style.backgroundImage = th.style.backgroundImage;
    flyer.style.backgroundSize = th.style.backgroundSize;
    flyer.style.backgroundPosition = th.style.backgroundPosition;
    document.body.appendChild(flyer);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flyer.style.left = `${r1.left + r1.width / 2 - 6}px`;
        flyer.style.top = `${r1.top + r1.height / 2 - 6}px`;
        flyer.style.width = '12px';
        flyer.style.height = '12px';
        flyer.style.borderRadius = '50%';
        flyer.style.opacity = '0';
      });
    });

    window.setTimeout(onArrive, 700);
    window.setTimeout(() => flyer.remove(), 820);
  };

  const bumpBadge = (nextCount: number) => {
    setBagCount(nextCount);
    const b = badgeRef.current;
    if (!b) return;
    b.classList.remove('bump');
    void b.offsetWidth;
    if (nextCount > 0) b.classList.add('bump');
  };

  const togglePiece = (k: number) => {
    const lookIdx = runtimeRef.current.active;
    const key = `${lookIdx}-${k}`;
    const piece = LOOKS[lookIdx].pieces[k];
    const next = new Set(bagRef.current);

    if (next.has(key)) {
      next.delete(key);
      setBag(next);
      bumpBadge(next.size);
      showToast('Removed from bag');
    } else {
      next.add(key);
      setBag(next);
      showToast(`${piece.name} added`);
      flyToBag(k, () => bumpBadge(bagRef.current.size));
    }
  };

  const addFullLook = () => {
    const lookIdx = runtimeRef.current.active;
    const look = LOOKS[lookIdx];
    const missing: number[] = [];
    for (let k = 0; k < 2; k++) {
      if (!bagRef.current.has(`${lookIdx}-${k}`)) missing.push(k);
    }

    const cta = ctaRef.current;
    if (cta) {
      cta.classList.remove('sweeping');
      void cta.offsetWidth;
      cta.classList.add('sweeping');
    }

    if (missing.length === 0) {
      showToast('Full look already in your bag');
      return;
    }

    const next = new Set(bagRef.current);
    missing.forEach((k) => next.add(`${lookIdx}-${k}`));
    setBag(next);
    showToast(`${look.name} — full look added · saved 10%`);

    missing.forEach((k, idx) => {
      window.setTimeout(() => {
        flyToBag(k, () => {
          if (idx === missing.length - 1) bumpBadge(bagRef.current.size);
        });
      }, idx * 120);
    });
  };

  useEffect(() => {
    if (isStandalone) {
      document.title = 'Night ’26 Shell — Shop the Look';
    }

    LOOKS.forEach((l) => {
      const img = new Image();
      img.src = l.url;
      img.decode?.().catch(() => {});
    });

    const rt = runtimeRef.current;
    rt.dwellStart = performance.now();

    const measure = () => {
      const rw = runwayRef.current;
      if (!rw) return;
      const w = rw.clientWidth;
      const h = rw.clientHeight;
      const narrow = window.innerWidth <= 820;
      const mh = Math.min(h * (narrow ? 0.66 : 0.705), w * (narrow ? 1.05 : 0.92));
      const mw = mh * (421 / 634);
      const u = mh / 634;
      const cx = w * (narrow ? 0.5 : 0.523);
      const feet = h * (narrow ? 0.86 : 0.85);
      rt.geom = { mh, mw, u, cx, feet };
      rw.style.setProperty('--mh', `${mh}px`);
      rw.style.setProperty('--mw', `${mw}px`);
      if (pinsRef.current) {
        pinsRef.current.style.left = `${cx - mw / 2}px`;
        pinsRef.current.style.top = `${feet - mh}px`;
        pinsRef.current.style.width = `${mw}px`;
        pinsRef.current.style.height = `${mh}px`;
      }
      applyThumbCrop(0, rt.active);
      applyThumbCrop(1, rt.active);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (runwayRef.current) ro.observe(runwayRef.current);
    window.addEventListener('resize', measure);

    showPins();

    const onPointerMove = (e: PointerEvent) => {
      rt.lastX = e.clientX;
      rt.lastY = e.clientY;
      if (rt.dragging) {
        const dx = e.clientX - rt.dragStartX;
        if (Math.abs(dx) > 4) rt.swallowClick = true;
        rt.pos = rt.dragStartPos - dx / (170 * rt.geom.u);
      }
    };

    const onPointerUp = () => {
      if (!rt.dragging) return;
      rt.dragging = false;
      const nearest = Math.round(rt.pos);
      go(nearest);
      window.setTimeout(() => {
        rt.swallowClick = false;
      }, 60);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!isStandalone) {
        if (document.body.classList.contains('open')) return;
        if (window.scrollY < window.innerHeight * 0.5) return;
      }
      if (e.key === 'ArrowRight') {
        go(rt.active + 1, 1);
      } else if (e.key === 'ArrowLeft') {
        go(rt.active - 1, -1);
      } else if (e.key === ' ') {
        e.preventDefault();
        rt.paused = !rt.paused;
        if (!rt.paused) rt.dwellStart = performance.now();
        setPaused(rt.paused);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('keydown', onKeyDown);

    let rafId = 0;
    const tick = (now: number) => {
      if (rt.tweening) {
        const raw = Math.min(1, (now - rt.tweenStart) / rt.tweenDur);
        const eased = 1 - Math.pow(1 - raw, 4.2);
        rt.pos = rt.tweenFrom + (rt.tweenTo - rt.tweenFrom) * eased;
        if (raw >= 1) {
          rt.pos = ((rt.tweenTo % N) + N) % N;
          rt.tweening = false;
          rt.dwellStart = now;
          showPins();
        }
      }

      const { mh, u, cx, feet } = rt.geom;
      const blurScale = Math.max(0.6, u);
      for (let i = 0; i < N; i++) {
        const el = modelRefs.current[i];
        if (!el) continue;
        const d = wrap(i - rt.pos);
        const a = Math.abs(d);
        const [, xOff, sc, lift, bl, br, op] = sampleTable(a);
        const x = Math.sign(d) * xOff * u;
        const y = feet - lift * u - mh;
        el.style.transform = `translate3d(${cx + x}px, ${y}px, 0) scale(${sc})`;
        el.style.filter = `blur(${bl * blurScale}px) brightness(${br})`;
        el.style.opacity = String(op);
        el.style.zIndex = String(100 - Math.round(a * 10));
        el.classList.toggle('c', a < 0.5);
      }

      if (rt.priceAnim.active) {
        const t = Math.min(1, (now - rt.priceAnim.start) / 600);
        const e = 1 - Math.pow(1 - t, 3);
        const vOld = Math.round(rt.priceAnim.fromOld + (rt.priceAnim.toOld - rt.priceAnim.fromOld) * e);
        const vNew = Math.round(rt.priceAnim.fromNew + (rt.priceAnim.toNew - rt.priceAnim.fromNew) * e);
        if (oldPriceRef.current) oldPriceRef.current.textContent = `$${vOld}.00`;
        if (newPriceRef.current) newPriceRef.current.textContent = `$${vNew}.00`;
        if (t >= 1) rt.priceAnim.active = false;
      }

      if (!rt.paused && !rt.dragging && !rt.tweening) {
        const pct = Math.min(100, ((now - rt.dwellStart) / DWELL) * 100);
        const fillEl = segFillRefs.current[rt.active];
        if (fillEl) fillEl.style.width = `${pct}%`;
        if (pct >= 100) {
          go(rt.active + 1, 1);
        }
      }

      const viewEl = viewRef.current;
      if (viewEl) {
        let showView = false;
        if (!rt.tweening && !rt.dragging && rt.lastX >= 0 && window.innerWidth > 820) {
          const hit = document.elementFromPoint(rt.lastX, rt.lastY) as HTMLElement | null;
          if (hit && hit.classList.contains('hit')) {
            const parent = hit.parentElement;
            if (parent && !parent.classList.contains('c')) {
              showView = true;
            }
          }
        }
        viewEl.style.transform = `translate3d(${rt.lastX}px, ${rt.lastY}px, 0) scale(${showView ? 1 : 0})`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      rt.pinTimers.forEach((t) => window.clearTimeout(t));
      rt.swapTimers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(rt.toastTimer);
    };
  }, [isStandalone]);

  const currentLook = LOOKS[cardLook];
  const fullLookInBag = bag.has(`${active}-0`) && bag.has(`${active}-1`);

  return (
    <section id="about-sec" className="n26-root">
      <div id="stage">
        <section id="runway" ref={runwayRef}>
          <div id="floorGlow" ref={floorGlowRef} />

          <div
            id="models"
            ref={modelsRef}
            onPointerDown={(e) => {
              const rt = runtimeRef.current;
              rt.dragging = true;
              rt.tweening = false;
              rt.dragStartX = e.clientX;
              rt.dragStartPos = rt.pos;
              rt.swallowClick = false;
            }}
          >
            {LOOKS.map((look, i) => (
              <div
                key={look.name}
                className={`model${i === 2 ? ' c' : ''}`}
                ref={(el) => {
                  modelRefs.current[i] = el;
                }}
              >
                <div className="fig" style={{ backgroundImage: `url("${look.url}")` }} />
                <div
                  className="hit"
                  onClick={() => {
                    if (runtimeRef.current.swallowClick) return;
                    if (i !== runtimeRef.current.active) go(i);
                  }}
                />
              </div>
            ))}
          </div>

          <div id="pins" ref={pinsRef}>
            {looks[active].pieces.map((piece, k) => (
              <div
                key={k}
                className="pin-wrap"
                ref={(el) => {
                  pinWrapRefs.current[k] = el;
                }}
                style={{
                  left: `${piece.pin[0] * 100}%`,
                  top: `${piece.pin[1] * 100}%`,
                }}
                onPointerEnter={() => cardRefs.current[k]?.classList.add('hl')}
                onPointerLeave={() => cardRefs.current[k]?.classList.remove('hl')}
              >
                <button
                  type="button"
                  className="pin"
                  aria-label={piece.name}
                  ref={(el) => {
                    pinBtnRefs.current[k] = el;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    pinWrapRefs.current[k]?.classList.toggle('open');
                  }}
                />
                <div className="tip">
                  <strong>{piece.name}</strong>
                  <span>${piece.price}.00</span>
                </div>
              </div>
            ))}
          </div>

          <div id="ctrl">
            <button
              type="button"
              className="c-btn"
              aria-label="Previous look"
              onClick={() => go(runtimeRef.current.active - 1, -1)}
            >
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M19 7H2M7 2L2 7l5 5" />
              </svg>
            </button>

            <div id="timeline">
              {looks.map((look, i) => {
                const isOn = i === active;
                const isDone = i < active;
                return (
                  <button
                    key={look.name}
                    type="button"
                    className={`seg${isOn ? ' on' : ''}${isDone ? ' done' : ''}`}
                    ref={(el) => {
                      segRefs.current[i] = el;
                    }}
                    onClick={() => go(i)}
                  >
                    <div className="seg-bar">
                      <i
                        ref={(el) => {
                          segFillRefs.current[i] = el;
                        }}
                        style={isOn ? undefined : { width: isDone ? '100%' : '0%' }}
                      />
                    </div>
                    <div className="seg-lbl">
                      {String(i + 1).padStart(2, '0')}
                      <span>{look.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              id="pause"
              className="c-btn"
              aria-label={paused ? 'Play' : 'Pause'}
              onClick={() => {
                const rt = runtimeRef.current;
                rt.paused = !rt.paused;
                if (!rt.paused) rt.dwellStart = performance.now();
                setPaused(rt.paused);
              }}
            >
              {paused ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M3 2l9 5-9 5V2z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <rect x="2.5" y="2" width="3" height="10" rx="0.5" />
                  <rect x="8.5" y="2" width="3" height="10" rx="0.5" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="c-btn"
              aria-label="Next look"
              onClick={() => go(runtimeRef.current.active + 1, 1)}
            >
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M1 7h17M13 2l5 5-5 5" />
              </svg>
            </button>
          </div>

          <div id="toast" ref={toastRef} className={toastOpen ? 'show' : ''}>
            {toastMsg}
          </div>
        </section>
      </div>

      <div id="view" ref={viewRef}>
        VIEW
      </div>
    </section>
  );
}

