// Country > City catalogue used for registration + the Explore filter.
// Barbers may also type any other city: the filter merges this list with the cities found in the DB.
export const LOCATIONS = [
  { name: 'Morocco', currency: 'MAD', cities: [['Casablanca', 33.5731, -7.5898], ['Rabat', 34.0209, -6.8416], ['Marrakech', 31.6295, -7.9811], ['Tangier', 35.7595, -5.834], ['Fes', 34.0331, -5.0003], ['Agadir', 30.4278, -9.5981]] },
  { name: 'France', currency: 'EUR', cities: [['Paris', 48.8566, 2.3522], ['Lyon', 45.764, 4.8357], ['Marseille', 43.2965, 5.3698], ['Toulouse', 43.6047, 1.4442]] },
  { name: 'United States', currency: 'USD', cities: [['New York', 40.7128, -74.006], ['Los Angeles', 34.0522, -118.2437], ['Chicago', 41.8781, -87.6298], ['Miami', 25.7617, -80.1918], ['Houston', 29.7604, -95.3698]] },
  { name: 'United Kingdom', currency: 'GBP', cities: [['London', 51.5072, -0.1276], ['Manchester', 53.4808, -2.2426], ['Birmingham', 52.4862, -1.8904]] },
  { name: 'Spain', currency: 'EUR', cities: [['Madrid', 40.4168, -3.7038], ['Barcelona', 41.3874, 2.1686], ['Valencia', 39.4699, -0.3763]] },
  { name: 'Germany', currency: 'EUR', cities: [['Berlin', 52.52, 13.405], ['Munich', 48.1351, 11.582], ['Hamburg', 53.5511, 9.9937]] },
  { name: 'Italy', currency: 'EUR', cities: [['Rome', 41.9028, 12.4964], ['Milan', 45.4642, 9.19]] },
  { name: 'Netherlands', currency: 'EUR', cities: [['Amsterdam', 52.3676, 4.9041], ['Rotterdam', 51.9244, 4.4777]] },
  { name: 'Turkey', currency: 'TRY', cities: [['Istanbul', 41.0082, 28.9784], ['Ankara', 39.9334, 32.8597]] },
  { name: 'United Arab Emirates', currency: 'AED', cities: [['Dubai', 25.2048, 55.2708], ['Abu Dhabi', 24.4539, 54.3773]] },
  { name: 'Saudi Arabia', currency: 'SAR', cities: [['Riyadh', 24.7136, 46.6753], ['Jeddah', 21.4858, 39.1925]] },
  { name: 'Egypt', currency: 'EGP', cities: [['Cairo', 30.0444, 31.2357], ['Alexandria', 31.2001, 29.9187]] },
  { name: 'Brazil', currency: 'BRL', cities: [['São Paulo', -23.5505, -46.6333], ['Rio de Janeiro', -22.9068, -43.1729]] },
  { name: 'Canada', currency: 'CAD', cities: [['Toronto', 43.6532, -79.3832], ['Montreal', 45.5017, -73.5673]] },
  { name: 'China', currency: 'CNY', cities: [['Shanghai', 31.2304, 121.4737], ['Beijing', 39.9042, 116.4074]] },
  { name: 'Japan', currency: 'JPY', cities: [['Tokyo', 35.6762, 139.6503], ['Osaka', 34.6937, 135.5023]] },
  { name: 'Nigeria', currency: 'NGN', cities: [['Lagos', 6.5244, 3.3792]] },
  { name: 'South Africa', currency: 'ZAR', cities: [['Johannesburg', -26.2041, 28.0473], ['Cape Town', -33.9249, 18.4241]] },
  { name: 'Australia', currency: 'AUD', cities: [['Sydney', -33.8688, 151.2093], ['Melbourne', -37.8136, 144.9631]] },
];

export const findCity = (country, city) => {
  const c = LOCATIONS.find((x) => x.name === country);
  const ci = c?.cities.find((x) => x[0].toLowerCase() === String(city).toLowerCase());
  return { currency: c?.currency || 'USD', lat: ci?.[1] ?? null, lng: ci?.[2] ?? null };
};

export const currencySymbol = (cur) =>
  ({ USD: '$', EUR: '€', GBP: '£', MAD: 'MAD ', AED: 'AED ', SAR: 'SAR ', EGP: 'EGP ', TRY: '₺', BRL: 'R$', CAD: 'C$', CNY: '¥', JPY: '¥', NGN: '₦', ZAR: 'R', AUD: 'A$' }[cur] || `${cur} `);
