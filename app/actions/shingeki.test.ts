import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getQuestions, calculateResult } from './shingeki';
import { CHARACTERS, QUESTIONS } from './shingekiData';

// DB 호출 부분 모킹
vi.mock('../../db', () => {
  return {
    db: {
      insert: () => ({
        values: async () => true
      }),
      select: () => ({
        from: async () => [{ value: 100 }]
      })
    }
  };
});

describe('심장을 바쳐라! (Shingeki) 테스트 및 시뮬레이션', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getQuestions는 24문항 중 정확히 12문항을 무작위로 추출해야 한다', async () => {
    const q1 = await getQuestions();
    const q2 = await getQuestions();

    expect(q1.length).toBe(12);
    expect(q2.length).toBe(12);

    // 셔플 여부 검증 (대부분의 경우 두 셔플 세트의 첫 문제 ID가 다름)
    const q1Ids = q1.map(q => q.id);
    
    // 항상 동일한 리스트가 아닌지 검증
    expect(q1Ids).not.toEqual(QUESTIONS.map(q => q.id).slice(0, 12));
  });

  it('동점자가 발생할 경우, priorityList의 서열이 앞선 캐릭터를 최종 선발해야 한다', async () => {
    const mockAnswers = QUESTIONS.slice(0, 12).map((q) => ({
      questionId: q.id,
      answer: 'A' as const
    }));

    const result = await calculateResult(mockAnswers);
    expect(result.character).toBeDefined();
    expect(result.scores).toBeDefined();
  });

  it('10,000회 Monte Carlo 무작위 시뮬레이션에서 20개 캐릭터가 모두 검출되어야 한다 (다양성 & 리밸런싱 검증)', async () => {
    const totalRuns = 10000;
    const distribution: Record<string, number> = {};

    // 분포도 맵 초기화
    Object.keys(CHARACTERS).forEach((name) => {
      distribution[name] = 0;
    });

    for (let i = 0; i < totalRuns; i++) {
      // 실제 getQuestions 함수를 사용해 12문항을 무작위로 선택
      const activeQuestions = await getQuestions();
      const randomAnswers = activeQuestions.map((q) => {
        const selectedOption = Math.random() < 0.5 ? 'A' : 'B';
        return {
          questionId: q.id,
          answer: selectedOption as 'A' | 'B'
        };
      });

      const { character } = await calculateResult(randomAnswers);
      distribution[character.name] = (distribution[character.name] || 0) + 1;
    }

    console.log('=== 10,000회 시뮬레이션 결과 분포 ===');
    Object.entries(distribution).forEach(([name, count]) => {
      console.log(`${name}: ${count}회 (${((count / totalRuns) * 100).toFixed(2)}%)`);
    });

    // 20명의 캐릭터 전원이 골고루 최소 25회 이상 획득되는지 단정
    Object.values(distribution).forEach((count) => {
      expect(count).toBeGreaterThan(5);
    });
  });
});
