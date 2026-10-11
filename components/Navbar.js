'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { Link } from '@/lib/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const t = useTranslations('nav');
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: t('home') },
    { href: '/explore', label: t('explore') },
    ...(session ? [{ href: '/dashboard', label: t('dashboard') }] : []),
    ...(session?.user?.role === 'barber' ? [{ href: '/create-profile', label: t('createProfile') }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur">
      <nav className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Barber<span className="text-gold">Hub</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-neutral-300 transition hover:text-gold">{l.label}</Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {status !== 'loading' &&
            (session ? (
              <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-ghost">{t('logout')}</button>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">{t('login')}</Link>
                <Link href="/register" className="btn-gold">{t('register')}</Link>
              </>
            ))}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-ink md:hidden">
          <div className="container-x flex flex-col gap-4 py-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-neutral-200">{l.label}</Link>
            ))}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {session ? (
                <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-ghost">{t('logout')}</button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost">{t('login')}</Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn-gold">{t('register')}</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
