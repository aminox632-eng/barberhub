'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ChatBox({ withUserId, height = 360 }) {
  const t = useTranslations('barber');
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const end = useRef(null);

  const load = () => fetch(`/api/messages?with=${withUserId}`).then((r) => r.json()).then((d) => setMsgs(d.messages || [])).catch(() => {});
  useEffect(() => {
    load();
    const id = setInterval(load, 5000); // simple polling; swap for WebSockets/Pusher later if needed
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withUserId]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs.length]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText('');
    await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: withUserId, text: body }) });
    load();
  };

  return (
    <div className="flex flex-col rounded-xl border border-line bg-ink" style={{ height }}>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {msgs.map((m) => (
          <div key={m._id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
            <p className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.mine ? 'bg-gold text-ink' : 'bg-ink-700'}`}>{m.text}</p>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-line p-2">
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('typeMessage')} maxLength={1000} />
        <button className="btn-gold">{t('send')}</button>
      </form>
    </div>
  );
}
