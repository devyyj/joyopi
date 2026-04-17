import RhythmGame from './RhythmGame';
import HomeButton from '../components/HomeButton';

export const metadata = {
  title: '리듬 캣 · JOYOPI',
  description: '고양이와 함께하는 60초 리듬 게임',
};

export default function GamePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-6 px-4" style={{ background: '#F4F6FF' }}>

      {/* 홈 이동 버튼 - 기본 기능 요구사항 */}
      <div className="w-full max-w-[400px] mb-4 flex">
        <HomeButton />
      </div>

      <RhythmGame />
    </main>
  );
}
