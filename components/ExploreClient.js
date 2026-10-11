'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import BarberCard from './BarberCard';
import { CardSkeleton } from './ui';

const SERVICES = ['Classic Cut', 'Fade', 'Beard', 'Kids', 'Color', 'Shave'];

export default function ExploreClient() {
  const t = useTranslations('explore');
  const sp = useSearchParams();
  const [f, setF] = useState({
    q: sp.get('q') || '', country: sp.get('country') || '', city: sp.get('city') || '', minRating: '', minPrice: '', maxPrice: '',
    service: '', availableToday: false, distance: '', sort: 'rating',
  });
  const [geo, setGeo] = useState(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [locations, setLocations] = useState([]);
  const [data, setData] = useState({ barbers: null, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch('/api/locations').then((r) => r.json()).then((d) => setLocations(d.countries || [])).catch(() => {});
  }, []);

  const cities = useMemo(() => locations.find((c) => c.name === f.country)?.cities || [], [locations, f.country]);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v, ...(k === 'country' ? { city: '' } : {}) }));

  const locate = () => {
    if (!navigator.geolocation) return;
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setGeo({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoBusy(false); setF((s) => ({ ...s, sort: 'nearest', distance: s.distance || '25' })); },
      () => setGeoBusy(false),
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    const p = new URLSearchParams();
    if (f.q) p.set('q', f.q);
    ['country', 'city', 'minRating', 'minPrice', 'maxPrice', 'service', 'sort'].forEach((k) => f[k] && p.set(k, f[k]));
    if (f.availableToday) p.set('availableToday', '1');
    if (geo) { p.set('lat', geo.lat); p.set('lng', geo.lng); if (f.distance) p.set('distance', f.distance); }
    const ctrl = new AbortController();
    const id = setTimeout(() => {
      setData((d) => ({ ...d, barbers: null }));
      fetch(`/api/barbers?${p}`, { signal: ctrl.signal }).then((r) => r.json()).then((d) => setData({ barbers: d.barbers || [], total: d.total || 0 })).catch(() => {});
    }, 300);
    return () => { clearTimeout(id); ctrl.abort(); };
  }, [f, geo]);

  const reset = () => { setGeo(null); setF({ q: '', country: '', city: '', minRating: '', minPrice: '', maxPrice: '', service: '', availableToday: false, distance: '', sort: 'rating' }); };

  const Filters = (
    <div className="space-y-5">
      <div>
        <label className="label" htmlFor="country">{t('country')}</label>
        <select id="country" className="input" value={f.country} onChange={(e) => set('country', e.target.value)}>
          <option value="">{t('allCountries')}</option>
          {locations.map((c) => <option key={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="city">{t('city')}</label>
        <select id="city" className="input" value={f.city} onChange={(e) => set('city', e.target.value)} disabled={!f.country}>
          <option value="">{t('allCities')}</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="rating">{t('rating')}</label>
        <select id="rating" className="input" value={f.minRating} onChange={(e) => set('minRating', e.target.value)}>
          <option value="">{t('any')}</option>
          {[4.5, 4, 3.5, 3].map((r) => <option key={r} value={r}>{r}+ ★</option>)}
        </select>
      </div>
      <div>
        <span className="label">{t('price')}</span>
        <div className="flex gap-2">
          <input type="number" min="0" className="input" placeholder={t('minPrice')} value={f.minPrice} onChange={(e) => set('minPrice', e.target.value)} aria-label={t('minPrice')} />
          <input type="number" min="0" className="input" placeholder={t('maxPrice')} value={f.maxPrice} onChange={(e) => set('maxPrice', e.target.value)} aria-label={t('maxPrice')} />
        </div>
      </div>
      <div>
        <span className="label">{t('service')}</span>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => set('service', '')} className={`chip ${!f.service ? 'chip-on' : ''}`}>{t('serviceAny')}</button>
          {SERVICES.map((s) => <button key={s} onClick={() => set('service', f.service === s ? '' : s)} className={`chip ${f.service === s ? 'chip-on' : ''}`}>{s}</button>)}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-3 text-sm">
        <input type="checkbox" className="h-4 w-4 accent-[#D4AF37]" checked={f.availableToday} onChange={(e) => set('availableToday', e.target.checked)} />
        {t('availableToday')}
      </label>
      <div>
        <button onClick={locate} disabled={geoBusy} className={`btn-ghost w-full ${geo ? '!border-gold !text-gold' : ''}`}>{geoBusy ? t('locating') : t('nearMe')}</button>
        {geo && (
          <div className="mt-3">
            <label className="label" htmlFor="dist">{t('distance')}: {f.distance || 25} km</label>
            <input id="dist" type="range" min="1" max="100" value={f.distance || 25} onChange={(e) => set('distance', e.target.value)} className="w-full accent-[#D4AF37]" />
          </div>
        )}
      </div>
      <button onClick={reset} className="text-sm text-neutral-400 underline hover:text-gold">{t('clear')}</button>
    </div>
  );

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('title')}</h1>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input value={f.q} onChange={(e) => set('q', e.target.value)} placeholder={t('search')} className="input !py-3" aria-label={t('search')} />
        <select className="input sm:!w-52" value={f.sort} onChange={(e) => (e.target.value === 'nearest' && !geo ? locate() : set('sort', e.target.value))} aria-label={t('sort')}>
          <option value="rating">{t('sortRating')}</option>
          <option value="nearest">{t('sortNearest')}</option>
          <option value="cheapest">{t('sortCheapest')}</option>
        </select>
        <button className="btn-ghost lg:hidden" onClick={() => setShowFilters(!showFilters)}>{t('filters')}</button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}><div className="card p-5 lg:sticky lg:top-24">{Filters}</div></aside>
        <section>
          <p className="mb-4 text-sm text-neutral-400" aria-live="polite">{data.barbers ? `${data.total} ${t('results')}` : '\u00A0'}</p>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {data.barbers == null ? Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />) : data.barbers.map((b) => <BarberCard key={b._id} b={b} />)}
          </div>
          {data.barbers && data.barbers.length === 0 && <p className="card mt-4 p-8 text-center text-neutral-300">{t('none')}</p>}
        </section>
      </div>
    </div>
  );
}
