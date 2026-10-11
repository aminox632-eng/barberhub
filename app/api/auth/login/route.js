import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { fail, json } from '@/lib/api';

// Credential check for API clients. The web UI signs in through NextAuth (signIn('credentials')).
export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await dbConnect();
    const user = await User.findOne({ email: String(email || '').toLowerCase().trim() }).select('+password');
    if (!user || !(await bcrypt.compare(String(password || ''), user.password))) return fail('invalid_credentials', 401);
    return json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    return fail('server_error', 500);
  }
}
