import dbConnect from '@/lib/mongoose';
import BarberProfile from '@/models/BarberProfile';
import Booking from '@/models/Booking';
import { fail, json, toMin, fromMin, dayKeyOf, isValidDate, todayStr } from '@/lib/api';

export const dynamic = 'force-dynamic';

// GET /api/barber/:id/slots?date=YYYY-MM-DD&duration=30  -> free start times on a 30-minute grid
export async function GET(req, { params }) {
  const sp = new URL(req.url).searchParams;
  const date = sp.get('date');
  const duration = Math.max(10, Number(sp.get('duration')) || 30);
  if (!isValidDate(date) || !/^[a-f\d]{24}$/i.test(params.id)) return fail('invalid_input');
  await dbConnect();
  const barber = await BarberProfile.findById(params.id).lean();
  if (!barber) return fail('not_found', 404);
  const hrs = barber.workingHours?.[dayKeyOf(date)];
  if (!hrs || hrs.off) return json({ slots: [] });

  const booked = await Booking.find({ barberId: params.id, date, status: { $ne: 'cancelled' } }).select('startMin endMin').lean();
  const now = new Date();
  const isToday = date === todayStr();
  const nowMin = now.getUTCHours() * 60 + now.getUTCMinutes();
  const slots = [];
  for (let t = toMin(hrs.open); t + duration <= toMin(hrs.close); t += 30) {
    if (isToday && t <= nowMin) continue;
    if (booked.some((b) => t < b.endMin && t + duration > b.startMin)) continue;
    slots.push(fromMin(t));
  }
  return json({ slots });
}
