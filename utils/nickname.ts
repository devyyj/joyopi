const nouns = [
  '구름', '바람', '햇살', '나무',
  '바다', '별빛', '달빛', '숲속', '대지',
  '강물', '들꽃', '바위', '하늘', '사자'
];

export function generateRandomNickname(): string {
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4자리 숫자

  return `${noun}${randomNum}`;
}
