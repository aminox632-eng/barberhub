import dbConnect from './mongoose';
import BarberProfile from '@/models/BarberProfile';
import Review from '@/models/Review';
import '@/models/User';

const plain = (d) => JSON.parse(JSON.stringify(d));

export async function getBarberById(id) {
  await dbConnect();
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  const profile = await BarberProfile.findById(id).populate('userId', 'name avatar').lean();
  if (!profile) return null;
  const reviews = await Review.find({ barberId: id }).sort({ createdAt: -1 }).limit(50).populate('clientId', 'name avatar').lean();
  const { userId, ...rest } = profile;
  return plain({
    ...rest,
    userId: userId?._id,
    name: userId?.name || 'Barber',
    avatar: userId?.avatar || '',
    reviews: reviews.map((r) => ({ _id: r._id, rating: r.rating, comment: r.comment, createdAt: r.createdAt, clientName: r.clientId?.name || 'Client', clientAvatar: r.clientId?.avatar || '' })),
  });
}

export async function recomputeRating(barberId) {
  const [agg] = await Review.aggregate([
    { $match: { barberId: new (await import('mongoose')).default.Types.ObjectId(barberId) } },
    { $group: { _id: '$barberId', avg: { $avg: '$rating' }, n: { $sum: 1 } } },
  ]);
  await BarberProfile.findByIdAndUpdate(barberId, { rating: agg ? Math.round(agg.avg * 10) / 10 : 0, reviewCount: agg?.n || 0 });
}
