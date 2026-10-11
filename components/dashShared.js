'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import ChatBox from './ChatBox';
import { formatPrice } from './ui';

export const todayStr = () => new Date().toISOString().slice(0, 10);

export function Tabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map(([k, label]) => (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${value === k ? 'border-gold text-gold' : 'border-transparent text-neutral-400 hover:text-white'}`}>{label}</button>
      ))}
    </div>
  );
}

const badge = { pending: 'border-yellow-700 text-yellow-300', confirmed: 'border-emerald-700 text-emerald-300', cancelled: 'border-neutral-700 text-neutral-400' };

export function BookingRow({ b, who, role, onStatus }) {
  const t = useTranslations('dash');
  const upcoming = b.date >= todayStr() && b.status !== 'cancelled';
  return (
    <li className="card flex flex-wrap items-center justify-between gap-4 p-4">
      <div className="min-w-0">
        <p className="font-semibold">{b.service} <span className="font-normal text-neutral-400">· {who}</span></p>
        <p className="mt-0.5 text-sm text-neutral-400">{b.date} · {b.time} ({b.duration} min)</p>
        {b.notes && <p className="mt-1 text-sm italic text-neutral-500">“{b.notes}”</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <b className="text-gold">{formatPrice(b.totalPrice, b.currency)}</b>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs ${badge[b.status]}`}>{t(`status_${b.status}`)}</span>
        {upcoming && role === 'barber' && b.status === 'pending' && <button className="btn-gold !py-1.5" onClick={() => onStatus(b._id, 'confirmed')}>{t('accept')}</button>}
        {upcoming && role === 'barber' && <button className="btn-danger !py-1.5" onClick={() => onStatus(b._id, 'cancelled')}>{b.status === 'pending' ? t('reject') : t('cancel')}</button>}
        {upcoming && role === 'client' && <button className="btn-danger !py-1.5" onClick={() => onStatus(b._id, 'cancelled')}>{t('cancel')}</button>}
      </div>
    </li>
  );
}

export function useBookings() {
  const [bookings, setBookings] = useState(null);
  const load = () => fetch('/api/bookings').then((r) => r.json()).then((d) => setBookings(d.bookings || [])).catch(() => setBookings([]));
  useEffect(() => { load(); }, []);
  const setStatus = async (id, status) => {
    await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };
  return { bookings, setStatus };
}

export function Conversations() {
  const t = useTranslations('dash');
  const [list, setList] = useState(null);
  const [sel, setSel] = useState(null);
  useEffect(() => { fetch('/api/messages').then((r) => r.json()).then((d) => setList(d.conversations || [])).catch(() => setList([])); }, []);
  if (list == null) return <div className="skeleton h-40" />;
  if (!list.length) return <p className="text-neutral-400">{t('emptyMessages')}</p>;
  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <ul className="card divide-y divide-line self-start">
        {list.map((c) => (
          <li key={c.userId}><button onClick={() => setSel(c)} className={`w-full p-3 text-start hover:bg-ink-700 ${sel?.userId === c.userId ? 'text-gold' : ''}`}><p className="font-semibold">{c.name}</p><p className="truncate text-sm text-neutral-400">{c.last}</p></button></li>
        ))}
      </ul>
      {sel ? <ChatBox key={sel.userId} withUserId={sel.userId} height={420} /> : <p className="text-neutral-400">{t('selectConv')}</p>}
    </div>
  );
}
