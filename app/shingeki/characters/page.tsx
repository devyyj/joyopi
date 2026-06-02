'use client';

import React from 'react';
import Image from 'next/image';
import { CHARACTERS } from '../../actions/shingekiData';

export default function ShingekiCharactersPage() {
  const characters = Object.values(CHARACTERS);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-12 border-b border-neutral-800 pb-6">
        <h1 className="text-3xl font-black text-[#8B0000] tracking-wider mb-2">
          심장을 바쳐라! 캐릭터 도감
        </h1>
        <p className="text-neutral-400 text-sm">
          현재 등록된 20명의 캐릭터와 이미지 매칭 상태를 확인하는 관리용 페이지입니다. (4 x 5 그리드)
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {characters.map((char) => (
            <div 
              key={char.name} 
              className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]"
            >
              <div className="relative aspect-[3/4] w-full bg-neutral-950">
                <Image
                  src={char.imageUrl}
                  alt={char.name}
                  fill
                  className="object-cover"
                  sizes="(max-w-768px) 50vw, (max-w-1024px) 25vw, 20vw"
                />
              </div>
              <div className="p-4 text-center">
                <h2 className="font-bold text-sm text-white mb-1 truncate">
                  {char.name}
                </h2>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-tighter truncate">
                  {char.title}
                </p>
                <p className="mt-2 text-[9px] text-neutral-500 font-mono truncate">
                  {char.imageUrl.split('/').pop()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 pt-6 border-t border-neutral-800 text-center text-[10px] text-neutral-600">
        &copy; 2026 Joyopi Laboratory - Shingeki Personality Test Admin
      </footer>
    </div>
  );
}
