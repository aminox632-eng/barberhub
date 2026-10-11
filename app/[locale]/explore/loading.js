import { CardSkeleton } from '@/components/ui';

export default function Loading() {
  return <div className="container-x grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}</div>;
}
