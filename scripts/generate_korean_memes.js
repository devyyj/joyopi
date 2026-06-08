const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../public/images/memes');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const memes = [
  { file: '01_muyaho.svg', title: '무야호 할아버지', emoji: '👴🎉', color: '#f59e0b', text: '무야호~!!' },
  { file: '02_bongsun.svg', title: '상상도 못한 정체', emoji: '🙆‍♀️✨', color: '#ec4899', text: 'ㄴ(°o°)ㄱ' },
  { file: '03_kwak.svg', title: '묻고 더블로 가!', emoji: '✌️🃏', color: '#10b981', text: '묻고 더블로 가!' },
  { file: '04_four_dollars.svg', title: '사딸라!', emoji: '💵🖐', color: '#3b82f6', text: '사딸라!!' },
  { file: '05_munhee.svg', title: '호박고구마!', emoji: '🍠🔥', color: '#ef4444', text: '호박고구마!!!' },
  { file: '06_seho.svg', title: '모르는데 어떻게 가요!', emoji: '🤷‍♂️❓', color: '#8b5cf6', text: '모르는데 어떻게 가요!' },
  { file: '07_hyunyoung.svg', title: '주기자', emoji: '🎤🥺', color: '#f43f5e', text: '어... 젊음이 가득한...' },
  { file: '08_junggu.svg', title: '갈 때 가더라도...', emoji: '🚬😏', color: '#64748b', text: '담배 한 대 정도는 괜찮잖아?' },
  { file: '09_myungsoo.svg', title: '진짜 늦은 거다', emoji: '👴💡', color: '#a855f7', text: '늦었다고 생각할 때가 진짜 늦었다' },
  { file: '10_simyoung.svg', title: '내가 고자라니!', emoji: '🛌🚑', color: '#06b6d4', text: '내가... 내가 고자라니!!' },
  { file: '11_jjanggu.svg', title: '짱구 능글 미소', emoji: '👦😏', color: '#eab308', text: '헤헤~ 예쁜 누나 발견!' },
  { file: '12_gildong.svg', title: '고길동 정색', emoji: '🧑🗡️', color: '#1e293b', text: '둘리... 이 녀석들...' },
  { file: '13_pikachu.svg', title: '피카츄 깜짝 놀람', emoji: '⚡😮', color: '#eab308', text: 'Pika...?' },
  { file: '14_jingjing.svg', title: '징징이 지루함', emoji: '🦑🥱', color: '#0ea5e9', text: '하아... 오늘 퇴근은 언제야' },
  { file: '15_pepe.svg', title: '슬픈 페페', emoji: '🐸😭', color: '#22c55e', text: '인생 참...' },
  { file: '16_ttabong.svg', title: '따봉 도치', emoji: '🦔👍', color: '#84cc16', text: '따봉도치야 고마워!' },
  { file: '17_cat_angry.svg', title: '하악질 고양이', emoji: '🐱💢', color: '#f97316', text: '하아악!!!' },
  { file: '18_cat_smile.svg', title: '억지 미소 고양이', emoji: '😸😬', color: '#14b8a6', text: '치즈~ (억지 미소)' },
  { file: '19_raccoon.svg', title: '공부해라 너구리', emoji: '🦝✍️', color: '#78350f', text: '공부해라 인간아!' },
  { file: '20_monkey.svg', title: '눈치 원숭이', emoji: '🐵👀', color: '#d97706', text: '흐린 눈... (눈치)' },
  { file: '21_doge.jpg', fileReal: '21_doge.svg', title: '근육 댕댕이', emoji: '🐕💪', color: '#f59e0b', text: '강-인' },
  { file: '22_calmdown.svg', title: '침착맨 킹받는 표정', emoji: '🧔😏', color: '#475569', text: '오히려 좋아~ 킹받쥬?' },
  { file: '23_dex.svg', title: '덱스 윙크', emoji: '🦊😉', color: '#db2777', text: '플러팅 개시' },
  { file: '24_kwaktube.svg', title: '곽튜브 억울', emoji: '🍲🥺', color: '#ca8a04', text: '저한테 왜 그러세요...' },
  { file: '25_iu.svg', title: '눈물이 차올라 고개 들어', emoji: '🎤⛅', color: '#a855f7', text: '눈물이 차올라서 고갤 들어~' },
  { file: '26_jaypark.svg', title: '박재범 몸매 포즈', emoji: '🕺😎', color: '#6366f1', text: '몸매 (Mommae)' },
  { file: '27_dokin.svg', title: '짤랑이 화남', emoji: '😈💢', color: '#f43f5e', text: '흥! 나 화났어!' },
  { file: '28_dongseok.svg', title: '마동석 주먹', emoji: '👊🐻', color: '#1e293b', text: '진실의 방으로.' },
  { file: '29_jadoo.svg', title: '자두 메롱', emoji: '👧👅', color: '#f43f5e', text: '메롱~ 약오르지롱!' },
  { file: '30_pingu.svg', title: '핑구 믑믑', emoji: '🐧📢', color: '#0f172a', text: '믑믑!!! (Noot Noot)' }
];

memes.forEach(m => {
  const fileName = m.fileReal || m.file;
  const filePath = path.join(targetDir, fileName);

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
    <defs>
      <linearGradient id="grad-${m.title}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${m.color};stop-opacity:0.25" />
        <stop offset="100%" style="stop-color:#0f172a;stop-opacity:0.95" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad-${m.title})" rx="40" stroke="${m.color}" stroke-width="4"/>
    
    <!-- 밈 타이틀 헤더 -->
    <rect x="20" y="20" width="460" height="50" rx="15" fill="#1e293b" opacity="0.8"/>
    <text x="50%" y="52" font-family="'Inter', 'Noto Sans KR', sans-serif" font-size="18" font-weight="bold" fill="#f8fafc" text-anchor="middle">
      ${m.title}
    </text>

    <!-- 중앙 이모지 & 그래픽 연출 -->
    <circle cx="250" cy="230" r="90" fill="#1e293b" stroke="${m.color}" stroke-width="3" opacity="0.9"/>
    <text x="250" y="260" font-size="80" text-anchor="middle">${m.emoji}</text>

    <!-- 말풍선 / 자막 영역 -->
    <rect x="40" y="360" width="420" height="90" rx="20" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    <text x="50%" y="412" font-family="'Inter', 'Noto Sans KR', sans-serif" font-size="22" font-weight="extrabold" fill="#f1f5f9" text-anchor="middle">
      "${m.text}"
    </text>
  </svg>`;

  fs.writeFileSync(filePath, svgContent, 'utf-8');
});

console.log('Successfully generated 30 Korean meme vector placeholders!');
