import { describe, it, expect } from 'vitest';
import { getMemeByAction, getMemeByGesture, MemeActionId } from './memeMapper';

describe('memeMapper - 동작 및 표정 밈 매핑 테스트', () => {
  it('동작 액션 ID를 기반으로 매핑된 밈 정보를 올바르게 가져와야 함', () => {
    const muyahoMeme = getMemeByAction('FACE_BIG_SMILE');
    expect(muyahoMeme).toBeDefined();
    expect(muyahoMeme?.imagePath).toContain('bigsmile');
    expect(muyahoMeme?.title).toBe('무야호 할아버지');

    const ttabongMeme = getMemeByAction('HAND_THUMBSUP');
    expect(ttabongMeme?.imagePath).toContain('thumbsup');
    expect(ttabongMeme?.title).toBe('따봉 도치');
  });

  it('정의되지 않은 액션 ID인 경우 undefined를 리턴해야 함', () => {
    const invalidMeme = getMemeByAction('INVALID_ACTION' as unknown as MemeActionId);
    expect(invalidMeme).toBeUndefined();
  });

  it('MediaPipe 감지 결과(제스처/표정)를 기반으로 대응하는 밈 정보를 얻어야 함', () => {
    const thumbsResult = getMemeByGesture('ThumbsUp');
    expect(thumbsResult?.actionId).toBe('HAND_THUMBSUP');

    const peaceResult = getMemeByGesture('Peace');
    expect(peaceResult?.actionId).toBe('HAND_PEACE');

    const noneResult = getMemeByGesture('None');
    expect(noneResult).toBeNull();
  });
});
