'use client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Link } from '@/lib/navigation';
import { DAYS } from '@/lib/config';
import MapView from './MapView';
import BookingModal from './BookingModal';
import ChatBox from './ChatBox';
import Modal from './Modal';
import { Avatar, Stars, StarInput, formatPrice, placeholderSrc } from './ui';

export default function BarberProfileView({ barber: b }) {
  const t = useTranslations('barber');
  const c = useTranslations('cats');
  const d = useTranslations('days');
  const { data: session } = useSession();
  const isClient = session?.user?.role === 'client';
  const [booking, setBooking] = useState(null); // service name or true
  const [chat, setChat] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [cat, setCat] = useState('all');
  const [fav, setFav] = useState(false);
  const [reviews, setReviews] = useState(b.reviews);
  const [stats, setStats] = useState({ rating: b.rating, count: b.reviewCount });
  const [rv, setRv] = useState({ rating: 0, comment: '', msg: '', ok: false });

  useEffect(() => {
    if (isClient) fetch('/api/favorites').then((r) => r.json()).then((x) => setFav((x.ids || []).includes(b._id))).catch(() => {});
  }, [isClient, b._id]);

  const toggleFav = async () => {
    if (!isClient) return;
    const r = await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ barberId: b._id }) });
    if (r.ok) setFav((await r.json()).favorited);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rv.rating) return;
    const r = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ barberId: b._id, rating: rv.rating, comment: rv.comment }) });
    if (r.status === 403) return setRv({ ...rv, msg: t('needBooking'), ok: false });
    if (!r.ok) return;
    const fresh = await fetch(`/api/barber/${b._id}`).then((x) => x.json());
    setReviews(fresh.reviews); setStats({ rating: fresh.rating, count: fresh.reviewCount });
    setRv({ rating: 0, comment: '', msg: t('thanks'), ok: true });
  };

  const cats = useMemo(() => [...new Set(b.portfolio.map((p) => p.category))], [b.portfolio]);
  const photos = b.portfolio.map((p, i) => ({ ...p, src: p.url || placeholderSrc(c(p.category in { Fade: 1, Afro: 1, Curly: 1, Beard: 1, Classic: 1, Kids: 1, Color: 1 } ? p.category : 'Other'), i) }));
  const shown = cat === 'all' ? photos : photos.filter((p) => p.category === cat);
  const wa = (b.whatsapp || '').replace(/\D/g, '');
  const dirUrl = b.lat != null ? `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}` : null;

  return (
    <div className="container-x py-6">
      {/* Cover + identity */}
      <div className="relative h-52 overflow-hidden rounded-2xl bg-ink-700 sm:h-72">
        <img src={b.cover || placeholderSrc(b.city, b.name.length)} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
      </div>
      <div className="-mt-12 flex flex-col gap-5 px-2 sm:-mt-14 sm:flex-row sm:items-end sm:px-6">
        <Avatar src={b.avatar} name={b.name} size={112} className="relative border-4 border-ink" />
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{b.name}</h1>
          <p className="mt-1 text-neutral-400">{b.city}, {b.country}</p>
          <p className="mt-2 flex items-center gap-2"><Stars value={stats.rating} /> <b>{stats.rating ? stats.rating.toFixed(1) : '–'}</b> <span className="text-neutral-400">({stats.count} {t('reviews').toLowerCase()})</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-gold !px-7" onClick={() => setBooking(true)}>{t('bookNow')}</button>
          {isClient && <button className={`btn-ghost ${fav ? '!border-gold !text-gold' : ''}`} onClick={toggleFav} aria-pressed={fav}>{fav ? '★' : '☆'} {t('favorite')}</button>}
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-12">
          <section>
            <h2 className="font-display text-2xl font-bold">{t('about')}</h2>
            {b.bio && <p className="mt-3 max-w-2xl leading-relaxed text-neutral-300">{b.bio}</p>}
            <p className="mt-3 text-sm text-neutral-400">{t('experience')}: <b className="text-white">{b.yearsExperience} {t('years')}</b></p>
            {b.skills?.length > 0 && <div className="mt-4 flex flex-wrap gap-2" aria-label={t('skills')}>{b.skills.map((s) => <span key={s} className="chip !border-gold/50 !text-gold">{s}</span>)}</div>}
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">{t('services')}</h2>
            <ul className="card mt-4 divide-y divide-line">
              {b.services.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-4 p-4">
                  <div><p className="font-semibold">{s.name}</p><p className="text-sm text-neutral-400">{s.duration} {t('min')}</p></div>
                  <div className="flex items-center gap-4"><b className="text-gold">{formatPrice(s.price, b.currency)}</b><button className="btn-ghost !py-1.5" onClick={() => setBooking(s.name)}>{t('bookNow')}</button></div>
                </li>
              ))}
            </ul>
          </section>

          {photos.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold">{t('portfolio')}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {['all', ...cats].map((k) => <button key={k} onClick={() => setCat(k)} className={`chip ${cat === k ? 'chip-on' : ''}`}>{k === 'all' ? t('all') : c(k in { Fade: 1, Afro: 1, Curly: 1, Beard: 1, Classic: 1, Kids: 1, Color: 1 } ? k : 'Other')}</button>)}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {shown.map((p, i) => (
                  <button key={i} onClick={() => setLightbox(p)} className="aspect-square overflow-hidden rounded-lg border border-line hover:border-gold">
                    <img src={p.src} alt={p.category} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-display text-2xl font-bold">{t('reviews')}</h2>
            <div className="mt-4 space-y-4">
              {reviews.length === 0 && <p className="text-neutral-400">{t('noReviews')}</p>}
              {reviews.map((r) => (
                <article key={r._id} className="card p-4">
                  <div className="flex items-center gap-3"><Avatar src={r.clientAvatar} name={r.clientName} size={36} /><div><p className="text-sm font-semibold">{r.clientName}</p><Stars value={r.rating} size={13} /></div><time className="ms-auto text-xs text-neutral-500">{new Date(r.createdAt).toLocaleDateString()}</time></div>
                  {r.comment && <p className="mt-3 text-sm text-neutral-300">{r.comment}</p>}
                </article>
              ))}
            </div>
            {isClient && (
              <form onSubmit={submitReview} className="card mt-6 space-y-3 p-5">
                <h3 className="font-semibold">{t('writeReview')}</h3>
                <div><span className="label">{t('yourRating')}</span><StarInput value={rv.rating} onChange={(v) => setRv({ ...rv, rating: v })} /></div>
                <textarea className="input" rows={3} maxLength={800} placeholder={t('comment')} value={rv.comment} onChange={(e) => setRv({ ...rv, comment: e.target.value })} />
                {rv.msg && <p role="status" className={`text-sm ${rv.ok ? 'text-gold' : 'text-red-300'}`}>{rv.msg}</p>}
                <button className="btn-gold" disabled={!rv.rating}>{t('submit')}</button>
              </form>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-3 p-5">
            <h2 className="font-display text-xl font-bold">{t('contact')}</h2>
            <div className="grid grid-cols-3 gap-2">
              {b.phone && <a href={`tel:${b.phone}`} className="btn-ghost !px-2">{t('call')}</a>}
              {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-2">{t('whatsapp')}</a>}
              <button className="btn-ghost !px-2" onClick={() => setChat(true)}>{t('chat')}</button>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-xl font-bold">{t('location')}</h2>
            {b.address && <p className="mt-2 text-sm text-neutral-300">{b.address}, {b.city}</p>}
            {b.lat != null && <div className="mt-3"><MapView lat={b.lat} lng={b.lng} height={200} /></div>}
            {dirUrl && <a href={dirUrl} target="_blank" rel="noopener noreferrer" className="btn-gold mt-3 w-full">{t('directions')}</a>}
          </div>

          <div className="card p-5">
            <h2 className="font-display text-xl font-bold">{t('hours')}</h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {DAYS.map((k) => { const h = b.workingHours?.[k]; return (
                <li key={k} className="flex justify-between"><span className="text-neutral-400">{d(k)}</span><span>{!h || h.off ? <span className="text-neutral-500">{t('closed')}</span> : `${h.open} – ${h.close}`}</span></li>
              ); })}
            </ul>
          </div>
        </aside>
      </div>

      {booking && <BookingModal barber={b} initialService={typeof booking === 'string' ? booking : undefined} onClose={() => setBooking(null)} />}
      {chat && (
        <Modal title={`${t('chat')} · ${b.name}`} onClose={() => setChat(false)}>
          {isClient ? <ChatBox withUserId={b.userId} /> : <p className="text-neutral-300">{t('chatLogin')} <Link href="/login" className="text-gold">→</Link></p>}
        </Modal>
      )}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <img src={lightbox.src} alt={lightbox.category} className="max-h-[90vh] max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
