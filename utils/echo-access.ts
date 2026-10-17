/**
 * 메아리(Echo) 접근이 허용된 계정 목록.
 * 서버(레이아웃·서버 액션)와 클라이언트(메뉴 노출)가 같은 목록을 쓰도록 한 곳에서 관리합니다.
 */
export const ECHO_ALLOWED_EMAILS = ['devyyj@gmail.com', 'noticeably34@gmail.com'];

export function isEchoAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ECHO_ALLOWED_EMAILS.includes(email.trim().toLowerCase());
}
