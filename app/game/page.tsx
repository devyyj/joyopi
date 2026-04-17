import RhythmGame from './RhythmGame';

export const metadata = {
  title: 'Rhythm Me',
  description: '박자 감각을 키우는 리듬 게임',
};

export default function GamePage() {
  return (
    <main className="min-h-screen bg-[#F7F9FF] flex flex-col items-center justify-center py-4">
      <RhythmGame />
    </main>
  );
}
