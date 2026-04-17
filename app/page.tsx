import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f0f4ff] flex flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-black text-slate-800 tracking-widest">Rhythm Me</h1>
      <p className="text-slate-400 text-sm">박자 감각을 키우는 리듬 게임</p>
      <Link
        href="/game"
        className="px-8 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-full text-sm transition-colors shadow-md"
      >
        시작하기
      </Link>
    </main>
  );
}
