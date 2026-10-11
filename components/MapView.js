'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

// Leaflet + OpenStreetMap tiles (free, no API key). Loaded client-side only.
// Pass onPick to turn it into a location picker (click or drag the pin).
export default function MapView({ lat, lng, onPick, height = 280, zoom = 14 }) {
  const el = useRef(null);
  const state = useRef({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !el.current || state.current.map) return;
      const hasPin = lat != null && lng != null;
      const map = L.map(el.current, { scrollWheelZoom: false }).setView(hasPin ? [lat, lng] : [20, 10], hasPin ? zoom : 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
      const icon = L.divIcon({ className: '', html: '<div class="gold-pin"></div>', iconSize: [26, 26], iconAnchor: [13, 26] });
      const place = (la, ln) => {
        if (state.current.marker) state.current.marker.setLatLng([la, ln]);
        else {
          const m = L.marker([la, ln], { icon, draggable: !!onPick }).addTo(map);
          if (onPick) m.on('dragend', () => { const p = m.getLatLng(); onPick(p.lat, p.lng); });
          state.current.marker = m;
        }
      };
      if (hasPin) place(lat, lng);
      if (onPick) map.on('click', (e) => { place(e.latlng.lat, e.latlng.lng); onPick(e.latlng.lat, e.latlng.lng); });
      state.current = { ...state.current, map, place };
      setTimeout(() => map.invalidateSize(), 100);
    })();
    return () => { cancelled = true; state.current.map?.remove(); state.current = {}; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { map, place } = state.current;
    if (map && lat != null && lng != null) { place(lat, lng); map.setView([lat, lng], Math.max(map.getZoom(), zoom)); }
  }, [lat, lng, zoom]);

  return <div ref={el} style={{ height }} className="z-0 w-full overflow-hidden rounded-xl border border-line" />;
}
