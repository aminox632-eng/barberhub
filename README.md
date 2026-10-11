# BarberHub

Global barbershop marketplace: clients find, book and review barbers anywhere; barbers manage their profile, portfolio and bookings.
Next.js 14 App Router, Tailwind, MongoDB/Mongoose, NextAuth (JWT), next-intl (ar RTL, en, fr, es, zh, de), Leaflet/OpenStreetMap, Framer Motion.

## Run locally

```bash
npm install
cp .env.example .env.local     # fill in the values
npm run dev                    # http://localhost:3000 (redirects to /en)
```

Production: `npm run build && npm start`, or push to Vercel.

## Database: your existing `lib/mongodb.js`

This project does not ship its own connection file. It imports the one Vercel created
(`lib/mongodb.js`, default export = the `clientPromise` of the `atlas-blue-ball` integration).
`lib/mongoose.js` only binds Mongoose to that same `MongoClient` (`connection.setClient`),
so there is a single connection. Keep your `lib/mongodb.js` in place when you copy these files in.

Locally, run `vercel env pull .env.local` to get `MONGODB_URI`, then add `NEXTAUTH_SECRET`
(`openssl rand -base64 32`) and `NEXTAUTH_URL`. On Vercel add `NEXTAUTH_SECRET` and `NEXTAUTH_URL` (your domain).

## Demo data

Set `SEED_SECRET`, then open `/api/seed?secret=YOUR_SECRET` once. It creates 12 demo barbers in 12 cities
(`demo1@barberhub.demo` to `demo12@barberhub.demo`, password `Demo1234!`, flagged `isDemo`). Their ratings are sample values.
Remove `SEED_SECRET` afterwards.

## Structure

```
app/[locale]/        pages: home, explore, barber/[id], login, register, forgot/reset-password, dashboard
app/api/             auth, barbers, barber/[id] (+slots), barber/me, bookings, reviews, favorites, messages, stats, locations, seed
components/          Navbar, LanguageSwitcher, BarberCard, BookingModal, MapView, ChatBox, dashboards, ...
models/              User, BarberProfile, Booking, Review, Message
lib/                 mongoose.js (reuses lib/mongodb.js), auth.js, api.js helpers, config.js, navigation.js
messages/            ar.json en.json fr.json es.json zh.json de.json
data/locations.js    Country > City catalogue (cities barbers add are merged in automatically)
```

## How the key parts work

- Double-booking protection: `POST /api/bookings` checks time overlap using each service's duration, and the
  `Booking.slotKey` sparse unique index makes MongoDB reject a concurrent duplicate. Cancelling unsets `slotKey`, which frees the slot.
- Roles: `barber` / `client` chosen at `/register`. Barbers get a `BarberProfile` automatically (currency and map pin from the city when known).
- Global coverage: any country/city can be entered; `/api/locations` merges the built-in list with every city in the DB.
- Languages: `/en /ar /fr /es /zh /de`. Arabic sets `dir="rtl"`; the UI uses logical Tailwind classes (`ms-`, `me-`, `start-`, `end-`).
- Images: avatar, cover and portfolio photos are resized in the browser and stored as compressed data URLs in MongoDB.
  For heavy use, move them to S3/Cloudinary/Vercel Blob and store URLs instead.
- Forgot password: tokens are generated and hashed, but no email is sent yet. Plug a provider into `app/api/auth/forgot/route.js`
  (marked TODO). In development the reset link is shown on screen.
- Chat: client/barber messages, refreshed by polling every 5 s.

## Known limits

- Prices are filtered by number only, so mixed currencies (MAD vs USD) are compared as raw numbers.
- Working hours and "available today" use UTC, not the barber's local time zone.
- No email/SMS notifications, payments, or rate limiting yet.
