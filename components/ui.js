'use client';
import { useState } from 'react';
import { currencySymbol } from '@/data/locations';

export const formatPrice = (n, cur) => `${currencySymbol(cur)}${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function Avatar({ src, name = '?', size = 48, className = '' }) {
  const style = { width: size, height: size, fontSize: size * 0.4 };
  if (src) return <img src={src} alt={name} style={style} className={`rounded-full object-cover ${className}`} />;
  return (
    <span style={style} className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gold font-bold text-ink ${className}`} aria-label={name}>
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function Stars({ value = 0, size = 16 }) {
  return (
    <span className="inline-flex" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= Math.round(value) ? '#D4AF37' : '#3a3a3a'} aria-hidden="true">
          <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8z" />
        </svg>
      ))}
    </span>
  );
}

export function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="inline-flex gap-1" role="radiogroup">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" role="radio" aria-checked={value === i} aria-label={`${i}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onChange(i)}>
          <svg width="28" height="28" viewBox="0 0 20 20" fill={i <= (hover || value) ? '#D4AF37' : '#3a3a3a'}>
            <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export const Skeleton = ({ className = '' }) => <div className={`skeleton ${className}`} />;

export function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-40 w-full !rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

// Generated placeholder (gold line pattern) used when a barber has not uploaded a photo for a slot
export function placeholderSrc(label = '', seed = 0) {
  const hue = ['#D4AF37', '#E8CB6B', '#A8871F'][seed % 3];
  const lines = Array.from({ length: 9 }, (_, i) => `<path d="M${-20 + i * 55} 400 L${120 + i * 55} 0" stroke="${hue}" stroke-opacity="${0.12 + ((i + seed) % 3) * 0.06}" stroke-width="${8 + (i % 3) * 6}"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#141414"/>${lines}<text x="200" y="215" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="${hue}">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
