import { FEEDBACK_APPS, type FeedbackKind, type FeedbackRecord } from './handle-feedback';

const KIND_LABEL: Record<FeedbackKind, string> = { bug: '불편해요', idea: '이런 기능 원해요', other: '기타' };

/** Slack mrkdwn에서 특별한 뜻을 갖는 문자. 사용자 글이 멘션(<!channel>)·링크가 되지 않게 바꾼다 */
function escapeSlack(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Slack 채널에 올릴 한 메시지. 앱·종류 / 인용한 내용 / 기기 정보 / 답장 주소 / 저장 문서 ID */
export function formatSlackText(rec: FeedbackRecord, id: string): string {
  const { meta } = rec;
  const version = meta.appVersion ? `${meta.appVersion}${meta.build ? ` (${meta.build})` : ''}` : '';
  const os = [meta.os, meta.osVersion].filter(Boolean).join(' ');
  const device = [version, os, meta.device, meta.lang].filter(Boolean).join(' · ');

  const lines = [
    `*[${FEEDBACK_APPS[rec.app]}]* ${rec.kind ? KIND_LABEL[rec.kind] : '의견'}`,
    ...escapeSlack(rec.message)
      .split('\n')
      .map((l) => `> ${l}`),
  ];
  if (device) lines.push(escapeSlack(device));
  lines.push(rec.email ? `답장: ${escapeSlack(rec.email)}` : '답장 안 받음');
  lines.push(`\`${id}\``);
  return lines.join('\n');
}

/** Slack Incoming Webhook으로 보낸다. 실패 응답이면 던진다 */
export async function postToSlack(webhookUrl: string, text: string, fetchFn: typeof fetch = fetch): Promise<void> {
  const res = await fetchFn(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Slack webhook ${res.status}`);
}
