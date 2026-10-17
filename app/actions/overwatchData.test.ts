import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { HEROES, COUNTERS, OVERWATCH_DATA_VERSION, HERO_ROLES, COUNTER_LEVEL_LABELS } from './overwatchData';

describe('오버워치 카운터 데이터 무결성', () => {
  const heroIds = Object.keys(HEROES);

  it('영웅 목록이 비어 있지 않고, 키와 id가 일치한다', () => {
    expect(heroIds.length).toBeGreaterThan(0);
    for (const id of heroIds) {
      expect(HEROES[id].id).toBe(id);
    }
  });

  it('모든 영웅은 유효한 역할과 이름을 가진다', () => {
    for (const hero of Object.values(HEROES)) {
      expect(HERO_ROLES).toContain(hero.role);
      expect(hero.name.trim()).not.toBe('');
      expect(hero.nameEn.trim()).not.toBe('');
    }
  });

  it('모든 영웅의 초상화 파일이 public 폴더에 존재한다', () => {
    for (const hero of Object.values(HEROES)) {
      expect(hero.imageUrl).toBe(`/images/overwatch/${hero.id}.png`);
      const filePath = path.join(process.cwd(), 'public', hero.imageUrl);
      expect(fs.existsSync(filePath), `${hero.id} 초상화 누락`).toBe(true);
    }
  });

  it('카운터 관계의 영웅 id는 모두 존재한다', () => {
    for (const c of COUNTERS) {
      expect(HEROES[c.counter], `존재하지 않는 영웅: ${c.counter}`).toBeDefined();
      expect(HEROES[c.target], `존재하지 않는 영웅: ${c.target}`).toBeDefined();
    }
  });

  it('자기 자신을 카운터하는 관계는 없다', () => {
    for (const c of COUNTERS) {
      expect(c.counter).not.toBe(c.target);
    }
  });

  it('같은 (카운터, 대상) 쌍은 한 번만 정의된다', () => {
    const seen = new Set<string>();
    for (const c of COUNTERS) {
      const key = `${c.counter}>${c.target}`;
      expect(seen.has(key), `중복 관계: ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it('서로를 카운터하는 모순 관계(A→B, B→A)는 없다', () => {
    const pairs = new Set(COUNTERS.map((c) => `${c.counter}>${c.target}`));
    for (const c of COUNTERS) {
      expect(pairs.has(`${c.target}>${c.counter}`), `모순 관계: ${c.counter} ↔ ${c.target}`).toBe(false);
    }
  });

  it('영향도는 하드 카운터(hard) 또는 카운터(counter)이고 사유가 비어 있지 않다', () => {
    for (const c of COUNTERS) {
      expect(['hard', 'counter']).toContain(c.level);
      expect(c.reason.trim()).not.toBe('');
    }
  });

  it('영향도 라벨이 정의되어 있다', () => {
    expect(COUNTER_LEVEL_LABELS).toEqual({ hard: '하드 카운터', counter: '카운터' });
  });

  it('현재 솜브라에게 없는 단일 대상 해킹을 사유로 쓰지 않는다 (EMP 해킹만 허용)', () => {
    for (const c of COUNTERS) {
      if (/해킹/.test(c.reason)) {
        expect(c.counter, `${c.counter}→${c.target}: ${c.reason}`).toBe('sombra');
        expect(c.reason).toMatch(/EMP/);
      }
    }
  });

  it('모든 영웅은 "나를 잡는 영웅"이 2~6명이다', () => {
    const counts: Record<string, number> = {};
    for (const c of COUNTERS) {
      counts[c.target] = (counts[c.target] ?? 0) + 1;
    }
    for (const id of heroIds) {
      expect(counts[id] ?? 0, `${id}의 카운터 수`).toBeGreaterThanOrEqual(2);
      expect(counts[id] ?? 0, `${id}의 카운터 수`).toBeLessThanOrEqual(6);
    }
  });

  it('데이터 기준 버전이 명시되어 있다', () => {
    expect(OVERWATCH_DATA_VERSION.trim()).not.toBe('');
  });
});
