import { db } from '@/db';
import { nameRanks, profiles } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import NameRankContainer from './components/name-rank-container';

export const revalidate = 0; // 동적 페이지로 설정

export default async function NameRankPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/name-rank');
  }

  // 관리자 권한 여부 확인
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile || profile.role !== 'admin') {
    // 관리자가 아닐 경우 경고 혹은 메인 리다이렉트
    redirect('/');
  }

  // 아빠/엄마 이름 목록 조회
  const dadNames = await db
    .select()
    .from(nameRanks)
    .where(eq(nameRanks.role, 'dad'))
    .orderBy(asc(nameRanks.rank));

  const momNames = await db
    .select()
    .from(nameRanks)
    .where(eq(nameRanks.role, 'mom'))
    .orderBy(asc(nameRanks.rank));

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-50/50 via-white to-sky-50/50 text-neutral-800 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* 헤더 영역 */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/5 border border-rose-500/10 text-rose-500 text-xs font-bold tracking-wider uppercase">
            👑 Admin Exclusive
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text bg-gradient-to-r from-rose-400 via-pink-500 to-sky-400 text-transparent">
            name rank
          </h1>
          <p className="text-sm md:text-base text-neutral-500 max-w-xl mx-auto font-medium">
            곧 태어날 아이의 이름을 아빠와 엄마의 관점에서 각각 정리하고 순위를 조율하는 프라이빗 연구실입니다.
          </p>
        </div>

        {/* 메인 조율 컨테이너 */}
        <NameRankContainer 
          initialDadNames={dadNames} 
          initialMomNames={momNames} 
          currentUserEmail={user.email || ''} 
        />
      </div>
    </div>
  );
}
