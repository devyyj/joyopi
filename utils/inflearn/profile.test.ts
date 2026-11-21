import { describe, it, expect } from 'vitest';
import { parseInflearnPage, loadInflearnProfile, fallbackCourses } from './profile';

// 실제 페이지(2026-11-21)에 들어 있는 데이터 모양을 줄인 것
const summary = '{"user":{"id":1167019,"name":"조요피"},"reviewAverage":"5.0","reviewCount":22,"studentCount":195,"courseCount":2,"hasRoadmap":false}';
const course = (id: number, slug: string, title: string, level: string) =>
  `{"id":${id},"type":"ON","course":{"id":${id},"slug":"${slug}","thumbnailUrl":"https://cdn.inflearn.com/x","title":"${title}","description":"설명 \\"따옴표\\"\\n줄바꿈","reviewCount":16,"studentCount":148,"star":5,"metadata":{"level":"${level}","levelCode":"Basic"}}}`;
const page = (...parts: string[]) => `<html><script>self.__next_f.push(${JSON.stringify(parts.join(','))})</script>${parts.join(',')}</html>`;

describe('parseInflearnPage', () => {
  it('강사 숫자(수강생·수강평·평점)와 강의(제목·난이도·주소)를 꺼낸다', () => {
    const r = parseInflearnPage(
      page(summary, course(339629, '가장-쉬운-동시성-문제-race-co', '가장 쉬운 동시성 문제 - Race Condition', 'BASIC'), course(343664, 'distributed-transact-1', '코드로 끝내는 분산 트랜잭션 (feat. AI Agent)', 'ADVANCED')),
    );
    expect(r.stats).toEqual({ students: 195, reviews: 22, rating: '5.0' });
    expect(r.courses).toEqual([
      {
        slug: '가장-쉬운-동시성-문제-race-co',
        title: '가장 쉬운 동시성 문제 - Race Condition',
        level: 'BASIC',
        url: 'https://www.inflearn.com/ko/course/%EA%B0%80%EC%9E%A5-%EC%89%AC%EC%9A%B4-%EB%8F%99%EC%8B%9C%EC%84%B1-%EB%AC%B8%EC%A0%9C-race-co',
      },
      { slug: 'distributed-transact-1', title: '코드로 끝내는 분산 트랜잭션 (feat. AI Agent)', level: 'ADVANCED', url: 'https://www.inflearn.com/ko/course/distributed-transact-1' },
    ]);
  });

  it('같은 강의가 여러 번 나와도 한 번만, 모르는 난이도는 OTHER', () => {
    const c = course(1, 'a-course', 'A \\"강의\\"', 'MASTER');
    const r = parseInflearnPage(page(summary, c, c), 'ja');
    expect(r.courses).toEqual([{ slug: 'a-course', title: 'A "강의"', level: 'OTHER', url: 'https://www.inflearn.com/ja/course/a-course' }]);
  });

  it('강의를 못 찾으면 그 언어의 기본 강의 목록을 쓴다', () => {
    expect(parseInflearnPage(page(summary), 'en').courses).toEqual(fallbackCourses('en'));
    expect(fallbackCourses('en')[0]).toEqual({
      slug: 'distributed-transact-1',
      title: 'Distributed Transactions Through Code (feat. AI Agent)',
      level: 'ADVANCED',
      url: 'https://www.inflearn.com/en/course/distributed-transact-1',
    });
  });

  it('숫자를 못 찾으면(인프런 화면이 바뀜) 예외', () => {
    expect(() => parseInflearnPage('<html>점검 중</html>')).toThrow('숫자');
  });
});

describe('loadInflearnProfile', () => {
  it('그 언어 주소의 강의 목록 페이지를 읽는다(서버 나라와 상관없이 그 언어 제목)', async () => {
    let called = '';
    const r = await loadInflearnProfile('ja', async (url) => {
      called = url;
      return { ok: true, status: 200, text: async () => page(summary) } as Response;
    });
    expect(called).toBe('https://www.inflearn.com/ja/users/1167019/courses');
    expect(r.stats.students).toBe(195);
  });

  it('응답 오류면 예외', async () => {
    await expect(loadInflearnProfile('ko', async () => ({ ok: false, status: 500, text: async () => '' }) as Response)).rejects.toThrow('500');
  });
});
