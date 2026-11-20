// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { formatSlackText, postToSlack } from './slack';
import type { FeedbackRecord } from './handle-feedback';

const rec: FeedbackRecord = {
  app: 'agirok',
  kind: 'bug',
  message: '화면이 너무 밝아요\n밤에 눈부셔요',
  email: 'parent@example.com',
  deviceId: 'dev-1234abcd',
  meta: { appVersion: '1.0.2', build: '11', os: 'iOS', osVersion: '18.1', device: 'iPhone15,2', lang: 'ko' },
  createdAt: new Date('2026-11-21T10:00:00Z'),
};

describe('formatSlackText', () => {
  it('앱 이름·종류·내용·기기 정보·답장 주소를 한 메시지로 만든다', () => {
    expect(formatSlackText(rec, 'fb1')).toBe(
      [
        '*[아기록]* 불편해요',
        '> 화면이 너무 밝아요',
        '> 밤에 눈부셔요',
        '1.0.2 (11) · iOS 18.1 · iPhone15,2 · ko',
        '답장: parent@example.com',
        '`fb1`',
      ].join('\n'),
    );
  });

  it('칩·이메일·기기 정보가 없으면 그 자리를 비우거나 「답장 안 받음」으로 쓴다', () => {
    const text = formatSlackText({ ...rec, app: 'rockgazing', kind: null, email: null, meta: {} }, 'fb2');
    expect(text).toBe(['*[돌보기]* 의견', '> 화면이 너무 밝아요', '> 밤에 눈부셔요', '답장 안 받음', '`fb2`'].join('\n'));
  });

  it('사용자 글의 <, >, &를 바꿔 @channel 같은 멘션·링크가 동작하지 않게 한다', () => {
    const text = formatSlackText({ ...rec, message: '<!channel> a&b <https://x.com|클릭>' }, 'fb3');
    expect(text).toContain('> &lt;!channel&gt; a&amp;b &lt;https://x.com|클릭&gt;');
    expect(text).not.toContain('<!channel>');
  });
});

describe('postToSlack', () => {
  it('Webhook 주소로 text를 JSON으로 보낸다', async () => {
    const fetchFn = vi.fn(async () => new Response('ok', { status: 200 }));
    await postToSlack('https://hooks.slack.com/services/T/B/X', 'hello', fetchFn);
    expect(fetchFn).toHaveBeenCalledWith('https://hooks.slack.com/services/T/B/X', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hello' }),
    });
  });

  it('Slack이 실패 응답을 주면 던진다', async () => {
    const fetchFn = vi.fn(async () => new Response('no_service', { status: 404 }));
    await expect(postToSlack('https://hooks.slack.com/services/T/B/X', 'hello', fetchFn)).rejects.toThrow('404');
  });
});
