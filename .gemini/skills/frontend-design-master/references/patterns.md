# YOPI LAND UI Patterns (Tailwind CSS v4)

이 문서는 "요피 랜드" 테마를 일관되게 구현하기 위한 코드 조각들을 제공합니다.

## 1. Glassmorphism Card (글래스모피즘 카드)
단순한 흰색 배경 대신, 배경이 미세하게 비치고 테두리에 그라데이션이 있는 카드를 지향합니다.

```tsx
<div className="group relative p-8 bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-500">
  {/* 보더 그라데이션 효과 (Hover 시 발광) */}
  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-transparent to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
  
  {/* 콘텐츠 영역 */}
  <div className="relative z-10">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-6 group-hover:scale-110 transition-transform">
      {/* Icon or Emoji */}
      🚀
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-500 transition-colors">제목</h3>
    <p className="text-sm text-slate-500 leading-relaxed">설명 텍스트입니다. 가독성을 고려한 행간을 유지합니다.</p>
  </div>
</div>
```

## 2. Interactive Buttons (인터랙티브 버튼)
클릭 시 눌리는 느낌과 호버 시 퍼지는 빛(Glow) 효과를 강조합니다.

```tsx
<button className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 hover:shadow-indigo-500/50 active:scale-95 transition-all">
  시작하기
</button>

<button className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-500 active:scale-95 transition-all">
  자세히 보기
</button>
```

## 3. Typography (타이포그래피)
- **Main Heading**: `tracking-tighter`, `leading-tight`와 함께 `bg-clip-text` 그라데이션을 사용합니다.
- **Label**: 소문자보다 대문자(`uppercase`)와 `tracking-widest`를 사용하여 정돈된 느낌을 줍니다.

```tsx
<h1 className="text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-600 to-violet-600">
  Dream Big, <br /> Code Hard.
</h1>
```
