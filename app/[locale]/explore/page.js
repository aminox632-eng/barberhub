import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import ExploreClient from '@/components/ExploreClient';
import { CardSkeleton } from '@/components/ui';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('exploreTitle'), description: t('exploreDesc') };
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="container-x grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}</div>}>
      <ExploreClient />
    </Suspense>
  );
}
