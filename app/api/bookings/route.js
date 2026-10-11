import dbConnect from '@/lib/mongoose';
import Booking from '@/models/Booking';
import BarberProfile from '@/models/BarberProfile';
import '@/models/User';
import { fail, json, requireUser, toMin, dayKeyOf, isValidDate, todayStr } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;
  await dbConnect();
  if (user.role === 'barber') {
    const profile = await BarberProfile.findOne({ userId: user.id }).select('_id');
    if (!profile) return json({ bookings: [] });
    const bookings = await Booking.find({ barberId: profile._id }).sort({ date: 1, time: 1 }).populate('clientId', 'name phone email').lean();
    return json({ bookings: bookings.map((b) => ({ ...b, client: b.clientId, clientId: b.clientId?._id })) });
  }
  const bookings = await Booking.find({ clientId: user.id }).sort({ date: -1, time: -1 }).populate({ path: 'barberId', select: 'city country userId', populate: { path: 'userId', select: 'name' } }).lean();
  return json({
    bookings: bookings.map((b) => ({ ...b, barber: { _id: b.barberId?._id, name: b.barberId?.userId?.name, city: b.barberId?.city, country: b.barberId?.country }, barberId: b.barberId?._id })),
  });
}

// POST /api/bookings { barberId, service, date, time, notes }
export async function POST(req) {
  const { user, error } = await requireUser('client');
  if (error) return error;
  const b = await req.json().catch(() => ({}));
  if (!/^[a-f\d]{24}$/i.test(b.barberId || '') || !isValidDate(b.date) || !/^\d{2}:\d{2}$/.test(b.time || '')) return fail('invalid_input');
  if (b.date < todayStr()) return fail('past_date');

  await dbConnect();
  const barber = await BarberProfile.findById(b.barberId).lean();
  if (!barber) return fail('not_found', 404);
  const service = barber.services.find((s) => s.name === b.service);
  if (!service) return fail('invalid_service');

  const hrs = barber.workingHours?.[dayKeyOf(b.date)];
  const startMin = toMin(b.time);
  const endMin = startMin + service.duration;
  if (!hrs || hrs.off || startMin < toMin(hrs.open) || endMin > toMin(hrs.close)) return fail('outside_hours');

  // 1) Overlap check (covers bookings of different lengths)
  const clash = await Booking.exists({ barberId: b.barberId, date: b.date, status: { $ne: 'cancelled' }, startMin: { $lt: endMin }, endMin: { $gt: startMin } });
  if (clash) return fail('slot_taken', 409);

  try {
    // 2) Unique slotKey index guarantees no double booking even under concurrent requests
    const booking = await Booking.create({
      clientId: user.id, barberId: b.barberId, service: service.name, duration: service.duration,
      date: b.date, time: b.time, startMin, endMin, totalPrice: service.price, currency: barber.currency,
      notes: String(b.notes || '').slice(0, 500), status: 'pending', slotKey: `${b.barberId}_${b.date}_${startMin}`,
    });
    return json({ booking }, 201);
  } catch (e) {
    if (e?.code === 11000) return fail('slot_taken', 409);
    console.error(e);
    return fail('server_error', 500);
  }
}
