import crypto from 'crypto';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { json } from '@/lib/api';

// Generates a one-hour reset link. Wire your email provider (Resend, SendGrid...) at the marked line.
// In development the link is returned in the response and logged so you can test the flow.
export async function POST(req) {
  const { email, locale = 'en' } = await req.json().catch(() => ({}));
  await dbConnect();
  const user = await User.findOne({ email: String(email || '').toLowerCase().trim() });
  const out = { ok: true };
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.resetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const link = `${base}/${locale}/reset-password?token=${token}`;
    // TODO: send `link` by email here.
    if (process.env.NODE_ENV !== 'production') {
      console.log('Password reset link:', link);
      out.devLink = link;
    }
  }
  return json(out); // same answer whether or not the account exists
}
