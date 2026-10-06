'use client';

/*
 * ChatWidget — bubble chat CS situs (bot NIU-Bot -> eskalasi ke pemilik).
 *
 * Backend: Tencent RTC Chat (paket gratis). Dipasang sekali di root layout.
 *
 * Menjaga budget bundle (AUDIT-2026.17):
 *  - Komponen ini sendiri ringan (~3 KB); SDK @tencentcloud/chat BARU
 *    di-dynamic-import saat pengunjung pertama membuka bubble.
 *  - Tanpa konfigurasi (NEXT_PUBLIC_TRTC_SDK_APP_ID kosong) -> render null.
 *
 * Kebijakan tamu: ID `guest_*` persisten di localStorage sehingga riwayat
 * percakapan (roaming Tencent) mengikuti lintas sesi.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/components/LocaleProvider';

type Target = 'bot' | 'human';

interface Msg {
  id: string;
  mine: boolean;
  text: string;
}

const GUEST_KEY = 'niu.trtc.guestId';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ChatWidget() {
  const { t } = useLocale();
  const pathname = usePathname();

  const sdkAppId = Number(process.env.NEXT_PUBLIC_TRTC_SDK_APP_ID ?? 0);
  const botId = process.env.NEXT_PUBLIC_TRTC_BOT_ID ?? 'niu_bot';
  const ownerId = process.env.NEXT_PUBLIC_TRTC_OWNER_ID ?? 'niu_owner';
  const enabled = sdkAppId > 0;

  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<Target>('bot');
  const [threads, setThreads] = useState<Record<Target, Msg[]>>({ bot: [], human: [] });
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(0);
  const [failed, setFailed] = useState(false);

  const chatRef = useRef<any>(null);
  const sdkRef = useRef<any>(null);
  const startingRef = useRef(false); // guard StrictMode double-invoke
  const seenRef = useRef(new Set<string>());
  const loadedRef = useRef<Record<Target, boolean>>({ bot: false, human: false });
  const listRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Target>('bot');
  targetRef.current = target;

  const peerOf = (tg: Target) => (tg === 'bot' ? botId : ownerId);

  const pushMsg = useCallback((tg: Target, m: Msg) => {
    if (seenRef.current.has(m.id)) return;
    seenRef.current.add(m.id);
    setThreads((prev) => ({ ...prev, [tg]: [...prev[tg], m] }));
  }, []);

  // ---- Login malas: baru jalan saat bubble pertama dibuka ----
  const ensureLogin = useCallback(async () => {
    if (chatRef.current || startingRef.current || !enabled) return;
    startingRef.current = true;
    try {
      const mod = await import('@tencentcloud/chat');
      const TencentCloudChat = mod.default;
      sdkRef.current = TencentCloudChat;

      const saved = (() => {
        try {
          return localStorage.getItem(GUEST_KEY) ?? '';
        } catch {
          return '';
        }
      })();
      const res = await fetch(
        `/api/chat/usersig${saved ? `?userId=${encodeURIComponent(saved)}` : ''}`,
        { cache: 'no-store' },
      );
      if (!res.ok) throw new Error(`usersig HTTP ${res.status}`);
      const { userId, userSig } = (await res.json()) as { userId: string; userSig: string };
      try {
        localStorage.setItem(GUEST_KEY, userId);
      } catch {
        /* private mode — sesi saja */
      }

      const chat = TencentCloudChat.create({ SDKAppID: sdkAppId });
      const { EVENT, TYPES } = TencentCloudChat as any;

      chat.on(EVENT.MESSAGE_RECEIVED, (e: { data: any[] }) => {
        let ping = 0;
        for (const m of e.data) {
          if (m.type !== TYPES.MSG_TEXT) continue;
          const tg: Target = m.conversationID === `C2C${botId}` ? 'bot' : 'human';
          const msg: Msg = { id: m.ID, mine: m.flow === 'out', text: m.payload.text };
          pushMsg(tg, msg);
          if (!msg.mine) ping += 1;
        }
        if (ping > 0) setUnread((u) => u + ping);
      });

      await chat.login({ userID: userId, userSig });
      chatRef.current = chat;
    } catch (e) {
      console.error('[ChatWidget] login gagal:', e);
      setFailed(true);
    } finally {
      startingRef.current = false;
    }
  }, [enabled, sdkAppId, botId, pushMsg]);

  // ---- Riwayat percakapan per target (sekali per sesi) ----
  const loadHistory = useCallback(
    async (tg: Target) => {
      const chat = chatRef.current;
      if (!chat || loadedRef.current[tg]) return;
      loadedRef.current[tg] = true;
      try {
        const resp = await chat.getMessageList({
          conversationID: `C2C${peerOf(tg)}`,
          count: 30,
        });
        const list = (resp.data.messageList as any[])
          .filter((m) => m.type === (sdkRef.current as any).TYPES.MSG_TEXT)
          .sort((a, b) => a.time - b.time);
        for (const m of list) {
          pushMsg(tg, { id: m.ID, mine: m.flow === 'out', text: m.payload.text });
        }
        if (typeof chat.setMessageRead === 'function') {
          chat.setMessageRead({ conversationID: `C2C${peerOf(tg)}` }).catch(() => {});
        }
      } catch {
        /* belum ada percakapan — normal untuk tamu baru */
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (open) {
      setUnread(0);
      void loadHistory(target);
    }
  }, [open, target, loadHistory]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [threads, open, target]);

  const openWidget = async () => {
    setOpen(true);
    await ensureLogin();
  };

  const send = async () => {
    const text = input.trim();
    const chat = chatRef.current;
    if (!text || !chat || busy) return;
    setBusy(true);
    try {
      const message = chat.createTextMessage({
        to: peerOf(target),
        conversationType: (sdkRef.current as any).TYPES.CONV_C2C,
        payload: { text },
      });
      const resp = await chat.sendMessage(message);
      pushMsg(target, { id: resp.data.message.ID, mine: true, text });
      setInput('');
    } catch (e) {
      console.error('[ChatWidget] kirim gagal:', e);
    } finally {
      setBusy(false);
    }
  };

  // Nonaktif tanpa konfigurasi, dan jangan tampil di halaman inbox pemilik.
  if (!enabled || pathname.startsWith('/cs')) return null;

  const msgs = threads[target];

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {!open ? (
        <button
          onClick={openWidget}
          aria-label={t('chat.open')}
          className="relative rounded-full border border-white/15 bg-ink-2/90 p-3.5 text-spotlight shadow-glow-cyan backdrop-blur transition hover:scale-105"
        >
          <span aria-hidden="true">💬</span>
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-spotlight font-mono text-[10px] font-bold text-ink">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      ) : (
        <div
          role="dialog"
          aria-label={t('chat.open')}
          className="flex h-[26rem] max-h-[70vh] w-80 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink/95 shadow-2xl backdrop-blur"
        >
          {/* header */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
            <div className="flex items-center gap-2 text-sm text-cream">
              <span aria-hidden="true">{target === 'bot' ? '🤖' : '👤'}</span>
              {target === 'bot' ? t('chat.peer.bot') : t('chat.peer.human')}
              <span
                className={`h-2 w-2 rounded-full ${chatRef.current && !failed ? 'bg-success' : 'bg-cream-dim'}`}
                title={chatRef.current && !failed ? t('chat.online') : t('chat.connecting')}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTarget(target === 'bot' ? 'human' : 'bot')}
                className="rounded-full border border-spotlight/30 px-2.5 py-1 text-[11px] text-spotlight transition hover:bg-spotlight/10"
              >
                {target === 'bot' ? t('chat.escalate') : t('chat.deescalate')}
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label={t('chat.close')}
                className="px-1 text-cream-dim transition hover:text-cream"
              >
                ✕
              </button>
            </div>
          </div>

          {/* pesan */}
          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {failed ? (
              <p className="mt-6 text-center text-xs text-warn">{t('chat.login.error')}</p>
            ) : msgs.length === 0 ? (
              <p className="mt-6 px-4 text-center text-xs leading-relaxed text-cream-dim">
                {target === 'bot' ? t('chat.empty.bot') : t('chat.empty.human')}
              </p>
            ) : (
              msgs.map((m) => (
                <div key={m.id} className={m.mine ? 'text-right' : 'text-left'}>
                  <span
                    className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-left text-[13px] leading-relaxed ${
                      m.mine
                        ? 'bg-spotlight/90 text-ink'
                        : 'border border-white/10 bg-ink-3/80 text-cream'
                    }`}
                  >
                    {m.text}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* input */}
          <div className="flex gap-2 border-t border-white/10 p-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={t('chat.placeholder')}
              aria-label={t('chat.placeholder')}
              maxLength={1000}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-ink-2 px-3 py-2 text-sm text-cream outline-none placeholder:text-cream-dim/60 focus:border-spotlight/50"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              aria-label={t('chat.send')}
              className="rounded-lg bg-spotlight px-3.5 text-sm font-semibold text-ink transition hover:bg-white disabled:opacity-40"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
