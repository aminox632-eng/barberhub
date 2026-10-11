import { NextResponse } from 'next/server';
import { getSession } from './auth';

export const json = (data, status = 200) => NextResponse.json(data, { status });
export const fail = (message, status = 400) => NextResponse.json({ error: message }, { status });

export async function requireUser(role) {
  const session = await getSession();
  if (!session?.user?.id) return { error: fail('unauthorized', 401) };
  if (role && session.user.role !== role) return { error: fail('forbidden', 403) };
  return { user: session.user };
}

export const toMin = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + (m || 0);
};
export const fromMin = (n) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export const dayKeyOf = (dateStr) => DAY_KEYS[new Date(`${dateStr}T12:00:00Z`).getUTCDay()];
export const isValidDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
export const todayStr = () => new Date().toISOString().slice(0, 10);

export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
