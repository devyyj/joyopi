'use client';

import { useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, X } from 'lucide-react';
import type { Lang } from '@/app/_i18n/config';
import { getDictionary } from '@/app/_i18n/dictionary';
import type { FeedbackApp, FeedbackKind } from '@/utils/feedback/handle-feedback';
import { getDeviceId, sendFeedback, type SendResult } from './feedback-client';
import { NewWindowIcon } from '../external-link';

export interface FeedbackTarget {
  app: FeedbackApp;
  name: string;
}

interface FeedbackButtonProps {
  lang: Lang;
  /** 고를 수 있는 앱(사이트 전체는 맨 앞에 자동으로 붙는다) */
  apps: FeedbackTarget[];
  className?: string;
  children: ReactNode;
}

const KINDS: FeedbackKind[] = ['bug', 'idea', 'other'];

const chip = (on: boolean) =>
  `min-h-11 rounded-full border-2 px-4 text-sm transition-colors cursor-pointer ${
    on ? 'border-[#1B1B1B] bg-[#1B1B1B] text-[#F5F2EA]' : 'border-[#E6E0D2] bg-white text-[#1B1B1B] hover:border-[#1B1B1B]'
  }`;

/**
 * 「의견 보내기」 버튼과 창. 앱 안 의견 보내기 시트와 같은 규칙(business/apps/common.md 4장)으로,
 * 로그인 없이 공통 의견 API로 보낸다. 실패하면 쓴 글을 지우지 않는다.
 */
export default function FeedbackButton({ lang, apps, className, children }: FeedbackButtonProps) {
  const t = getDictionary(lang).feedback;
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<FeedbackApp>('joyopi');
  const [kind, setKind] = useState<FeedbackKind | null>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  const targets: FeedbackTarget[] = [{ app: 'joyopi', name: t.site }, ...apps];
  const ready = message.trim().length > 0 && !sending;
  const done = result === 'ok';

  const reset = () => {
    setTarget('joyopi');
    setKind(null);
    setMessage('');
    setEmail('');
    setResult(null);
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    // 보낸 뒤 닫으면 다음에 빈 창으로 연다. 못 보낸 글은 그대로 둔다
    if (!next && done) reset();
  };

  const submit = async () => {
    if (!ready) return;
    setSending(true);
    const deviceId = getDeviceId(typeof window === 'undefined' ? null : window.localStorage, () =>
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    setResult(await sendFeedback({ app: target, kind, message, email, lang }, deviceId));
    setSending(false);
  };

  const mailHref = `mailto:hello@joyopi.com?subject=${encodeURIComponent('[joyopi.com] ' + t.title)}`;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button type="button" className={className}>
          {children}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-[#1B1B1B]/55" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed z-[70] inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-[32px] bg-white p-6 text-[#1B1B1B] shadow-2xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[500px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[32px] sm:p-7"
        >
          {done ? (
            <div className="px-2 pb-2 pt-6 text-center">
              <div aria-hidden="true" className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#CFE8DC]">
                <Check className="h-10 w-10" strokeWidth={2.4} />
              </div>
              <Dialog.Title className="mt-5 font-display text-3xl">{t.doneTitle}</Dialog.Title>
              <p className="mt-2 text-[15px] leading-relaxed text-[#4A453E]">{t.doneBody}</p>
              <Dialog.Close className="mt-6 min-h-13 w-full cursor-pointer rounded-full bg-[#1B1B1B] text-base text-[#F5F2EA]">
                {t.close}
              </Dialog.Close>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Dialog.Title className="font-display text-[28px] leading-tight">{t.title}</Dialog.Title>
                  <p className="mt-1 text-sm text-[#5E584F]">{t.lead}</p>
                </div>
                <Dialog.Close
                  aria-label={t.close}
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F5F2EA]"
                >
                  <X className="h-[18px] w-[18px]" aria-hidden="true" />
                </Dialog.Close>
              </div>

              <fieldset className="mt-5">
                <legend className="mb-2 text-sm font-bold">{t.target}</legend>
                <div className="flex flex-wrap gap-1.5">
                  {targets.map((x) => (
                    <button key={x.app} type="button" aria-pressed={target === x.app} onClick={() => setTarget(x.app)} className={chip(target === x.app)}>
                      {x.name}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-4">
                <legend className="mb-2 text-sm font-bold">
                  {t.kind} <span className="font-normal text-[#5E584F]">{t.optional}</span>
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  {KINDS.map((k) => (
                    <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(kind === k ? null : k)} className={chip(kind === k)}>
                      {t.kinds[k]}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label htmlFor="feedback-message" className="mb-2 mt-4 block text-sm font-bold">
                {t.message}
              </label>
              <textarea
                id="feedback-message"
                rows={4}
                maxLength={2000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.placeholder}
                className="w-full resize-none rounded-[18px] border-2 border-[#E6E0D2] bg-[#FBFAF6] p-3.5 text-[15px] outline-none focus:border-[#E8590C]"
              />

              <label htmlFor="feedback-email" className="mb-2 mt-3.5 block text-sm font-bold">
                {t.email} <span className="font-normal text-[#5E584F]">{t.emailOptional}</span>
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="min-h-12 w-full rounded-full border-2 border-[#E6E0D2] bg-[#FBFAF6] px-[18px] text-[15px] outline-none focus:border-[#E8590C]"
              />

              {(result === 'failed' || result === 'rate-limited') && (
                <p role="alert" className="mt-3.5 rounded-2xl bg-[#FDE7DC] px-4 py-3 text-sm text-[#8A3208]">
                  {result === 'failed' ? t.failed : t.rateLimited}
                </p>
              )}

              <button
                type="submit"
                disabled={!ready}
                className="mt-[18px] min-h-13 w-full rounded-full text-base enabled:cursor-pointer enabled:bg-[#E8590C] enabled:text-[#1B1B1B] disabled:bg-[#E6E0D2] disabled:text-[#6A645B]"
              >
                {sending ? t.sending : result === 'failed' ? t.resend : t.send}
              </button>
              <p className="mt-3 text-center text-[13px] text-[#5E584F]">
                {t.mailLead}{' '}
                <a href={mailHref} className="inline-flex items-center gap-1 text-[#1B1B1B] underline underline-offset-2">
                  {t.mailLink}
                  <NewWindowIcon className="h-[0.85em] w-[0.85em]" />
                  <span className="sr-only">{getDictionary(lang).nav.newWindow}</span>
                </a>
              </p>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
