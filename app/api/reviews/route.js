import dbConnect from '@/lib/mongoose';
import Review from '@/models/Review';
import Booking from '@/models/Booking';
import BarberProfile from '@/models/BarberProfile';
import { fail, json, requireUser } from '@/lib/api';
import { recomputeRating } from '@/lib/barbers';

export const dynamic = 'force-dynamic';

// GET /api/reviews?mine=1  -> reviews written by the logged-in client
export async function GET(req) {
  const { user, error } = await requireUser();
  if (error) return error;
  await dbConnect();
  const reviews = await Review.find({ clientId: user.id }).sort({ createdAt: -1 }).populate({ path: 'barberId', select: 'userId', populate: { path: 'userId', select: 'name' } }).lean();
  return json({ reviews: reviews.map((r) => ({ _id: r._id, rating: r.rating, comment: r.comment, createdAt: r.createdAt, barberId: r.barberId?._id, barberName: r.barberId?.userId?.name })) });
}

// POST { barberId, rating, comment } — only clients who booked this barber; one review per client (re-posting edits it)
export async function POST(req) {
  const { user, error } = await requireUser('client');
  if (error) return error;
  const b = await req.json().catch(() => ({}));
  const rating = Number(b.rating);
  if (!/^[a-f\d]{24}$/i.test(b.barberId || '') || !(rating >= 1 && rating <= 5)) return fail('invalid_input');
  await dbConnect();
  if (!(await BarberProfile.exists({ _id: b.barberId }))) return fail('not_found', 404);
  const hadBooking = await Booking.exists({ clientId: user.id, barberId: b.barberId, status: { $ne: 'cancelled' } });
  if (!hadBooking) return fail('booking_required', 403);
  const review = await Review.findOneAndUpdate(
    { clientId: user.id, barberId: b.barberId },
    { rating: Math.round(rating), comment: String(b.comment || '').slice(0, 800) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await recomputeRating(b.barberId);
  return json({ review }, 201);
}
