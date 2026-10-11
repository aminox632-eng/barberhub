import { getBarberById } from '@/lib/barbers';
import { fail, json } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const barber = await getBarberById(params.id);
  if (!barber) return fail('not_found', 404);
  return json(barber);
}
