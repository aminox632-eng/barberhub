import mongoose from 'mongoose';
import dbConnect from '@/lib/mongoose';
import Message from '@/models/Message';
import User from '@/models/User';
import { fail, json, requireUser } from '@/lib/api';

export const dynamic = 'force-dynamic';

// GET            -> list of conversations
// GET ?with=<id> -> messages with that user
export async function GET(req) {
  const { user, error } = await requireUser();
  if (error) return error;
  await dbConnect();
  const other = new URL(req.url).searchParams.get('with');
  const me = new mongoose.Types.ObjectId(user.id);
  if (other) {
    if (!/^[a-f\d]{24}$/i.test(other)) return fail('invalid_input');
    const messages = await Message.find({ $or: [{ from: me, to: other }, { from: other, to: me }] }).sort({ createdAt: 1 }).limit(200).lean();
    return json({ messages: messages.map((m) => ({ _id: m._id, text: m.text, mine: m.from.equals(me), createdAt: m.createdAt })) });
  }
  const rows = await Message.aggregate([
    { $match: { $or: [{ from: me }, { to: me }] } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: { $cond: [{ $eq: ['$from', me] }, '$to', '$from'] }, text: { $first: '$text' }, createdAt: { $first: '$createdAt' } } },
    { $sort: { createdAt: -1 } },
    { $limit: 50 },
  ]);
  const users = await User.find({ _id: { $in: rows.map((r) => r._id) } }).select('name').lean();
  const names = Object.fromEntries(users.map((u) => [u._id.toString(), u.name]));
  return json({ conversations: rows.map((r) => ({ userId: r._id, name: names[r._id.toString()] || 'User', last: r.text, createdAt: r.createdAt })) });
}

export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { to, text } = await req.json().catch(() => ({}));
  if (!/^[a-f\d]{24}$/i.test(to || '') || !String(text || '').trim() || to === user.id) return fail('invalid_input');
  await dbConnect();
  const target = await User.findById(to).select('role');
  if (!target || target.role === user.role) return fail('forbidden', 403); // chat is client <-> barber only
  const m = await Message.create({ from: user.id, to, text: String(text).trim().slice(0, 1000) });
  return json({ message: m }, 201);
}
