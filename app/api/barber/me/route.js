import dbConnect from '@/lib/mongoose';
import BarberProfile from '@/models/BarberProfile';
import User from '@/models/User';
import { fail, json, requireUser } from '@/lib/api';
import { getBarberById } from '@/lib/barbers';
import { findCity } from '@/data/locations';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { user, error } = await requireUser('barber');
  if (error) return error;
  await dbConnect();
  const p = await BarberProfile.findOne({ userId: user.id }).select('_id');
  if (!p) return fail('not_found', 404);
  return json(await getBarberById(p._id.toString()));
}

export async function PUT(req) {
  const { user, error } = await requireUser('barber');
  if (error) return error;
  const b = await req.json();
  await dbConnect();
  const update = {};
  const str = (k, max = 2000) => { if (typeof b[k] === 'string') update[k] = b[k].slice(0, max); };
  ['bio', 'address', 'phone', 'whatsapp', 'city', 'country'].forEach((k) => str(k));
  if (typeof b.cover === 'string') update.cover = b.cover;
  if (b.yearsExperience != null) update.yearsExperience = Math.max(0, Number(b.yearsExperience) || 0);
  if (b.lat != null && b.lng != null) { update.lat = Number(b.lat); update.lng = Number(b.lng); }
  if (Array.isArray(b.skills)) update.skills = b.skills.map(String).slice(0, 12);
  if (Array.isArray(b.services)) {
    update.services = b.services
      .filter((s) => s.name && Number(s.price) >= 0)
      .map((s) => ({ name: String(s.name).slice(0, 60), price: Number(s.price), duration: Math.max(10, Number(s.duration) || 30) }))
      .slice(0, 30);
  }
  if (Array.isArray(b.portfolio)) update.portfolio = b.portfolio.map((p) => ({ url: String(p.url || ''), category: String(p.category || 'Other') })).slice(0, 40);
  if (b.workingHours && typeof b.workingHours === 'object') update.workingHours = b.workingHours;
  if (update.country) update.currency = findCity(update.country, update.city || '').currency;

  const profile = await BarberProfile.findOneAndUpdate({ userId: user.id }, update, { new: true, runValidators: true });
  if (!profile) return fail('not_found', 404);
  const userUpdate = {};
  if (typeof b.name === 'string' && b.name.trim()) userUpdate.name = b.name.trim().slice(0, 80);
  if (typeof b.avatar === 'string') userUpdate.avatar = b.avatar;
  if (Object.keys(userUpdate).length) await User.findByIdAndUpdate(user.id, userUpdate);
  return json(await getBarberById(profile._id.toString()));
}
