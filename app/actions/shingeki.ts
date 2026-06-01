'use server';

import { db } from '../../db';
import { shingekiResults } from '../../db/schema';
import { count } from 'drizzle-orm';
import { Question, Character, CHARACTERS, QUESTIONS } from './shingekiData';

// 24개 질문 중 카테고리별로 3개씩 무작위 추출하여 총 12문항을 셔플하여 반환
export async function getQuestions(): Promise<Question[]> {
  // 카테고리 정의: C1(위기 대처 및 행동 양식), C2(인간관계 및 소통 방식), C3(가치관 및 신념), C4(내면의 상처와 스트레스 극복)
  // 데이터에 있는 카테고리 문자열 매핑:
  // QUESTIONS 배열의 카테고리는 '성향 (E/I)', '의사결정 (F/T)', '가치관 (대의/개인)', '생활양식 (계획/즉흥)', '갈등 해결', '위기 대처', '소통 스타일', '목표 설정', '타인과의 관계', '도전 정신', '스트레스 해소', '정의에 대한 철학', '팀워크 스타일', '직관과 현실', '자기 성찰', '권위와 규칙', '전장 선호도', '인간관계 깊이', '창의성과 분석', '실패에 대처하는 자세', '선호하는 리더상', '사명과 자유', '행동의 시기', '정서적 지지' 등이 있습니다.
  // 성격진단기준.md에서는 4개 대분류 카테고리를 아래와 같이 정의하고 있습니다:
  // 1. 위기 대처 및 행동 양식 (Q1 ~ Q6) -> C1
  // 2. 인간관계 및 소통 방식 (Q7 ~ Q12) -> C2
  // 3. 가치관 및 신념 (Q13 ~ Q18) -> C3
  // 4. 내면의 상처와 스트레스 극복 (Q19 ~ Q24) -> C4
  // 실제 데이터의 ID 범위: Q1~Q6 (C1), Q7~Q12 (C2), Q13~Q18 (C3), Q19~Q24 (C4)
  
  const c1Pool = QUESTIONS.filter(q => q.id >= 1 && q.id <= 6);
  const c2Pool = QUESTIONS.filter(q => q.id >= 7 && q.id <= 12);
  const c3Pool = QUESTIONS.filter(q => q.id >= 13 && q.id <= 18);
  const c4Pool = QUESTIONS.filter(q => q.id >= 19 && q.id <= 24);

  const shuffleAndSlice = (arr: Question[]) => [...arr].sort(() => Math.random() - 0.5).slice(0, 3);

  const selected = [
    ...shuffleAndSlice(c1Pool),
    ...shuffleAndSlice(c2Pool),
    ...shuffleAndSlice(c3Pool),
    ...shuffleAndSlice(c4Pool)
  ];

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
  '베르토르트 후버',
  '애니 레온하트',
  '지크 예거',
  '가비 브라운',
  '팔코 글라이스',
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
  const scores: Record<string, number> = {};
  const appearances: Record<string, number> = {};

  // 초기화
  Object.keys(CHARACTERS).forEach((name) => {
    scores[name] = 0;
    appearances[name] = 0;
  });

  // 답변별 가중치 누적
  answers.forEach((ans) => {
    const question = QUESTIONS.find((q) => q.id === ans.questionId);
    if (!question) return;

    const option = question.options.find((o) => o.key === ans.answer);
    if (!option) return;

    Object.entries(option.scores).forEach(([charName, val]) => {
      if (scores[charName] !== undefined) {
        scores[charName] += val;
        appearances[charName] += 1;
      }
    });
  });

  // 각 캐릭터의 평균 점수 계산
  const avgScores: Record<string, number> = {};
  Object.keys(scores).forEach((name) => {
    avgScores[name] = appearances[name] > 0 ? scores[name] / appearances[name] : 0;
  });

  // 가장 높은 평균 스코어를 가진 캐릭터 찾기
  let maxScore = -1;
  let candidates: string[] = [];

  Object.entries(avgScores).forEach(([charName, score]) => {
    if (score > maxScore) {
      maxScore = score;
      candidates = [charName];
    } else if (score === maxScore && score > 0) {
      candidates.push(charName);
    }
  });

  // 동점자 해소: priorityList의 순서가 빠른 캐릭터를 최종 선정
  let winner = candidates[0] || priorityList[0];
  if (candidates.length > 1) {
    let bestIndex = priorityList.length;
    candidates.forEach((cand) => {
      const idx = priorityList.indexOf(cand);
      if (idx !== -1 && idx < bestIndex) {
        bestIndex = idx;
        winner = cand;
      }
    });
  }

  // DB에 결과 저장 (참전자 집계용)
  try {
    await db.insert(shingekiResults).values({
      characterName: winner
    });
  } catch (err) {
    console.error('Failed to insert shingeki result:', err);
  }

  return {
    character: CHARACTERS[winner],
    scores: avgScores
  };
}

// 실시간 참전자 수 집계
export async function getParticipantCount(): Promise<number> {
  try {
    const res = await db.select({ value: count() }).from(shingekiResults);
    return res[0]?.value || 0;
  } catch (err) {
    console.error('Failed to get participant count:', err);
    return 0;
  }
}
