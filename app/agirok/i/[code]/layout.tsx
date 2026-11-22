import { loadInvite } from './load';

/**
 * 아기록 초대 링크 페이지의 루트 레이아웃(사이트 머리·바닥 없이 한 장). <html lang>은 초대한 사람의 앱 언어.
 * 메신저 미리보기 태그는 page.tsx의 generateMetadata가 서버에서 넣는다(아기록 docs/decisions.md ‘초대 링크’).
 */
export default async function AgirokInviteLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ code: string }> }>) {
  const { lang } = await loadInvite((await params).code);
  return (
    <html lang={lang}>
      <body style={{ margin: 0, background: '#FFF7EE' }}>{children}</body>
    </html>
  );
}
