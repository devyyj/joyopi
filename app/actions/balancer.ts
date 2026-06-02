import { writeFileSync } from 'fs';

const CHAR_NAMES = [
  '에렌 예거', '미카사 아커만', '아르민 알레르토', '리바이 아커만', '엘빈 스미스',
  '한지 조에', '장 키르슈타인', '사샤 브라우스', '코니 스프링거', '히스토리아 레이스',
  '라이너 브라운', '애니 레온하트', '지크 예거', '가비 브라운', '팔코 글라이스',
  '플록 포르스터', '턱 거인', '차력 거인', '초대형 거인', '갑옷 거인'
];

// Target slots per character across 96 options:
// 5pts: 5 times
// 4pts: 5 times
// 3pts: 5 times
// 2pts: 4 times
// 1pt: 5 times
// Total potential points: 73. Total slots: 24.
// Total pool slots: 24 * 20 = 480.
// Pool slots per option: 480 / 96 = 5.

const pool: number[] = [];
// Points: 5, 4, 3, 2, 1
[5, 4, 3, 2, 1].forEach(pt => {
  const count = pt === 2 ? 4 : 5;
  CHAR_NAMES.forEach(name => {
    for (let i = 0; i < count; i++) {
      pool.push(pt);
    }
  });
});

// We need to assign each point in the pool to a character and a question option.
// Let's create a more structured pool: Array of { name, pt }
const characterPoints: { name: string, pt: number }[] = [];
[5, 4, 3, 2, 1].forEach(pt => {
  const count = pt === 2 ? 4 : 5;
  CHAR_NAMES.forEach(name => {
    for (let i = 0; i < count; i++) {
      characterPoints.push({ name, pt });
    }
  });
});

// Shuffle pool to distribute
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// But we need to ensure Lore consistency.
// Let's define "Primary Personality" groups for questions.
const QUESTIONS_BASE = [
  { id: 1, category: '위기 대처', question: '예상치 못한 거인의 기습으로 대열이 붕괴되었습니다. 이때 당신의 즉각적인 대응 방식은 무엇입니까?', options: ['망설임 없이 돌격하여 적의 시선을 나에게 유인한다.', '뒤로 물러나 즉시 방어선을 재구축하며 기회를 엿본다.', '위험에 처한 주변의 동료를 최우선으로 보호한다.', '침착하게 적의 이동 경로와 약점을 파악해 베어 넘긴다.'] },
  { id: 2, category: '행동 양식', question: '작전 도중 중요한 장비가 고장 났을 때, 당신이 문제를 해결하는 스타일은 무엇인가요?', options: ['기발한 임기응변을 발휘해 주변 사물로 대체품을 만들어낸다.', '매뉴얼을 준수하며 원인을 찾아 차근차근 수리한다.', '자신의 직관과 감각을 믿고 일단 직접 고쳐본다.', '전문가에게 수리를 맡기고 나는 그동안 지원 업무에 집중한다.'] },
  { id: 3, category: '행동 양식', question: '성공 확률이 낮아 보이는 위험한 극비 임무의 대장을 맡아달라는 제안을 받는다면?', options: ['무거운 책임감을 짊어지고 대담하게 제안을 수락한다.', '임무의 성공 확률과 리스크를 철저히 계산한 뒤 결정한다.', '조직을 위해 내가 해야 할 당연한 의무이기에 받아들인다.', '내 방식대로 자유롭게 지휘할 수 있는 조건이라면 수락한다.'] },
  { id: 4, category: '위기 대처', question: '작전 중 고립되어 보급이 완전히 끊겼을 때, 당신은 주로 어떤 태도를 보입니까?', options: ['뛰어난 생존 본능으로 어떻게든 식량을 확보하며 버틴다.', '동료들이 지치거나 절망하지 않도록 밝은 분위기를 만든다.', '불필요한 에너지 소모를 줄이며 묵묵히 구조를 기다린다.', '탈출 경로를 개척하기 위해 쉬지 않고 주변을 정찰한다.'] },
  { id: 5, category: '위기 대처', question: '당신을 시기하거나 견제하는 부대원들과 갈등이 발생했을 때, 당신의 대응 방식은?', options: ['압도적인 실력을 보여주어 그들의 불만을 잠재운다.', '대화를 통해 오해를 풀고 합의점을 찾으려 노력한다.', '목표 달성이 중요하므로 그들의 견제는 가볍게 무시한다.', '상대의 약점이나 심리를 파악해 조용히 상황을 설계한다.'] },
  { id: 6, category: '행동 양식', question: '평화로운 일상 속에서 갑자기 비상 종소리가 울린다면, 가장 먼저 어떤 생각이 드나요?', options: ['"드디어 내가 가진 실력을 제대로 증명할 기회가 왔다."', '"제발 아무도 다치지 않고 무사히 상황이 끝나기를..."', '"일단 비상 식량이나 필수 장비부터 확실히 챙겨두자."', '"또 무의미한 갈등과 소모적인 싸움이 시작되는 것인가..."'] },
  { id: 7, category: '인간관계', question: '새로운 동료들과 처음 만나는 자리에서 당신은 주로 어떤 모습을 보여주나요?', options: ['먼저 다가가 말을 걸고 장난을 치며 어색한 분위기를 깬다.', '적당한 거리를 유지하며 상대방이 어떤 사람인지 조용히 관찰한다.', '든든한 맏이처럼 동료들의 고충이나 필요한 것을 먼저 챙겨준다.', '그들의 독특한 성향에 흥미를 느끼고 질문을 던지며 호감을 표한다.'] },
  { id: 8, category: '인간관계', question: '깊이 믿었던 동료가 나를 속이거나 배신했다는 사실을 알게 되었을 때, 당신의 반응은?', options: ['배신감에 분노하며 잘못된 행동에 대해 확실한 대가를 치르게 한다.', '그가 왜 그런 선택을 할 수밖에 없었는지 숨겨진 사정을 파악해 본다.', '조직의 안정을 위해 개인적인 감정은 억누르고 상황을 수습한다.', '배신한 자에게 집중하기보다 남아있는 소중한 사람들을 더 지킨다.'] },
  { id: 9, category: '소통 스타일', question: '타인이 당신에게 원치 않는 희생이나 영웅적인 역할을 강요한다면 어떻게 하시겠습니까?', options: ['나를 억압하려는 시선이나 부당한 기대를 과감하게 거부한다.', '나의 희생으로 더 큰 가치를 지킬 수 있다면 기꺼이 받아들인다.', '겉으로는 맞춰주는 척하면서 뒤로는 나만의 독자적인 길을 간다.', '내 소중한 사람들이 위험해지지 않는 범위 내에서 적절히 타협한다.'] },
  { id: 10, category: '소통 스타일', question: '전장에서 겁에 질려 패닉에 빠진 동료를 목격했다면, 당신은 어떻게 행동합니까?', options: ['할 수 있다는 자신감을 심어주며 든든하게 다독여준다.', '그가 느끼는 공포에 진심으로 공감해주며 곁을 지켜준다.', '지금은 나약해질 때가 아니라고 엄격하고 냉정하게 꾸짖는다.', '일부러 엉뚱한 화제를 던져 패닉에서 벗어날 수 있게 돕는다.'] },
  { id: 11, category: '인간관계', question: '집단 내에서 오해를 받아 고립되거나 미움을 받는 상황이 된다면 어떻게 대응하시겠습니까?', options: ['타인의 시선은 신경 쓰지 않고 오직 나의 목표에만 집중한다.', '먼저 마음을 열고 소통하며 갈등의 벽을 서서히 허물어간다.', '나의 부족함을 탓하며 더 완벽한 능력을 갖추기 위해 매진한다.', '슬픈 감정을 애써 밝은 모습 뒤로 숨기며 평소처럼 행동한다.'] },
  { id: 12, category: '소통 스타일', question: '나보다 훨씬 뛰어난 능력을 가졌거나 빠르게 승진하는 동료를 보았을 때 드는 생각은?', options: ['나의 부족함을 절감하며 그를 뛰어넘기 위해 밤낮으로 노력한다.', '그의 강점을 분석하여 내 작전이나 활동에 어떻게 활용할지 연구한다.', '순수하게 동료의 재능과 성취를 축하하며 존경의 마음을 표현한다.', '그가 앞으로 짊어질 막중한 책임을 알기에 부러워하기보다 격려한다.'] },
  { id: 13, category: '가치관', question: '세상의 질서를 뒤흔들 수 있는 중대한 비밀을 알게 되었다면, 당신의 선택은 무엇입니까?', options: ['큰 혼란이 발생하더라도 모든 진실을 대중에게 투명하게 밝힌다.', '진실을 나만 알고 있으면서 더 강력한 질서와 통제를 위해 활용한다.', '세상이 어떻게 변하든 소중한 사람들의 평화로운 일상을 지키는 데 쓴다.', '부조리한 비극의 연쇄를 근본적으로 끊어내기 위한 최후의 수단으로 쓴다.'] },
  { id: 14, category: '가치관', question: '대의를 위해 소수의 무고한 사람들이 희생되어야만 하는 상황이라면, 어떤 결정을 내리겠습니까?', options: ['비난을 받더라도 전체의 승리를 위해 차갑게 작전을 승인한다.', '단 1%라도 희생을 줄일 수 있는 다른 대안이 없는지 필사적으로 찾는다.', '희생을 당연하게 여기는 불합리한 규칙 자체를 부수기 위해 행동한다.', '차라리 나 자신을 희생하여 그들이 짊어진 무게를 대신 감당한다.'] },
  { id: 15, category: '신념', question: '당신이 생각하는 가장 가치 있는 \'자유\'란 다음 중 무엇인가요?', options: ['그 누구의 간섭이나 억압 없이 미지의 세상을 마음껏 누비는 것.', '사회적 역할에서 벗어나 오직 나 자신으로서 당당하게 서는 것.', '소중한 사람들과 함께 맛있는 음식을 나누며 누리는 소박한 평화.', '거대한 질서 안에서 확실한 안전과 평온한 삶을 보장받는 것.'] },
  { id: 16, category: '신념', question: '역사와 진실이 승자에 의해 왜곡되거나 유리하게 포장되는 현상에 대해 어떻게 생각하십니까?', options: ['결국 힘을 가진 승리자가 정의를 정의하는 것이 세상의 이치라고 생각한다.', '이면에 숨겨진 진실을 파헤치고 우리 사회의 도덕적 모순을 비판적으로 성찰한다.', '거창한 역사 담론보다 당장 내 눈앞에서 고통받는 사람들의 마음이 더 중요하다.', '오늘 내가 살아남아 숨 쉬는 것 이상의 확실한 진실은 없다고 믿는다.'] },
  { id: 17, category: '가치관', question: '자신에게 큰 상처를 준 상대에게 복수할 수 있는 기회가 완벽하게 주어졌을 때, 당신의 선택은?', options: ['나의 권리와 삶을 유린한 상대에게 주저 없이 똑같은 고통을 되돌려준다.', '증오의 굴레를 나의 선에서 끊고, 관용과 대화를 통해 화해를 시도한다.', '감정에 휘둘리지 않고 나의 실리와 미래의 이익을 고려하여 철저하게 처리한다.', '개인적인 감정보다는 내게 주어진 책임과 의무에 따라 원칙적으로 단죄한다.'] },
  { id: 18, category: '신념', question: '단 한 번뿐인 인생에서 당신이 가장 끝까지 지키고 싶은 절대적인 가치는 무엇입니까?', options: ['어떠한 역경도 함께 이겨낼 수 있는 소중한 사람들과의 끈끈한 연대.', '세상의 수수께끼를 풀고 진리에 다가가려는 멈추지 않는 지적 탐구심.', '조직이나 국가의 위상을 높이고 내 이름을 남기는 명예와 신념.', '추악한 타협에 결코 굴복하지 않고 스스로에게 떳떳한 도덕적 청렴함.'] },
  { id: 19, category: '스트레스 극복', question: '감당하기 힘든 스트레스와 정신적인 위기가 찾아왔을 때, 당신은 주로 어떤 태도를 보이나요?', options: ['나의 약함을 들키지 않으려고 평소보다 더 장난을 치거나 엉뚱한 행동을 한다.', '혼자만의 공간에서 감정을 차분하게 정리하며 차갑게 고독을 유지한다.', '신뢰하는 동료나 친구에게 모든 것을 털어놓고 의지하며 함께 극복한다.', '인간적인 감정을 차단하고 오로지 주어진 목표와 임무 수행에만 몰입한다.'] },
  { id: 20, category: '스트레스 극복', question: '꿈꾸던 미래가 완전히 무너지고 깊은 절망에 빠졌을 때, 당신은 어떻게 일어납니까?', options: ['강한 분노를 동력 삼아 나를 무너뜨린 대상에게 반격하며 다시 일어선다.', '스스로를 자책하고 후회하며 한동안 깊은 슬픔 속에 잠겨 시간을 보낸다.', '세상은 원래 불합리한 곳이라 생각하며 마음을 비우고 기대를 내려놓는다.', '눈물을 닦고 지금 이 순간 내가 할 수 있는 아주 작은 일부터 다시 시작한다.'] },
  { id: 21, category: '내면의 상처', question: '타인에게 절대 들키고 싶지 않은 당신만의 가장 깊은 내면의 약점은 무엇인가요?', options: ['든든한 리더처럼 보이지만 사실은 타인에게 외면받을까 봐 두려워하는 마음.', '모든 이에게 언제나 좋은 사람으로 남아야 한다는 강박적인 마음.', '나만의 뚜렷한 주관이 없어 대세나 타인의 의견을 쉽게 따라가는 성향.', '감정에 휩쓸려 일을 그르칠까 봐 의도적으로 사람들과 거리를 두는 냉소함.'] },
  { id: 22, category: '스트레스 극복', question: '만약 당신에게 완벽한 자유시간이 하루 주어진다면, 무엇을 하며 시간을 보내고 싶습니까?', options: ['평소 먹고 싶었던 맛있는 음식을 마음껏 먹으며 즐거움을 만끽한다.', '조용한 곳에서 혼자 책을 읽거나 흥미로운 주제에 대해 깊이 탐구한다.', '주변 환경과 장비를 완벽하게 정리 정돈하며 마음의 안정을 찾는다.', '친한 사람들과 가벼운 운동이나 취미 활동을 공유하며 즐거운 시간을 보낸다.'] },
  { id: 23, category: '내면의 상처', question: '인생의 마지막 순간에 당신 스스로에게 남기고 싶은 마지막 한마디는 무엇입니까?', options: ['"나는 어떤 상황에서도 굴복하지 않았고, 끝까지 나의 싸움을 이어갔다."', '"나의 삶과 죽음이 뒤에 올 사람들에게 하나의 올바른 이정표가 되기를..."', '"내가 깊이 사랑했던 사람들이 나를 대신해 더 행복한 세상을 살아가기를..."', '"지옥 같은 책임과 의무에서 벗어나, 이제야 비로소 진정한 안식을 얻는구나."'] },
  { id: 24, category: '내면의 상처', question: '자신의 주관보다 대세를 맹목적으로 따랐다가 큰 실패를 겪었다면, 이후 당신이 보일 태도는?', options: ['나약함을 버리고 모든 것을 스스로 판단하고 결정하는 주체적인 삶을 선택한다.', '실패의 상처마저 내 일부로 받아들이고, 더 큰 정의를 위해 나 자신을 던진다.', '과거의 실패에 연연하기보다 지금 살아있음에 감사하며 주변의 버팀목이 된다.', '거대한 세상의 흐름에 저항하기보다 순응하며 그 안에서 평온을 찾는 법을 배운다.'] }
];

// Re-structuring into questions with options A-D
const finalQuestions = QUESTIONS_BASE.map(q => {
  return {
    ...q,
    options: q.options.map((text, idx) => ({
      key: ['A', 'B', 'C', 'D'][idx] as 'A' | 'B' | 'C' | 'D',
      text,
      scores: {} as Record<string, number>
    }))
  };
});

// Distribute points fairly but with a hint of Lore.
// We'll iterate through each character and assign their required slots.
CHAR_NAMES.forEach(name => {
  const pointsToAssign = shuffle([...Array(5).fill(5), ...Array(5).fill(4), ...Array(5).fill(3), ...Array(4).fill(2), ...Array(5).fill(1)]);
  
  // To avoid bunching, we'll try to find options that have fewer than 5 characters.
  pointsToAssign.forEach(pt => {
    let assigned = false;
    // Simple heuristic: find an option that has the fewest characters currently assigned.
    const sortedOptions = finalQuestions.flatMap(q => q.options)
      .sort((a, b) => Object.keys(a.scores).length - Object.keys(b.scores).length);
    
    for (const opt of sortedOptions) {
      if (!opt.scores[name] && Object.keys(opt.scores).length < 5) {
        opt.scores[name] = pt;
        assigned = true;
        break;
      }
    }
  });
});

// Verify balance
const charStats = CHAR_NAMES.map(name => {
  let total = 0;
  const counts: Record<number, number> = { 5:0, 4:0, 3:0, 2:0, 1:0 };
  finalQuestions.forEach(q => q.options.forEach(o => {
    if (o.scores[name]) {
      total += o.scores[name];
      counts[o.scores[name]]++;
    }
  }));
  return { name, total, counts };
});

console.log('Balance Verification:', charStats);

const output = `
export interface Character {
  name: string;
  title: string;
  imageUrl: string;
  keywords: string[];
  description: string;
  chemistry: {
    best: string;
    worst: string;
  };
}

export interface Option {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  scores: Record<string, number>;
}

export interface Question {
  id: number;
  category: string;
  question: string;
  options: Option[];
}

export const SHINGEKI_VERSION = '1.9.0';

export const CHARACTERS: Record<string, Character> = {
  '에렌 예거': { name: '에렌 예거', title: '자유를 갈망하는 진격의 거인', imageUrl: '/images/shingeki/eren.png', keywords: ['자유', '의지', '행동파', '비극적 양면성'], description: '열정적이고 불의를 참지 못하며 저돌적인 투지를 가졌습니다.', chemistry: { best: '아르민 알레르토', worst: '지크 예거' } },
  '미카사 아커만': { name: '미카사 아커만', title: '심장을 지키는 불패의 수호자', imageUrl: '/images/shingeki/mikasa.png', keywords: ['헌신', '냉철', '수호', '압도적 강함'], description: '소중한 사람을 지키기 위해서라면 어떤 위험도 불사하는 압도적인 실천력을 보여줍니다.', chemistry: { best: '에렌 예거', worst: '애니 레온하트' } },
  '아르민 알레르토': { name: '아르민 알레르토', title: '희망을 그려내는 지략의 장단', imageUrl: '/images/shingeki/armin.png', keywords: ['지혜', '통찰', '탐구심', '외유내강'], description: '비범한 지략과 정확한 상황 판단력을 무기로 위기의 순간 해답을 찾아냅니다.', chemistry: { best: '에렌 예거', worst: '플록 포르스터' } },
  '리바이 아커만': { name: '리바이 아커만', title: '인류 최강의 병사', imageUrl: '/images/shingeki/levi.png', keywords: ['최강', '결단력', '결벽증', '인간적 따뜻함'], description: '냉철하고 신속한 판단력을 가졌으며, 속으로는 동료를 아끼는 깊은 인간미를 가졌습니다.', chemistry: { best: '엘빈 스미스', worst: '지크 예거' } },
  '엘빈 스미스': { name: '엘빈 스미스', title: '인류의 전진을 이끄는 위대한 단장', imageUrl: '/images/shingeki/erwin.png', keywords: ['리더십', '결단', '야심가', '죄책감'], description: '인류 전체의 생존이라는 대의를 위해 냉정한 결단을 내리는 강철 같은 인물입니다.', chemistry: { best: '리바이 아커만', worst: '플록 포르스터' } },
  '한지 조에': { name: '한지 조에', title: '미지를 탐구하는 불꽃같은 열정', imageUrl: '/images/shingeki/hange.png', keywords: ['호기심', '탐구', '괴짜', '영리함'], description: '진실을 향한 광기 어린 호기심과 유쾌한 실험정신을 가졌습니다.', chemistry: { best: '리바이 아커만', worst: '라이너 브라운' } },
  '장 키르슈타인': { name: '장 키르슈타인', title: '현실 속에서 정의를 찾는 현실주의 리더', imageUrl: '/images/shingeki/jean.png', keywords: ['현실주의', '성장', '통찰력', '인간미'], description: '현실적인 판단력과 인간적인 고민을 함께하는 리더입니다.', chemistry: { best: '코니 스프링거', worst: '에렌 예거' } },
  '사샤 브라우스': { name: '사샤 브라우스', title: '혹독한 세상의 소박한 빛', imageUrl: '/images/shingeki/sasha.png', keywords: ['자유분방', '식탐', '야생의 오감', '조화'], description: '본능에 충실하고 뛰어난 야생의 감각으로 위기를 돌파하는 순수한 영혼입니다.', chemistry: { best: '코니 스프링거', worst: '가비 브라운' } },
  '코니 스프링거': { name: '코니 스프링거', title: '동료를 위해 달리는 순박한 전사', imageUrl: '/images/shingeki/connie.png', keywords: ['의리', '무드메이커', '의협심', '따뜻함'], description: '소박하고 의리 넘치는 성품을 가진 팀의 활기찬 무드메이커입니다.', chemistry: { best: '사샤 브라우스', worst: '지크 예거' } },
  '히스토리아 레이스': { name: '히스토리아 레이스', title: '자기 자신만의 삶을 선택한 여왕', imageUrl: '/images/shingeki/historia.png', keywords: ['운명개척', '주체성', '독립성', '자아긍정'], description: '타인의 기대에서 벗어나 당당하고 주체적으로 참된 자아를 긍정하게 된 인물입니다.', chemistry: { best: '팔코 글라이스', worst: '에렌 예거' } },
  '라이너 브라운': { name: '라이너 브라운', title: '책임과 죄책감의 경계에 선 전사', imageUrl: '/images/shingeki/reiner.png', keywords: ['책임감', '맏형', '이중성', '담력'], description: '책임감이 무척 강하고 남을 잘 돌보는 맏형 같은 리더 성향입니다.', chemistry: { best: '초대형 거인', worst: '에렌 예거' } },
  '애니 레온하트': { name: '애니 레온하트', title: '고독한 사명을 짊어진 얼음의 여전사', imageUrl: '/images/shingeki/annie.png', keywords: ['독립심', '실리주의', '비정함', '다정함'], description: '냉정하고 합리적인 개인주의자이지만 그 이면에 따뜻함을 지니고 있습니다.', chemistry: { best: '아르민 알레르토', worst: '에렌 예거' } },
  '지크 예거': { name: '지크 예거', title: '구원을 바라는 비운의 지략가', imageUrl: '/images/shingeki/zeke.png', keywords: ['허무주의', '치밀함', '통찰력', '비밀설계'], description: '냉소적이고 허무주의적인 통찰력을 가진 전략가입니다.', chemistry: { best: '차력 거인', worst: '리바이 아커만' } },
  '가비 브라운': { name: '가비 브라운', title: '폭풍처럼 타오르는 거침없는 신념', imageUrl: '/images/shingeki/gabi.png', keywords: ['열정', '적극성', '자부심', '불도저'], description: '강렬한 승부욕과 목표를 향한 저돌적인 행동력을 가졌습니다.', chemistry: { best: '팔코 글라이스', worst: '사샤 브라우스' } },
  '팔코 글라이스': { name: '팔코 글라이스', title: '어둠을 정화하는 지고지순한 순수', imageUrl: '/images/shingeki/falco.png', keywords: ['친절', '헌신', '순수함', '공감능력'], description: '이타적이고 맑은 심성을 가진 깊은 공감 능력의 소유자입니다.', chemistry: { best: '가비 브라운', worst: '에렌 예거' } },
  '플록 포르스터': { name: '플록 포르스터', title: '냉혹한 진실을 부르짖는 현실주의자', imageUrl: '/images/shingeki/floch.png', keywords: ['현실주의', '광신도', '생존본능', '가혹함'], description: '자신의 소속과 생존을 위해 가혹한 수단도 마다하지 않는 강경한 신념을 가졌습니다.', chemistry: { best: '엘빈 스미스', worst: '아르민 알레르토' } },
  '턱 거인': { name: '턱 거인', title: '기민함과 날카로움을 겸비한 전장의 야수', imageUrl: '/images/shingeki/jaw_titan.png', keywords: ['민첩', '의리', '자존심', '독립성'], description: '기민한 판단력과 자존심 강한 독립성을 보여주는 전장의 야수입니다.', chemistry: { best: '차력 거인', worst: '초대형 거인' } },
  '차력 거인': { name: '차력 거인', title: '끈기와 생존력을 갖춘 전술의 핵심', imageUrl: '/images/shingeki/cart_titan.png', keywords: ['끈기', '인내력', '성실함', '조력자'], description: '든든한 성실함과 묵묵한 인내력을 갖춘 전술의 핵심입니다.', chemistry: { best: '턱 거인', worst: '갑옷 거인' } },
  '초대형 거인': { name: '초대형 거인', title: '압도적인 파괴력의 파멸의 신', imageUrl: '/images/shingeki/colossus_titan.png', keywords: ['압도', '신중함', '외강내유', '수동적'], description: '압도적인 파괴력을 지녔지만 신중하고 내성적인 성향을 띠고 있습니다.', chemistry: { best: '갑옷 거인', worst: '턱 거인' } },
  '갑옷 거인': { name: '갑옷 거인', title: '어떤 절망에도 무너지지 않는 수호벽', imageUrl: '/images/shingeki/armored_titan.png', keywords: ['강인함', '인내', '굳건함', '방패'], description: '어떤 상처에도 굴하지 않고 최전선에서 버텨내는 책임감의 상징입니다.', chemistry: { best: '초대형 거인', worst: '차력 거인' } }
};

export const QUESTIONS: Question[] = ${JSON.stringify(finalQuestions, null, 2)};
`;

writeFileSync('app/actions/shingekiData.ts', output);
