import { QUESTIONS, CHARACTERS } from './shingekiData';

const priorityList = [
  '에렌 예거', '리바이 아커만', '미카사 아커만', '아르민 알레르토', '엘빈 스미스',
  '한지 조에', '장 키르슈타인', '사샤 브라우스', '코니 스프링거', '히스토리아 레이스',
  '라이너 브라운', '애니 레온하트', '지크 예거', '가비 브라운', '팔코 글라이스',
  '플록 포르스터', '턱 거인', '차력 거인', '초대형 거인', '갑옷 거인'
];

function simulateCalculateResult(answers: { questionId: number; answer: string }[]) {
  const totalScores: Record<string, number> = {};
  const c3Scores: Record<string, number> = {};
  
  Object.keys(CHARACTERS).forEach((name) => {
    totalScores[name] = 0;
    c3Scores[name] = 0;
  });

  answers.forEach((ans) => {
    const question = QUESTIONS.find((q) => q.id === ans.questionId);
    if (!question) return;

    const option = question.options.find((o) => o.key === ans.answer);
    if (!option) return;

    const isCategory3 = question.id >= 13 && question.id <= 18;

    Object.entries(option.scores).forEach(([charName, val]) => {
      if (totalScores[charName] !== undefined) {
        totalScores[charName] += (val as number);
        if (isCategory3) {
          c3Scores[charName] += (val as number);
        }
      }
    });
  });

  let maxScore = -1;
  let candidates: string[] = [];

  Object.entries(totalScores).forEach(([charName, score]) => {
    if (score > maxScore) {
      maxScore = score;
      candidates = [charName];
    } else if (score === maxScore && score > 0) {
      candidates.push(charName);
    }
  });

  if (candidates.length === 0) return priorityList[0];

  let winner = candidates[0];
  if (candidates.length > 1) {
    let maxC3 = -1;
    let c3Candidates: string[] = [];
    
    candidates.forEach(cand => {
      if (c3Scores[cand] > maxC3) {
        maxC3 = c3Scores[cand];
        c3Candidates = [cand];
      } else if (c3Scores[cand] === maxC3) {
        c3Candidates.push(cand);
      }
    });

    if (c3Candidates.length === 1) {
      winner = c3Candidates[0];
    } else {
      // Use random to match the updated calculateResult logic
      const randomIndex = Math.floor(Math.random() * c3Candidates.length);
      winner = c3Candidates[randomIndex];
    }
  }

  return winner;
}

const totalRuns = 20000; // Increase runs for more precision
const results: Record<string, number> = {};
priorityList.forEach(name => results[name] = 0);

const c1Pool = QUESTIONS.filter(q => q.id >= 1 && q.id <= 6);
const c2Pool = QUESTIONS.filter(q => q.id >= 7 && q.id <= 12);
const c3Pool = QUESTIONS.filter(q => q.id >= 13 && q.id <= 18);
const c4Pool = QUESTIONS.filter(q => q.id >= 19 && q.id <= 24);

const getRandomSlice = (arr: any[], count: number) => {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
};

for (let i = 0; i < totalRuns; i++) {
  const selectedQuestions = [
    ...getRandomSlice(c1Pool, 3),
    ...getRandomSlice(c2Pool, 3),
    ...getRandomSlice(c3Pool, 3),
    ...getRandomSlice(c4Pool, 3)
  ];

  const answers = selectedQuestions.map(q => {
    const keys = ['A', 'B', 'C', 'D'];
    const randomKey = keys[Math.floor(Math.random() * 4)];
    return { questionId: q.id, answer: randomKey };
  });

  const winner = simulateCalculateResult(answers);
  results[winner]++;
}

console.log('\n=== Final Shingeki Distribution Result (20,000 runs) ===');
const tableData = Object.entries(results).map(([name, count]) => ({
  Character: name,
  Count: count,
  Percentage: `${((count / totalRuns) * 100).toFixed(2)}%`
})).sort((a, b) => (b.Count as number) - (a.Count as number));

console.table(tableData);
