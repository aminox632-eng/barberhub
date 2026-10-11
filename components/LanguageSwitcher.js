'use client';
import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/navigation';
import { locales, localeMeta } from '@/lib/config';

const Flag = ({ code }) => <img src={`https://flagcdn.com/w40/${code}.png`} alt="" width="20" height="14" className="h-3.5 w-5 rounded-sm object-cover" />;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const switchTo = (l) => {
    setOpen(false);
    router.replace(pathname + (typeof window !== 'undefined' ? window.location.search : ''), { locale: l });
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-sm hover:border-gold" aria-haspopup="listbox" aria-expanded={open}>
        <Flag code={localeMeta[locale].flag} />
        <span className="uppercase">{locale}</span>
      </button>
      {open && (
        <ul role="listbox" className="absolute end-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border border-line bg-ink-800 shadow-xl">
          {locales.map((l) => (
            <li key={l}>
              <button onClick={() => switchTo(l)} className={`flex w-full items-center gap-3 px-3 py-2 text-start text-sm hover:bg-ink-700 ${l === locale ? 'text-gold' : ''}`}>
                <Flag code={localeMeta[l].flag} />
                {localeMeta[l].label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
