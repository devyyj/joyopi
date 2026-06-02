'use server';

import { Question, Character, CHARACTERS, QUESTIONS } from './shingekiData';

// 24개 질문 중 카테고리별로 3개씩 무작위 추출하여 총 12문항을 셔플하여 반환
export async function getQuestions(): Promise<Question[]> {
  console.log('[DEBUG] getQuestions initiated');
  const c1Pool = QUESTIONS.filter(q => q.id >= 1 && q.id <= 6);
  const c2Pool = QUESTIONS.filter(q => q.id >= 7 && q.id <= 12);
  const c3Pool = QUESTIONS.filter(q => q.id >= 13 && q.id <= 18);
  const c4Pool = QUESTIONS.filter(q => q.id >= 19 && q.id <= 24);

  console.log(`[DEBUG] Pools: C1(${c1Pool.length}), C2(${c2Pool.length}), C3(${c3Pool.length}), C4(${c4Pool.length})`);

  const shuffleAndSlice = (arr: Question[]) => [...arr].sort(() => Math.random() - 0.5).slice(0, 3);

  const selected = [
    ...shuffleAndSlice(c1Pool),
    ...shuffleAndSlice(c2Pool),
    ...shuffleAndSlice(c3Pool),
    ...shuffleAndSlice(c4Pool)
  ];

  console.log(`[DEBUG] getQuestions completed. Total selected: ${selected.length}`);
  return selected.sort(() => Math.random() - 0.5);
}

// 동점자 발생 시 우선순위 목록
const priorityList = [
  '에렌 예거',
  '리바이 아커만',
  '미카사 아커만',
  '아르민 알레르토',
  '엘빈 스미스',
  '한지 조에',
  '장 키르슈타인',
  '사샤 브라우스',
  '코니 스프링거',
  '히스토리아 레이스',
  '라이너 브라운',
  '애니 레온하트',
  '지크 예거',
  '가비 브라운',
  '팔코 글라이스',
  '플록 포르스터',
  '턱 거인',
  '차력 거인',
  '초대형 거인',
  '갑옷 거인'
];

interface AnswerInput {
  questionId: number;
  answer: 'A' | 'B' | 'C' | 'D';
}

export async function calculateResult(answers: AnswerInput[]): Promise<{ character: Character; scores: Record<string, number> }> {
  console.log('[DEBUG] calculateResult initiated. Total answers:', answers.length);
  const scores: Record<string, number> = {};
  
  // 초기화
  Object.keys(CHARACTERS).forEach((name) => {
    scores[name] = 0;
  });

  // 각 캐릭터의 총점 및 카테고리 3(가치관) 점수 계산
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
        totalScores[charName] += val;
        if (isCategory3) {
          c3Scores[charName] += val;
        }
      }
    });
  });

  // 가장 높은 총점을 가진 캐릭터 찾기
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

  console.log(`[DEBUG] Max Score: ${maxScore}. Candidates:`, candidates);

  // 동점자 해소
  let winner = candidates[0] || priorityList[0];
  if (candidates.length > 1) {
    console.log('[DEBUG] Multiple candidates found. Resolving tie via Category 3 scores...');
    let maxC3 = -1;
    let c3Candidates: string[] = [];
    
    candidates.forEach(cand => {
      const scoreC3 = c3Scores[cand] || 0;
      if (scoreC3 > maxC3) {
        maxC3 = scoreC3;
        c3Candidates = [cand];
      } else if (scoreC3 === maxC3) {
        c3Candidates.push(cand);
      }
    });

    if (c3Candidates.length === 1) {
      winner = c3Candidates[0];
    } else {
      // 2순위: priorityList 기반 우선순위 적용
      console.log('[DEBUG] Tie persists after C3 check. Using priorityList...');
      winner = c3Candidates.sort((a, b) => priorityList.indexOf(a) - priorityList.indexOf(b))[0];
    }
  }

  console.log(`[DEBUG] calculateResult completed. Final Winner: ${winner}`);
  return {
    character: CHARACTERS[winner],
    scores: totalScores
  };
}

