'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import BarberCard from './BarberCard';
import { Stars } from './ui';
import { Link } from '@/lib/navigation';
import { Tabs, BookingRow, useBookings, Conversations } from './dashShared';

export default function ClientDashboard({ user }) {
  const t = useTranslations('dash');
  const [tab, setTab] = useState('bookings');
  const { bookings, setStatus } = useBookings();
  const [favs, setFavs] = useState(null);
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    fetch('/api/favorites').then((r) => r.json()).then((d) => setFavs(d.barbers || [])).catch(() => setFavs([]));
    fetch('/api/reviews').then((r) => r.json()).then((d) => setReviews(d.reviews || [])).catch(() => setReviews([]));
  }, []);

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold">{t('welcome')}, {user.name}</h1>
      <div className="mt-6"><Tabs value={tab} onChange={setTab} tabs={[['bookings', t('myBookings')], ['favorites', t('favorites')], ['reviews', t('myReviews')], ['messages', t('messages')]]} /></div>
      <div className="mt-6">
        {tab === 'bookings' && (bookings == null ? <div className="skeleton h-32" /> : bookings.length === 0 ? <p className="text-neutral-400">{t('emptyBookings')} <Link href="/explore" className="text-gold">→</Link></p> : (
          <ul className="space-y-3">{bookings.map((b) => <BookingRow key={b._id} b={b} role="client" who={b.barber?.name} onStatus={setStatus} />)}</ul>
        ))}
        {tab === 'favorites' && (favs == null ? <div className="skeleton h-32" /> : favs.length === 0 ? <p className="text-neutral-400">{t('emptyFavs')}</p> : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{favs.map((b) => <BarberCard key={b._id} b={b} />)}</div>
        ))}
        {tab === 'reviews' && (reviews == null ? <div className="skeleton h-32" /> : reviews.length === 0 ? <p className="text-neutral-400">{t('emptyReviews')}</p> : (
          <ul className="space-y-3">{reviews.map((r) => (
            <li key={r._id} className="card p-4"><Link href={`/barber/${r.barberId}`} className="font-semibold hover:text-gold">{r.barberName}</Link><div className="mt-1"><Stars value={r.rating} size={14} /></div>{r.comment && <p className="mt-2 text-sm text-neutral-300">{r.comment}</p>}</li>
          ))}</ul>
        ))}
        {tab === 'messages' && <Conversations />}
      </div>
    </div>
  );
}
