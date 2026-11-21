import type { AppEntry } from '@/app/apps/_lib/apps';
import { FEEDBACK_APPS, type FeedbackApp } from '@/utils/feedback/handle-feedback';
import type { FeedbackTarget } from './feedback-dialog';

/** 의견 보내기 창에서 고를 앱: 사이트에 올린 앱 중 의견 API가 받는 앱만, 그 언어의 이름으로 */
export const feedbackTargets = (apps: AppEntry[]): FeedbackTarget[] =>
  apps
    .filter((a) => Object.hasOwn(FEEDBACK_APPS, a.slug))
    .map((a) => ({ app: a.slug as FeedbackApp, name: a.name }));
