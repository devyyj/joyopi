const adjectives = [
  '활기찬', '지혜로운', '용감한', '친절한', '행복한',
  '빛나는', '신비로운', '따뜻한', '멋진', '즐거운',
  '성실한', '창의적인', '강인한', '부드러운', '냉철한'
];

const nouns = [
  '요피', '구름', '바람', '햇살', '나무',
  '바다', '별빛', '달빛', '숲속', '대지',
  '강물', '들꽃', '바위', '하늘', '사자'
];

export function generateRandomNickname(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4자리 숫자
  
  return `${adj} ${noun}${randomNum}`;
}
