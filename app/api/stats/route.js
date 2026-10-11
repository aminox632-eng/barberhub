import dbConnect from '@/lib/mongoose';
import BarberProfile from '@/models/BarberProfile';
import Booking from '@/models/Booking';
import User from '@/models/User';
import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();
    const [barbers, clients, bookings, cities] = await Promise.all([
      BarberProfile.countDocuments(), User.countDocuments({ role: 'client' }), Booking.countDocuments(), BarberProfile.distinct('city'),
    ]);
    return json({ barbers, clients, bookings, cities: cities.length });
  } catch {
    return json({ barbers: 0, clients: 0, bookings: 0, cities: 0 });
  }
}
