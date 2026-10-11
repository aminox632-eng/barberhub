'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { Avatar, Stars, formatPrice, placeholderSrc } from './ui';

export default function BarberCard({ b }) {
  const t = useTranslations('explore');
  return (
    <Link href={`/barber/${b._id}`} className="card group block overflow-hidden transition hover:border-gold">
      <div className="relative h-40 overflow-hidden bg-ink-700">
        <img src={b.cover || placeholderSrc(b.city, b.name.length)} alt="" className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" loading="lazy" />
        {b.availableToday && <span className="absolute start-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs text-gold backdrop-blur">{t('availableToday')}</span>}
        <Avatar src={b.avatar} name={b.name} size={56} className="absolute -bottom-0 start-4 translate-y-1/2 border-2 border-ink-800" />
      </div>
      <div className="px-4 pb-4 pt-9">
        <h3 className="truncate font-display text-lg font-bold">{b.name}</h3>
        <p className="mt-0.5 truncate text-sm text-neutral-400">{b.city}, {b.country}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm">
            <Stars value={b.rating} size={14} />
            <b>{b.rating ? b.rating.toFixed(1) : '–'}</b>
            <span className="text-neutral-500">({b.reviewCount})</span>
          </span>
          {b.fromPrice != null && <span className="text-sm text-neutral-400">{t('from')} <b className="text-gold">{formatPrice(b.fromPrice, b.currency)}</b></span>}
        </div>
        {b.distance != null && <p className="mt-2 text-xs text-neutral-500">{b.distance} km</p>}
      </div>
    </Link>
  );
}
