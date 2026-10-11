import dbConnect from '@/lib/mongoose';
import BarberProfile from '@/models/BarberProfile';
import { LOCATIONS } from '@/data/locations';
import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';

// Country > City tree: static catalogue + any city a barber has registered anywhere in the world
export async function GET() {
  const map = new Map(LOCATIONS.map((c) => [c.name, new Set(c.cities.map((x) => x[0]))]));
  try {
    await dbConnect();
    const pairs = await BarberProfile.aggregate([{ $group: { _id: { country: '$country', city: '$city' } } }]);
    pairs.forEach(({ _id }) => {
      if (!map.has(_id.country)) map.set(_id.country, new Set());
      map.get(_id.country).add(_id.city);
    });
  } catch {}
  const countries = [...map.entries()].map(([name, cities]) => ({ name, cities: [...cities].sort() })).sort((a, b) => a.name.localeCompare(b.name));
  return json({ countries });
}
