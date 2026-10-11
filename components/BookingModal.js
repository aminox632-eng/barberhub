'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Link } from '@/lib/navigation';
import Modal from './Modal';
import { formatPrice } from './ui';

const iso = (d) => d.toISOString().slice(0, 10);

export default function BookingModal({ barber, initialService, onClose }) {
  const t = useTranslations('booking');
  const bt = useTranslations('barber');
  const { data: session } = useSession();
  const [service, setService] = useState(initialService || barber.services[0]?.name);
  const [date, setDate] = useState(iso(new Date()));
  const [slots, setSlots] = useState(null);
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const svc = barber.services.find((s) => s.name === service);
  const max = iso(new Date(Date.now() + 60 * 86400000));

  const loadSlots = () => {
    if (!svc) return;
    setSlots(null); setTime('');
    fetch(`/api/barber/${barber._id}/slots?date=${date}&duration=${svc.duration}`).then((r) => r.json()).then((d) => setSlots(d.slots || [])).catch(() => setSlots([]));
  };
  useEffect(loadSlots, [date, service]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    setBusy(true); setMsg({ type: '', text: '' });
    const r = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ barberId: barber._id, service, date, time, notes }) });
    setBusy(false);
    if (r.ok) return setMsg({ type: 'ok', text: t('success') });
    const { error } = await r.json().catch(() => ({}));
    if (error === 'slot_taken') { setMsg({ type: 'err', text: t('taken') }); loadSlots(); }
    else setMsg({ type: 'err', text: error === 'outside_hours' ? t('outside') : t('onlyClients') });
  };

  if (!session || session.user.role !== 'client') {
    return (
      <Modal title={t('title')} onClose={onClose}>
        <p className="text-neutral-300">{session ? t('onlyClients') : t('loginFirst')}</p>
        {!session && <Link href="/login" className="btn-gold mt-5 w-full">{t('loginFirst')}</Link>}
      </Modal>
    );
  }

  return (
    <Modal title={t('title')} onClose={onClose}>
      {msg.type === 'ok' ? (
        <div className="space-y-5">
          <p className="rounded-md border border-gold/40 bg-gold/10 p-4 text-gold">{msg.text}</p>
          <Link href="/dashboard" className="btn-gold w-full">{t('close')}</Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="svc">{t('service')}</label>
            <select id="svc" className="input" value={service} onChange={(e) => setService(e.target.value)}>
              {barber.services.map((s) => <option key={s.name} value={s.name}>{s.name} · {s.duration} {bt('min')} · {formatPrice(s.price, barber.currency)}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="date">{t('date')}</label>
            <input id="date" type="date" className="input" min={iso(new Date())} max={max} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
          </div>
          <div>
            <span className="label">{t('time')}</span>
            {slots == null ? <div className="skeleton h-10" /> : slots.length === 0 ? <p className="text-sm text-neutral-400">{t('noSlots')}</p> : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((s) => <button key={s} onClick={() => setTime(s)} className={`chip !py-2 text-center ${time === s ? 'chip-on' : 'hover:border-gold'}`}>{s}</button>)}
              </div>
            )}
          </div>
          <div>
            <label className="label" htmlFor="notes">{t('notes')}</label>
            <textarea id="notes" rows={2} maxLength={500} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {msg.type === 'err' && <p role="alert" className="text-sm text-red-300">{msg.text}</p>}
          <div className="flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm text-neutral-400">{t('total')}: <b className="text-lg text-gold">{svc && formatPrice(svc.price, barber.currency)}</b></span>
            <button className="btn-gold" disabled={!time || busy} onClick={submit}>{time ? t('confirm') : t('pickSlot')}</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
