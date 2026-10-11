'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/lib/navigation';
import { ProfileTab } from './BarberDashboard';
import { Skeleton } from './ui';

export default function CreateProfileClient() {
  const t = useTranslations('dash');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/register?role=barber');
    if (status === 'authenticated' && session.user.role !== 'barber') router.replace('/dashboard');
  }, [status, session, router]);

  if (status !== 'authenticated' || session.user.role !== 'barber') {
    return <div className="container-x space-y-4 py-10"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-64 w-full" /></div>;
  }
  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('createTitle')}</h1>
      <p className="mt-2 max-w-2xl text-neutral-400">{t('createSub')}</p>
      <div className="mt-8">
        <ProfileTab saveLabel={t('publish')} onSaved={(p) => router.push(`/barber/${p._id}`)} />
      </div>
    </div>
  );
}
