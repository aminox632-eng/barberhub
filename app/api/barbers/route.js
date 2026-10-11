import dbConnect from '@/lib/mongoose';
import BarberProfile from '@/models/BarberProfile';
import '@/models/User';
import { json, haversine, dayKeyOf, todayStr, toMin } from '@/lib/api';

export const dynamic = 'force-dynamic';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/barbers?country=&city=&service=&q=&minRating=&minPrice=&maxPrice=&availableToday=1&lat=&lng=&distance=&sort=rating|nearest|cheapest&limit=
export async function GET(req) {
  try {
    await dbConnect();
    const sp = new URL(req.url).searchParams;
    const filter = {};
    if (sp.get('country')) filter.country = new RegExp(`^${esc(sp.get('country'))}$`, 'i');
    if (sp.get('city')) filter.city = new RegExp(`^${esc(sp.get('city'))}$`, 'i');
    if (sp.get('service')) filter['services.name'] = new RegExp(esc(sp.get('service')), 'i');
    if (sp.get('minRating')) filter.rating = { $gte: Number(sp.get('minRating')) };

    const q = sp.get('q')?.trim();
    let userIds = null;
    if (q) {
      const User = (await import('@/models/User')).default;
      const rx = new RegExp(esc(q), 'i');
      userIds = (await User.find({ role: 'barber', name: rx }).select('_id').lean()).map((u) => u._id);
      filter.$or = [{ city: rx }, { country: rx }, { userId: { $in: userIds } }];
    }

    let docs = await BarberProfile.find(filter).populate('userId', 'name avatar').limit(300).lean();

    const minPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : null;
    const maxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : null;
    const lat = sp.get('lat') ? Number(sp.get('lat')) : null;
    const lng = sp.get('lng') ? Number(sp.get('lng')) : null;
    const maxDist = sp.get('distance') ? Number(sp.get('distance')) : null;
    const now = new Date();
    const nowMin = now.getUTCHours() * 60 + now.getUTCMinutes();

    let list = docs.map((d) => {
      const prices = (d.services || []).map((s) => s.price);
      const fromPrice = prices.length ? Math.min(...prices) : null;
      const hrs = d.workingHours?.[dayKeyOf(todayStr())];
      const availableToday = !!hrs && !hrs.off && toMin(hrs.close) > nowMin;
      const distance = lat != null && lng != null && d.lat != null ? Math.round(haversine(lat, lng, d.lat, d.lng) * 10) / 10 : null;
      return {
        _id: d._id, name: d.userId?.name || 'Barber', avatar: d.userId?.avatar || '', cover: d.cover,
        city: d.city, country: d.country, rating: d.rating, reviewCount: d.reviewCount, currency: d.currency,
        fromPrice, skills: d.skills, yearsExperience: d.yearsExperience, lat: d.lat, lng: d.lng, availableToday, distance,
      };
    });

    if (minPrice != null) list = list.filter((b) => b.fromPrice != null && b.fromPrice >= minPrice);
    if (maxPrice != null) list = list.filter((b) => b.fromPrice != null && b.fromPrice <= maxPrice);
    if (sp.get('availableToday') === '1') list = list.filter((b) => b.availableToday);
    if (maxDist != null && lat != null) list = list.filter((b) => b.distance != null && b.distance <= maxDist);

    const sort = sp.get('sort') || 'rating';
    if (sort === 'cheapest') list.sort((a, b) => (a.fromPrice ?? 1e9) - (b.fromPrice ?? 1e9));
    else if (sort === 'nearest' && lat != null) list.sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
    else list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

    const limit = Math.min(Number(sp.get('limit')) || 60, 100);
    return json({ barbers: list.slice(0, limit), total: list.length });
  } catch (e) {
    console.error(e);
    return json({ barbers: [], total: 0, error: 'server_error' }, 500);
  }
}
