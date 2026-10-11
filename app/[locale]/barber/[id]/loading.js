import { Skeleton } from '@/components/ui';

export default function Loading() {
  return (
    <div className="container-x py-8">
      <Skeleton className="h-56 w-full sm:h-72" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div>
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
