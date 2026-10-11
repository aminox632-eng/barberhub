'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link, useRouter } from '@/lib/navigation';
import BarberCard from './BarberCard';
import { CardSkeleton } from './ui';

const CITIES = ['Casablanca', 'Paris', 'New York', 'London', 'Dubai', 'Berlin'];
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

export default function HomeClient() {
  const t = useTranslations();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [stats, setStats] = useState(null);
  const [barbers, setBarbers] = useState(null);

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setStats).catch(() => setStats({}));
    fetch('/api/barbers?limit=6&sort=rating').then((r) => r.json()).then((d) => setBarbers(d.barbers || [])).catch(() => setBarbers([]));
  }, []);

  const submit = (e) => {
    e.preventDefault();
    router.push(`/explore${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
  };

  const statItems = [
    ['barbers', stats?.barbers], ['bookings', stats?.bookings], ['cities', stats?.cities], ['clients', stats?.clients],
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="container-x grid items-center gap-10 py-16 md:grid-cols-[1fr_auto] md:py-28">
          <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.12 }}>
            <motion.h1 variants={item} className="max-w-3xl font-display text-4xl font-bold leading-[1.08] sm:text-6xl">{t('hero.title')}</motion.h1>
            <motion.p variants={item} className="mt-6 max-w-xl text-lg text-neutral-300">{t('hero.subtitle')}</motion.p>
            <motion.form variants={item} onSubmit={submit} className="mt-8 flex max-w-xl gap-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('hero.placeholder')} className="input !py-3.5" aria-label={t('hero.search')} />
              <button className="btn-gold shrink-0 !px-6">{t('hero.search')}</button>
            </motion.form>
            <motion.div variants={item} className="mt-5 flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <Link key={c} href={`/explore?city=${encodeURIComponent(c)}`} className="chip transition hover:border-gold hover:text-gold">{c}</Link>
              ))}
            </motion.div>
          </motion.div>

          <div className="hidden justify-self-center md:block" aria-hidden="true">
            <div className="relative h-80 w-24 overflow-hidden rounded-full border-4 border-gold">
              <div className="pole absolute inset-0" />
              <div className="absolute inset-y-0 start-3 w-3 rounded-full bg-white/20 blur-[2px]" />
            </div>
            <div className="mx-auto h-3 w-28 rounded-sm bg-gold" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-line">
        <dl className="container-x grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {statItems.map(([k, v]) => (
            <div key={k}>
              <dd className="font-display text-4xl font-bold text-gold">{v == null ? '…' : Number(v).toLocaleString()}</dd>
              <dt className="mt-1 text-sm text-neutral-400">{t(`stats.${k}`)}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* FEATURED */}
      <section className="container-x pt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold">{t('home.featured')}</h2>
            <p className="mt-1 text-neutral-400">{t('home.featuredSub')}</p>
          </div>
          <Link href="/explore" className="btn-ghost shrink-0">{t('home.viewAll')}</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {barbers == null ? Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />) : barbers.map((b) => <BarberCard key={b._id} b={b} />)}
        </div>
      </section>

      {/* HOW IT WORKS (a real sequence, so numbered) */}
      <section className="container-x pt-24">
        <h2 className="font-display text-3xl font-bold">{t('home.how')}</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <li key={n} className="card p-6">
              <span className="font-display text-3xl text-gold">{n}</span>
              <h3 className="mt-3 text-lg font-semibold">{t(`home.s${n}t`)}</h3>
              <p className="mt-2 text-sm text-neutral-400">{t(`home.s${n}d`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* BARBER CTA */}
      <section className="container-x pt-24">
        <div className="card flex flex-col items-start justify-between gap-6 border-gold/40 p-8 md:flex-row md:items-center md:p-12">
          <div>
            <h2 className="font-display text-3xl font-bold">{t('home.barberCta')}</h2>
            <p className="mt-2 max-w-xl text-neutral-300">{t('home.barberCtaD')}</p>
          </div>
          <Link href="/register?role=barber" className="btn-gold shrink-0 !px-7 !py-3.5">{t('home.barberCtaBtn')}</Link>
        </div>
      </section>
    </>
  );
}
