import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import BarberProfile from '@/models/BarberProfile';
import { fail, json } from '@/lib/api';
import { findCity } from '@/data/locations';
import { CATEGORIES } from '@/lib/config';

export const dynamic = 'force-dynamic';

const DEMO = [
  ['Youssef El Idrissi', 'Morocco', 'Casablanca', 'Fade Specialist', 8],
  ['Karim Benali', 'Morocco', 'Rabat', 'Beard Master', 6],
  ['Anas Tazi', 'Morocco', 'Marrakech', 'Hot Towel Shave', 10],
  ['Lucas Moreau', 'France', 'Paris', 'Fade Specialist', 7],
  ['Hugo Bernard', 'France', 'Lyon', 'Hair Coloring', 5],
  ['Marcus Johnson', 'United States', 'New York', 'Afro Care', 12],
  ['Devon Brooks', 'United States', 'Los Angeles', 'Fade Specialist', 9],
  ['James Whitfield', 'United Kingdom', 'London', 'Beard Master', 14],
  ['Diego Fernández', 'Spain', 'Barcelona', 'Kids Cut', 6],
  ['Jonas Keller', 'Germany', 'Berlin', 'Hot Towel Shave', 8],
  ['Omar Al Farsi', 'United Arab Emirates', 'Dubai', 'Beard Master', 11],
  ['Mehmet Kaya', 'Turkey', 'Istanbul', 'Hot Towel Shave', 15],
];

// GET /api/seed?secret=SEED_SECRET  — inserts demo barbers (marked isDemo). Demo password: Demo1234!
export async function GET(req) {
  const secret = new URL(req.url).searchParams.get('secret');
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) return fail('forbidden', 403);
  await dbConnect();
  const password = await bcrypt.hash('Demo1234!', 10);
  let created = 0;
  for (let i = 0; i < DEMO.length; i++) {
    const [name, country, city, skill, years] = DEMO[i];
    const email = `demo${i + 1}@barberhub.demo`;
    if (await User.findOne({ email })) continue;
    const user = await User.create({ name, email, password, role: 'barber' });
    const geo = findCity(country, city);
    const base = 15 + (i % 5) * 4;
    await BarberProfile.create({
      userId: user._id, country, city, currency: geo.currency, isDemo: true,
      lat: geo.lat != null ? geo.lat + (Math.random() - 0.5) * 0.03 : null, lng: geo.lng != null ? geo.lng + (Math.random() - 0.5) * 0.03 : null,
      address: `${10 + i} Main Street, ${city}`, yearsExperience: years, skills: [skill, 'Kids Cut'].filter((v, k, a) => a.indexOf(v) === k),
      bio: `${years} years behind the chair in ${city}. Clean lines, honest advice, and a chair that always starts on time.`,
      rating: Math.round((4.3 + (i % 7) * 0.1) * 10) / 10, reviewCount: 20 + i * 11,
      phone: '+212600000000', whatsapp: '212600000000',
      services: [
        { name: 'Classic Cut', price: base, duration: 30 },
        { name: 'Fade', price: base + 5, duration: 40 },
        { name: 'Beard Trim', price: base - 5, duration: 20 },
        { name: 'Cut + Beard', price: base + 12, duration: 55 },
      ],
      portfolio: Array.from({ length: 12 }, (_, k) => ({ url: '', category: CATEGORIES[k % CATEGORIES.length] })),
    });
    created++;
  }
  return json({ created, note: 'Demo password: Demo1234!' });
}
