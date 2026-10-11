import dbConnect from '@/lib/mongoose';
import Booking from '@/models/Booking';
import BarberProfile from '@/models/BarberProfile';
import { fail, json, requireUser } from '@/lib/api';

// PATCH { status } — barber: confirmed | cancelled (reject) · client: cancelled
export async function PATCH(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { status } = await req.json().catch(() => ({}));
  if (!['confirmed', 'cancelled'].includes(status)) return fail('invalid_status');
  await dbConnect();
  const booking = await Booking.findById(params.id);
  if (!booking) return fail('not_found', 404);

  if (user.role === 'barber') {
    const profile = await BarberProfile.findOne({ userId: user.id }).select('_id');
    if (!profile || !booking.barberId.equals(profile._id)) return fail('forbidden', 403);
  } else {
    if (!booking.clientId.equals(user.id)) return fail('forbidden', 403);
    if (status !== 'cancelled') return fail('forbidden', 403);
  }
  if (booking.status === 'cancelled') return fail('already_cancelled', 409);

  booking.status = status;
  if (status === 'cancelled') booking.slotKey = undefined; // frees the slot
  await booking.save();
  return json({ booking });
}
