import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';

export default function Footer() {
  const t = useTranslations('footer');
  const n = useTranslations('nav');
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-x flex flex-col justify-between gap-6 py-10 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-lg font-bold">Barber<span className="text-gold">Hub</span></p>
          <p className="mt-1 text-sm text-neutral-400">{t('tagline')}</p>
        </div>
        <div className="flex gap-6 text-sm text-neutral-300">
          <Link href="/explore" className="hover:text-gold">{n('explore')}</Link>
          <Link href="/register" className="hover:text-gold">{t('forBarbers')}</Link>
        </div>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-neutral-500">© {new Date().getFullYear()} BarberHub. {t('rights')}</p>
    </footer>
  );
}
