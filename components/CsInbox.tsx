'use client';

/*
 * CsInbox — inbox pemilik di /cs untuk membalas pesan tamu widget chat.
 *
 *  1) Pemilik menempel CS_ADMIN_TOKEN (disimpan di sessionStorage saja).
 *  2) Token diverifikasi server (/api/chat/owner-sig) -> UserSig niu_owner.
 *  3) Login ke Tencent Chat -> daftar percakapan C2C dengan tamu (guest_*)
 *     -> pilih percakapan -> balas.
 *
 * SDK (ratusan KB) baru dimuat SETELAH token diverifikasi — pengunjung
 * biasa yang tersesat ke /cs tidak mengunduh apa pun.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Conv {
  conversationID: string;
  peer: string;
  preview: string;
  unread: number;
  at: number;
}

interface Msg {
  id: string;
  mine: boolean;
  text: string;
}

type Phase = 'locked' | 'connecting' | 'ready' | 'denied';

const TOKEN_KEY = 'niu.cs.token';

export default function CsInbox() {
  const { t } = useLocale();

  const [phase, setPhase] = useState<Phase>('locked');
  const [token, setToken] = useState('');
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const chatRef = useRef<any>(null);
  const sdkRef = useRef<any>(null);
  const seenRef = useRef(new Set<string>());
  const listRef = useRef<HTMLDivElement>(null);

  const refreshConvs = useCallback(async () => {
    const chat = chatRef.current;
    if (!chat) return;
    try {
      const resp = await chat.getConversationList();
      const list = (resp.data.conversationList as any[])
        .filter((c) => c.type === (sdkRef.current as any).TYPES.CONV_C2C)
        .filter((c) => c.userProfile?.userID?.startsWith('guest_'))
        .map((c) => ({
          conversationID: c.conversationID as string,
          peer: c.userProfile.userID as string,
          preview: String(c.lastMessage?.messageForShow ?? '').slice(0, 60),
          unread: Number(c.unreadCount ?? 0),
          at: Number(c.lastMessage?.lastTime ?? 0),
        }))
        .sort((a, b) => b.at - a.at);
      setConvs(list);
    } catch (e) {
      console.error('[CsInbox] gagal memuat percakapan:', e);
    }
  }, []);

  const loadThread = useCallback(async (conversationID: string) => {
    const chat = chatRef.current;
    if (!chat) return;
    try {
      const resp = await chat.getMessageList({ conversationID, count: 50 });
      const list = (resp.data.messageList as any[])
        .filter((m) => m.type === (sdkRef.current as any).TYPES.MSG_TEXT)
        .sort((a, b) => a.time - b.time)
        .map((m) => ({ id: m.ID as string, mine: m.flow === 'out', text: m.payload.text }));
      seenRef.current = new Set(list.map((m) => m.id));
      setMsgs(list);
      if (typeof chat.setMessageRead === 'function') {
        chat.setMessageRead({ conversationID }).catch(() => {});
      }
      void refreshConvs();
    } catch (e) {
      console.error('[CsInbox] gagal memuat pesan:', e);
    }
  }, [refreshConvs]);

  // ---- masuk sebagai pemilik ----
  const connect = useCallback(
    async (tok: string) => {
      setPhase('connecting');
      try {
        const res = await fetch('/api/chat/owner-sig', {
          method: 'POST',
          headers: { 'x-cs-token': tok },
          cache: 'no-store',
        });
        if (!res.ok) {
          setPhase('denied');
          return;
        }
        const { sdkAppId, userId, userSig } = (await res.json()) as {
          sdkAppId: number;
          userId: string;
          userSig: string;
        };

        const mod = await import('@tencentcloud/chat');
        const TencentCloudChat = mod.default;
        sdkRef.current = TencentCloudChat;
        const { EVENT, TYPES } = TencentCloudChat as any;

        const chat = TencentCloudChat.create({ SDKAppID: sdkAppId });
        chat.on(EVENT.MESSAGE_RECEIVED, (e: { data: any[] }) => {
          for (const m of e.data) {
            if (m.type !== TYPES.MSG_TEXT || m.flow !== 'in') continue;
            if (!seenRef.current.has(m.ID)) {
              seenRef.current.add(m.ID);
              setActive((cur) => {
                if (cur === m.conversationID) {
                  setMsgs((prev) => [...prev, { id: m.ID, mine: false, text: m.payload.text }]);
                }
                return cur;
              });
            }
          }
          void refreshConvs();
        });
        chat.on(EVENT.CONVERSATION_LIST_UPDATED, () => void refreshConvs());

        await chat.login({ userID: userId, userSig });
        chatRef.current = chat;
        try {
          sessionStorage.setItem(TOKEN_KEY, tok);
        } catch {
          /* abaikan */
        }
        setPhase('ready');
        await refreshConvs();
      } catch (e) {
        console.error('[CsInbox] koneksi gagal:', e);
        setPhase('denied');
      }
    },
    [refreshConvs],
  );

  // Pulihkan sesi dari sessionStorage (hanya tab ini).
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(TOKEN_KEY);
      if (saved) void connect(saved);
    } catch {
      /* abaikan */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh ringan berkala menjaga daftar tetap segar.
  useEffect(() => {
    if (phase !== 'ready') return;
    const iv = setInterval(() => void refreshConvs(), 20_000);
    return () => clearInterval(iv);
  }, [phase, refreshConvs]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs]);

  const send = async () => {
    const text = input.trim();
    const chat = chatRef.current;
    if (!text || !chat || !active || busy) return;
    setBusy(true);
    try {
      const peer = active.replace(/^C2C/, '');
      const message = chat.createTextMessage({
        to: peer,
        conversationType: (sdkRef.current as any).TYPES.CONV_C2C,
        payload: { text },
      });
      const resp = await chat.sendMessage(message);
      seenRef.current.add(resp.data.message.ID);
      setMsgs((prev) => [...prev, { id: resp.data.message.ID, mine: true, text }]);
      setInput('');
      void refreshConvs();
    } catch (e) {
      console.error('[CsInbox] gagal mengirim:', e);
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    try {
      await chatRef.current?.logout();
    } catch {
      /* abaikan */
    }
    chatRef.current = null;
    setPhase('locked');
    setToken('');
    setConvs([]);
    setActive(null);
    setMsgs([]);
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* abaikan */
    }
  };

  // ---------- layar kunci ----------
  if (phase === 'locked' || phase === 'connecting' || phase === 'denied') {
    return (
      <section className="mx-auto mt-24 max-w-sm rounded-2xl border border-white/10 bg-ink-2/80 p-6 backdrop-blur">
        <h1 className="font-display text-2xl text-cream">{t('cs.title')}</h1>
        <p className="mt-1 text-xs text-cream-dim">{t('cs.subtitle', { owner: 'niu_owner' })}</p>
        <label htmlFor="cs-token" className="mt-6 block font-mono text-[11px] uppercase tracking-wider text-cream-dim">
          {t('cs.token.label')}
        </label>
        <input
          id="cs-token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && token.trim() && void connect(token.trim())}
          placeholder={t('cs.token.placeholder')}
          className="mt-2 w-full rounded-lg border border-white/10 bg-ink px-3 py-2.5 text-sm text-cream outline-none placeholder:text-cream-dim/60 focus:border-spotlight/50"
        />
        {phase === 'denied' && (
          <p className="mt-3 text-xs text-danger">{t('cs.unauthorized')}</p>
        )}
        <button
          onClick={() => void connect(token.trim())}
          disabled={!token.trim() || phase === 'connecting'}
          className="mt-4 w-full rounded-lg bg-ember py-2.5 text-sm font-semibold text-ink transition hover:bg-ember-soft disabled:opacity-40"
        >
          {phase === 'connecting' ? '…' : t('cs.login')}
        </button>
      </section>
    );
  }

  // ---------- inbox ----------
  return (
    <section className="flex h-[calc(100vh-5rem)] flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cream">{t('cs.title')}</h1>
          <p className="text-xs text-cream-dim">{t('cs.subtitle', { owner: 'niu_owner' })}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void refreshConvs()}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-cream-dim transition hover:text-cream"
          >
            {t('cs.refresh')}
          </button>
          <button
            onClick={() => void logout()}
            className="rounded-lg border border-ember/40 px-3 py-1.5 text-xs text-ember-soft transition hover:bg-ember/10"
          >
            {t('cs.logout')}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-4">
        {/* daftar percakapan */}
        <aside
          className={`w-full flex-col gap-1 overflow-y-auto rounded-2xl border border-white/10 bg-ink-2/60 p-2 md:flex md:w-72 ${active ? 'hidden' : 'flex'}`}
        >
          <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-cream-dim">
            {t('cs.inbox')}
          </p>
          {convs.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs leading-relaxed text-cream-dim">
              {t('cs.empty')}
            </p>
          ) : (
            convs.map((c) => (
              <button
                key={c.conversationID}
                onClick={() => {
                  setActive(c.conversationID);
                  void loadThread(c.conversationID);
                }}
                className={`rounded-xl px-3 py-2.5 text-left transition ${
                  active === c.conversationID ? 'bg-ink-3' : 'hover:bg-ink-3/60'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-xs text-cream">{c.peer}</span>
                  {c.unread > 0 && (
                    <span className="rounded-full bg-spotlight px-1.5 py-0.5 font-mono text-[9px] font-bold text-ink">
                      {c.unread}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-cream-dim">
                  {c.preview || '—'}
                </span>
              </button>
            ))
          )}
        </aside>

        {/* utas aktif */}
        <div
          className={`min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-2/60 md:flex ${active ? 'flex' : 'hidden'}`}
        >
          {active ? (
            <>
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
                <button
                  onClick={() => setActive(null)}
                  className="rounded px-2 py-1 text-xs text-cream-dim hover:text-cream md:hidden"
                  aria-label="kembali"
                >
                  ←
                </button>
                <span className="truncate font-mono text-xs text-cream">{active.replace(/^C2C/, '')}</span>
              </div>
              <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
                {msgs.map((m) => (
                  <div key={m.id} className={m.mine ? 'text-right' : 'text-left'}>
                    <span
                      className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-left text-[13px] leading-relaxed ${
                        m.mine
                          ? 'bg-ember/90 text-ink'
                          : 'border border-white/10 bg-ink-3/80 text-cream'
                      }`}
                    >
                      {m.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 border-t border-white/10 p-2.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder={t('cs.reply.placeholder')}
                  aria-label={t('cs.reply.placeholder')}
                  maxLength={1500}
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-cream outline-none placeholder:text-cream-dim/60 focus:border-ember/60"
                />
                <button
                  onClick={send}
                  disabled={busy || !input.trim()}
                  aria-label={t('cs.send')}
                  className="rounded-lg bg-ember px-4 text-sm font-semibold text-ink transition hover:bg-ember-soft disabled:opacity-40"
                >
                  ➤
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
