'use client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { DAYS, CATEGORIES, SKILLS } from '@/lib/config';
import ImageInput, { fileToDataUrl } from './ImageInput';
import MapView from './MapView';
import { formatPrice, placeholderSrc } from './ui';
import { Tabs, BookingRow, useBookings, Conversations, todayStr } from './dashShared';

function Stat({ label, value }) {
  return <div className="card p-5"><p className="font-display text-3xl font-bold text-gold">{value}</p><p className="mt-1 text-sm text-neutral-400">{label}</p></div>;
}

function BookingsTab() {
  const t = useTranslations('dash');
  const { bookings, setStatus } = useBookings();
  const [cur, setCur] = useState('USD');
  const calc = useMemo(() => {
    if (!bookings) return null;
    const month = todayStr().slice(0, 7);
    const ok = bookings.filter((b) => b.status === 'confirmed');
    return {
      total: ok.reduce((s, b) => s + b.totalPrice, 0),
      month: ok.filter((b) => b.date.startsWith(month)).reduce((s, b) => s + b.totalPrice, 0),
      pending: bookings.filter((b) => b.status === 'pending' && b.date >= todayStr()).length,
      count: bookings.filter((b) => b.status !== 'cancelled').length,
      currency: bookings[0]?.currency || 'USD',
    };
  }, [bookings]);
  if (!bookings) return <div className="skeleton h-40" />;
  const up = bookings.filter((b) => b.date >= todayStr() && b.status !== 'cancelled');
  const past = bookings.filter((b) => !(b.date >= todayStr() && b.status !== 'cancelled')).reverse();
  const row = (b) => <BookingRow key={b._id} b={b} role="barber" who={b.client?.name || t('client')} onStatus={setStatus} />;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label={t('thisMonth')} value={formatPrice(calc.month, calc.currency)} />
        <Stat label={t('earnings') + ' · ' + t('total')} value={formatPrice(calc.total, calc.currency)} />
        <Stat label={t('pendingCount')} value={calc.pending} />
        <Stat label={t('bookings')} value={calc.count} />
      </div>
      {bookings.length === 0 && <p className="text-neutral-400">{t('emptyBookings')}</p>}
      {up.length > 0 && <section><h2 className="mb-3 font-display text-xl font-bold">{t('upcoming')}</h2><ul className="space-y-3">{up.map(row)}</ul></section>}
      {past.length > 0 && <section><h2 className="mb-3 font-display text-xl font-bold">{t('past')}</h2><ul className="space-y-3 opacity-80">{past.map(row)}</ul></section>}
    </div>
  );
}

export function ProfileTab({ onSaved, saveLabel }) {
  const t = useTranslations('dash');
  const d = useTranslations('days');
  const c = useTranslations('cats');
  const a = useTranslations('auth');
  const [p, setP] = useState(null);
  const [state, setState] = useState('');
  const [newCat, setNewCat] = useState('Fade');

  useEffect(() => { fetch('/api/barber/me').then((r) => r.json()).then(setP).catch(() => {}); }, []);
  if (!p) return <div className="skeleton h-64" />;
  const set = (k, v) => { setP((s) => ({ ...s, [k]: v })); setState(''); };
  const setSvc = (i, k, v) => set('services', p.services.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  const setDay = (k, patch) => set('workingHours', { ...p.workingHours, [k]: { ...p.workingHours[k], ...patch } });

  const addPhoto = async (e) => {
    const files = [...(e.target.files || [])];
    const urls = await Promise.all(files.map((f) => fileToDataUrl(f, 900)));
    set('portfolio', [...p.portfolio, ...urls.map((url) => ({ url, category: newCat }))]);
    e.target.value = '';
  };

  const save = async () => {
    setState('…');
    const r = await fetch('/api/barber/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
    setState(r.ok ? t('saved') : '!');
    if (r.ok) { const fresh = await r.json(); setP(fresh); onSaved?.(fresh); }
  };

  return (
    <div className="max-w-3xl space-y-10">
      <section className="grid gap-5 sm:grid-cols-[140px_1fr]">
        <ImageInput label={t('avatar')} value={p.avatar} onChange={(v) => set('avatar', v)} max={400} round />
        <ImageInput label={t('cover')} value={p.cover} onChange={(v) => set('cover', v)} max={1400} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">{a('name')}</label><input className="input" value={p.name} onChange={(e) => set('name', e.target.value)} /></div>
        <div><label className="label">{t('years')}</label><input type="number" min="0" className="input" value={p.yearsExperience} onChange={(e) => set('yearsExperience', e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">{t('bio')}</label><textarea rows={4} maxLength={1500} className="input" value={p.bio} onChange={(e) => set('bio', e.target.value)} /></div>
        <div><label className="label">{a('phone')}</label><input className="input" value={p.phone} onChange={(e) => set('phone', e.target.value)} /></div>
        <div><label className="label">{t('whatsappNum')}</label><input className="input" value={p.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} /></div>
        <div><label className="label">{a('country')}</label><input className="input" value={p.country} onChange={(e) => set('country', e.target.value)} /></div>
        <div><label className="label">{a('city')}</label><input className="input" value={p.city} onChange={(e) => set('city', e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">{t('address')}</label><input className="input" value={p.address} onChange={(e) => set('address', e.target.value)} /></div>
      </section>

      <section>
        <h3 className="font-display text-xl font-bold">{t('location')}</h3>
        <p className="mb-3 text-sm text-neutral-400">{t('clickMap')}</p>
        <MapView lat={p.lat} lng={p.lng} height={300} onPick={(lat, lng) => setP((s) => ({ ...s, lat, lng }))} />
      </section>

      <section>
        <h3 className="mb-3 font-display text-xl font-bold">{t('services')}</h3>
        <div className="space-y-2">
          {p.services.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_90px_90px_auto] gap-2">
              <input className="input" placeholder={t('serviceName')} value={s.name} onChange={(e) => setSvc(i, 'name', e.target.value)} aria-label={t('serviceName')} />
              <input type="number" min="0" className="input" placeholder={t('price')} value={s.price} onChange={(e) => setSvc(i, 'price', e.target.value)} aria-label={t('price')} />
              <input type="number" min="10" step="5" className="input" placeholder={t('duration')} value={s.duration} onChange={(e) => setSvc(i, 'duration', e.target.value)} aria-label={t('duration')} />
              <button className="btn-danger !px-3" onClick={() => set('services', p.services.filter((_, j) => j !== i))} aria-label={t('remove')}>×</button>
            </div>
          ))}
        </div>
        <button className="btn-ghost mt-3" onClick={() => set('services', [...p.services, { name: '', price: 0, duration: 30 }])}>+ {t('addService')}</button>
      </section>

      <section>
        <h3 className="mb-3 font-display text-xl font-bold">{t('skills')}</h3>
        <div className="flex flex-wrap gap-2">
          {[...new Set([...SKILLS, ...p.skills])].map((s) => <button key={s} onClick={() => set('skills', p.skills.includes(s) ? p.skills.filter((x) => x !== s) : [...p.skills, s])} className={`chip ${p.skills.includes(s) ? 'chip-on' : ''}`}>{s}</button>)}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-xl font-bold">{t('hours')}</h3>
        <div className="space-y-2">
          {DAYS.map((k) => { const h = p.workingHours[k]; return (
            <div key={k} className="grid grid-cols-[110px_1fr_1fr_auto] items-center gap-2 text-sm">
              <span>{d(k)}</span>
              <input type="time" className="input" disabled={h.off} value={h.open} onChange={(e) => setDay(k, { open: e.target.value })} aria-label={t('open')} />
              <input type="time" className="input" disabled={h.off} value={h.close} onChange={(e) => setDay(k, { close: e.target.value })} aria-label={t('closeAt')} />
              <label className="flex items-center gap-1.5 text-neutral-400"><input type="checkbox" className="accent-[#D4AF37]" checked={!!h.off} onChange={(e) => setDay(k, { off: e.target.checked })} />{t('closedDay')}</label>
            </div>
          ); })}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-xl font-bold">{t('portfolio')}</h3>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select className="input !w-40" value={newCat} onChange={(e) => setNewCat(e.target.value)} aria-label={t('category')}>{CATEGORIES.map((k) => <option key={k} value={k}>{c(k)}</option>)}</select>
          <label className="btn-ghost cursor-pointer">+ {t('addPhoto')}<input type="file" accept="image/*" multiple hidden onChange={addPhoto} /></label>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {p.portfolio.map((ph, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-line">
              <img src={ph.url || placeholderSrc(c(ph.category), i)} alt="" className="h-full w-full object-cover" />
              <span className="absolute bottom-1 start-1 rounded bg-ink/80 px-1.5 py-0.5 text-xs">{c(ph.category)}</span>
              <button onClick={() => set('portfolio', p.portfolio.filter((_, j) => j !== i))} className="absolute end-1 top-1 rounded-full bg-ink/80 px-2 text-lg leading-6 hover:text-red-400" aria-label={t('remove')}>×</button>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 flex items-center gap-4 rounded-xl border border-line bg-ink/95 p-3 backdrop-blur">
        <button className="btn-gold" onClick={save}>{saveLabel || t('save')}</button>
        <span role="status" className="text-sm text-gold">{state}</span>
        <Link href={`/barber/${p._id}`} className="ms-auto text-sm text-neutral-400 hover:text-gold">/barber/{p._id.slice(-6)}</Link>
      </div>
    </div>
  );
}

export default function BarberDashboard({ user }) {
  const t = useTranslations('dash');
  const [tab, setTab] = useState('bookings');
  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold">{t('welcome')}, {user.name}</h1>
      <div className="mt-6"><Tabs value={tab} onChange={setTab} tabs={[['bookings', t('bookings')], ['profile', t('profile')], ['messages', t('messages')]]} /></div>
      <div className="mt-6">
        {tab === 'bookings' && <BookingsTab />}
        {tab === 'profile' && <ProfileTab />}
        {tab === 'messages' && <Conversations />}
      </div>
    </div>
  );
}
