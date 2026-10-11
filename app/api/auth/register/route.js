import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import BarberProfile from '@/models/BarberProfile';
import { fail, json } from '@/lib/api';
import { findCity } from '@/data/locations';

export async function POST(req) {
  try {
    const b = await req.json();
    const name = String(b.name || '').trim();
    const email = String(b.email || '').toLowerCase().trim();
    const password = String(b.password || '');
    const role = b.role;
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) return fail('invalid_input');
    if (password.length < 8) return fail('weak_password');
    if (!['barber', 'client'].includes(role)) return fail('invalid_role');
    if (role === 'barber' && (!b.country || !b.city)) return fail('location_required');

    await dbConnect();
    if (await User.findOne({ email })) return fail('email_exists', 409);

    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role, phone: b.phone || '' });

    if (role === 'barber') {
      const geo = findCity(b.country, b.city);
      await BarberProfile.create({
        userId: user._id,
        country: String(b.country).trim(),
        city: String(b.city).trim(),
        currency: geo.currency,
        lat: geo.lat,
        lng: geo.lng,
        phone: b.phone || '',
        whatsapp: b.phone || '',
        services: [{ name: 'Classic Cut', price: 20, duration: 30 }],
      });
    }
    return json({ ok: true, id: user._id }, 201);
  } catch (e) {
    console.error(e);
    return fail('server_error', 500);
  }
}
