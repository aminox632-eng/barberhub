'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/lib/navigation';
import BarberDashboard from './BarberDashboard';
import ClientDashboard from './ClientDashboard';
import { Skeleton } from './ui';

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => { if (status === 'unauthenticated') router.replace('/login'); }, [status, router]);

  if (status !== 'authenticated') {
    return <div className="container-x space-y-4 py-10"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }
  return session.user.role === 'barber' ? <BarberDashboard user={session.user} /> : <ClientDashboard user={session.user} />;
}
