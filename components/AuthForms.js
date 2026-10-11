'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';
import { Link, useRouter } from '@/lib/navigation';

const Shell = ({ title, children }) => (
  <div className="container-x flex justify-center py-14">
    <div className="card w-full max-w-md p-7 sm:p-9">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <div className="mt-6">{children}</div>
    </div>
  </div>
);
const Err = ({ msg }) => (msg ? <p role="alert" className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">{msg}</p> : null);
const Field = ({ label, id, ...p }) => (
  <div>
    <label className="label" htmlFor={id}>{label}</label>
    <input id={id} className="input" {...p} />
  </div>
);

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [v, setV] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const res = await signIn('credentials', { email: v.email, password: v.password, redirect: false });
    setBusy(false);
    if (res?.error) return setErr(t('errInvalid'));
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <Shell title={t('loginTitle')}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t('email')} id="email" type="email" required autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
        <Field label={t('password')} id="password" type="password" required autoComplete="current-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} />
        <Err msg={err} />
        <button className="btn-gold w-full" disabled={busy}>{t('submitLogin')}</button>
        <div className="flex justify-between text-sm text-neutral-400">
          <Link href="/forgot-password" className="hover:text-gold">{t('forgot')}</Link>
          <span>{t('noAccount')} <Link href="/register" className="text-gold">{t('submitRegister')}</Link></span>
        </div>
      </form>
    </Shell>
  );
}

export function RegisterForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const sp = useSearchParams();
  const [role, setRole] = useState(sp.get('role') === 'barber' ? 'barber' : 'client');
  const [v, setV] = useState({ name: '', email: '', password: '', phone: '', country: '', city: '' });
  const [other, setOther] = useState(false);
  const [locations, setLocations] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetch('/api/locations').then((r) => r.json()).then((d) => setLocations(d.countries || [])).catch(() => {}); }, []);
  const cities = locations.find((c) => c.name === v.country)?.cities || [];

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...v, role }) });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      setBusy(false);
      return setErr(error === 'email_exists' ? t('errExists') : error === 'weak_password' ? t('errWeak') : t('errGeneric'));
    }
    await signIn('credentials', { email: v.email, password: v.password, redirect: false });
    router.push(role === 'barber' ? '/create-profile' : '/dashboard');
    router.refresh();
  };

  return (
    <Shell title={t('registerTitle')}>
      <form onSubmit={submit} className="space-y-4">
        <fieldset>
          <legend className="label">{t('role')}</legend>
          <div className="grid grid-cols-2 gap-3">
            {['barber', 'client'].map((r) => (
              <button type="button" key={r} onClick={() => setRole(r)} aria-pressed={role === r} className={`rounded-lg border p-4 text-sm font-semibold transition ${role === r ? 'border-gold bg-gold/10 text-gold' : 'border-line hover:border-neutral-500'}`}>
                {r === 'barber' ? t('iamBarber') : t('iamClient')}
              </button>
            ))}
          </div>
        </fieldset>
        <Field label={t('name')} id="name" required autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
        <Field label={t('email')} id="email" type="email" required autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
        <Field label={t('password')} id="password" type="password" minLength={8} required autoComplete="new-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} />
        {role === 'barber' && (
          <>
            <Field label={t('phone')} id="phone" type="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} />
            <div>
              <label className="label" htmlFor="country">{t('country')}</label>
              <select id="country" required className="input" value={v.country} onChange={(e) => { setV({ ...v, country: e.target.value, city: '' }); setOther(false); }}>
                <option value="">{t('selectCountry')}</option>
                {locations.map((c) => <option key={c.name}>{c.name}</option>)}
              </select>
            </div>
            {v.country && (
              <div>
                <label className="label" htmlFor="city">{t('city')}</label>
                {!other ? (
                  <select id="city" required className="input" value={v.city} onChange={(e) => (e.target.value === '__other' ? (setOther(true), setV({ ...v, city: '' })) : setV({ ...v, city: e.target.value }))}>
                    <option value="" />
                    {cities.map((c) => <option key={c}>{c}</option>)}
                    <option value="__other">{t('otherCity')}</option>
                  </select>
                ) : (
                  <input id="city" required className="input" autoFocus value={v.city} onChange={(e) => setV({ ...v, city: e.target.value })} />
                )}
              </div>
            )}
          </>
        )}
        <Err msg={err} />
        <button className="btn-gold w-full" disabled={busy}>{t('submitRegister')}</button>
        <p className="text-center text-sm text-neutral-400">{t('haveAccount')} <Link href="/login" className="text-gold">{t('submitLogin')}</Link></p>
      </form>
    </Shell>
  );
}

export function ForgotForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, locale }) });
    setDone(await r.json().catch(() => ({ ok: true })));
  };
  return (
    <Shell title={t('forgotTitle')}>
      {done ? (
        <div className="space-y-3 text-sm text-neutral-300">
          <p>{t('linkSent')}</p>
          {done.devLink && <p className="break-all text-xs text-gold">{t('devLink')} <a href={done.devLink} className="underline">{done.devLink}</a></p>}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-neutral-400">{t('forgotD')}</p>
          <Field label={t('email')} id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn-gold w-full">{t('sendLink')}</button>
        </form>
      )}
    </Shell>
  );
}

export function ResetForm() {
  const t = useTranslations('auth');
  const token = useSearchParams().get('token') || '';
  const [password, setPassword] = useState('');
  const [state, setState] = useState({ done: false, err: '' });
  const submit = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
    setState(r.ok ? { done: true, err: '' } : { done: false, err: t('errToken') });
  };
  return (
    <Shell title={t('resetTitle')}>
      {state.done ? (
        <p className="text-sm text-neutral-300">{t('resetDone')} <Link href="/login" className="text-gold">{t('submitLogin')}</Link></p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label={t('newPassword')} id="pw" type="password" minLength={8} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Err msg={state.err} />
          <button className="btn-gold w-full">{t('resetBtn')}</button>
        </form>
      )}
    </Shell>
  );
}
