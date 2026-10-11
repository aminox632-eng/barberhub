'use client';
import { useRef } from 'react';

// Resizes in the browser and returns a compact JPEG data URL (stored in MongoDB; no file storage needed).
export async function fileToDataUrl(file, max = 900, quality = 0.75) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bitmap.width * scale);
  c.height = Math.round(bitmap.height * scale);
  c.getContext('2d').drawImage(bitmap, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', quality);
}

export default function ImageInput({ label, value, onChange, max = 900, round = false }) {
  const ref = useRef(null);
  const pick = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onChange(await fileToDataUrl(f, max));
    e.target.value = '';
  };
  return (
    <div>
      <span className="label">{label}</span>
      <button type="button" onClick={() => ref.current.click()} className={`flex h-28 w-full items-center justify-center overflow-hidden border border-dashed border-line bg-ink-700 text-neutral-500 hover:border-gold ${round ? 'mx-auto !h-28 !w-28 rounded-full' : 'rounded-lg'}`}>
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="text-3xl">+</span>}
      </button>
      <input ref={ref} type="file" accept="image/*" hidden onChange={pick} />
    </div>
  );
}
