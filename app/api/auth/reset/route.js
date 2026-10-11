import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { fail, json } from '@/lib/api';

export async function POST(req) {
  const { token, password } = await req.json().catch(() => ({}));
  if (!token || String(password || '').length < 8) return fail('invalid_input');
  await dbConnect();
  const hash = crypto.createHash('sha256').update(String(token)).digest('hex');
  const user = await User.findOne({ resetTokenHash: hash, resetExpires: { $gt: new Date() } }).select('+resetTokenHash +resetExpires');
  if (!user) return fail('invalid_token', 400);
  user.password = await bcrypt.hash(password, 12);
  user.resetTokenHash = undefined;
  user.resetExpires = undefined;
  await user.save();
  return json({ ok: true });
}
