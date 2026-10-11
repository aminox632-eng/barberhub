import { notFound } from 'next/navigation';
import BarberProfileView from '@/components/BarberProfileView';
import { getBarberById } from '@/lib/barbers';

export const dynamic = 'force-dynamic';

const load = async (id) => { try { return await getBarberById(id); } catch { return null; } };

export async function generateMetadata({ params: { id } }) {
  const b = await load(id);
  if (!b) return {};
  const desc = (b.bio || `${b.name} – ${b.city}, ${b.country}`).slice(0, 160);
  return { title: `${b.name} – ${b.city}, ${b.country}`, description: desc, openGraph: { title: `${b.name} | BarberHub`, description: desc, images: b.cover && !b.cover.startsWith('data:') ? [b.cover] : [] } };
}

export default async function BarberPage({ params: { id } }) {
  const barber = await load(id);
  if (!barber) notFound();
  const ld = {
    '@context': 'https://schema.org', '@type': 'HairSalon', name: barber.name, description: barber.bio,
    address: { '@type': 'PostalAddress', streetAddress: barber.address, addressLocality: barber.city, addressCountry: barber.country },
    ...(barber.lat != null && { geo: { '@type': 'GeoCoordinates', latitude: barber.lat, longitude: barber.lng } }),
    ...(barber.reviewCount > 0 && { aggregateRating: { '@type': 'AggregateRating', ratingValue: barber.rating, reviewCount: barber.reviewCount } }),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <BarberProfileView barber={barber} />
    </>
  );
}
