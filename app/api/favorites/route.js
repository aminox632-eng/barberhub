import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import BarberProfile from '@/models/BarberProfile';
import { fail, json, requireUser } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;
  await dbConnect();
  const u = await User.findById(user.id).select('favorites').lean();
  const profiles = await BarberProfile.find({ _id: { $in: u?.favorites || [] } }).populate('userId', 'name avatar').lean();
  return json({
    ids: (u?.favorites || []).map(String),
    barbers: profiles.map((d) => ({ _id: d._id, name: d.userId?.name, avatar: d.userId?.avatar || '', cover: d.cover, city: d.city, country: d.country, rating: d.rating, reviewCount: d.reviewCount, currency: d.currency, fromPrice: d.services?.length ? Math.min(...d.services.map((s) => s.price)) : null })),
  });
}

// POST { barberId } toggles a favorite
export async function POST(req) {
  const { user, error } = await requireUser('client');
  if (error) return error;
  const { barberId } = await req.json().catch(() => ({}));
  if (!/^[a-f\d]{24}$/i.test(barberId || '')) return fail('invalid_input');
  await dbConnect();
  const u = await User.findById(user.id).select('favorites');
  const has = u.favorites.some((f) => f.toString() === barberId);
  if (has) u.favorites.pull(barberId); else u.favorites.push(barberId);
  await u.save();
  return json({ favorited: !has });
}
