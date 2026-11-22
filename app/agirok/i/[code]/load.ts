import { cache } from 'react';

import { fetchInvite, normalizeCode, type Invite, type InviteLang } from '@/utils/agirok/invite';

/** 한 요청 안에서 레이아웃·메타데이터·본문이 같은 초대를 한 번만 읽는다 */
export const loadInvite = cache(async (raw: string): Promise<{ code: string | null; invite: Invite | null; lang: InviteLang; expired: boolean }> => {
  const code = normalizeCode(decodeURIComponent(raw));
  const invite = code ? await fetchInvite(code) : null;
  return { code, invite, lang: invite?.lang ?? 'ko', expired: invite ? invite.expiresAt < Date.now() : false };
});
