import { describe, it, expect } from 'vitest';
import type { CounterRelation, Hero } from '@/app/actions/overwatchData';
import {
  getCountersOf,
  getCounteredBy,
  filterEdges,
  getEdgeKind,
  getNodeState,
  searchHero,
  computeRingLayout,
  computeSectorLabels,
  edgeGeometry,
} from './counter-graph';

const hero = (id: string, name: string, nameEn: string, role: Hero['role']): Hero => ({
  id,
  name,
  nameEn,
  role,
  imageUrl: `/images/overwatch/${id}.png`,
});

const HEROES: Record<string, Hero> = {
  winston: hero('winston', '윈스턴', 'Winston', 'tank'),
  reinhardt: hero('reinhardt', '라인하르트', 'Reinhardt', 'tank'),
  genji: hero('genji', '겐지', 'Genji', 'damage'),
  'soldier-76': hero('soldier-76', '솔저: 76', 'Soldier: 76', 'damage'),
  widowmaker: hero('widowmaker', '위도우메이커', 'Widowmaker', 'damage'),
  ana: hero('ana', '아나', 'Ana', 'support'),
  zenyatta: hero('zenyatta', '젠야타', 'Zenyatta', 'support'),
};

const rel = (counter: string, target: string, strength: 1 | 2 | 3): CounterRelation => ({
  counter,
  target,
  strength,
  reason: `${counter}→${target}`,
});

const COUNTERS: CounterRelation[] = [
  rel('winston', 'genji', 2),
  rel('winston', 'widowmaker', 3),
  rel('genji', 'zenyatta', 3),
  rel('genji', 'ana', 1),
  rel('ana', 'reinhardt', 2),
  rel('reinhardt', 'soldier-76', 1),
];

describe('getCountersOf / getCounteredBy', () => {
  it('내가 잡는 영웅을 강도 내림차순으로 반환한다', () => {
    expect(getCountersOf('genji', COUNTERS).map((c) => c.target)).toEqual(['zenyatta', 'ana']);
    expect(getCountersOf('winston', COUNTERS).map((c) => c.target)).toEqual(['widowmaker', 'genji']);
  });

  it('나를 잡는 영웅을 반환한다', () => {
    expect(getCounteredBy('genji', COUNTERS).map((c) => c.counter)).toEqual(['winston']);
    expect(getCounteredBy('reinhardt', COUNTERS).map((c) => c.counter)).toEqual(['ana']);
  });

  it('존재하지 않는 영웅이면 빈 배열을 반환한다', () => {
    expect(getCountersOf('nobody', COUNTERS)).toEqual([]);
    expect(getCounteredBy('nobody', COUNTERS)).toEqual([]);
  });
});

describe('filterEdges', () => {
  it('최소 강도 미만의 관계를 제외한다', () => {
    const edges = filterEdges(COUNTERS, HEROES, { role: 'all', minStrength: 2 });
    expect(edges).toHaveLength(4);
    expect(edges.every((e) => e.strength >= 2)).toBe(true);
  });

  it('역할 필터는 한쪽 끝이라도 해당 역할인 관계를 남긴다', () => {
    const edges = filterEdges(COUNTERS, HEROES, { role: 'support', minStrength: 1 });
    expect(edges.map((e) => `${e.counter}>${e.target}`).sort()).toEqual(
      ['ana>reinhardt', 'genji>ana', 'genji>zenyatta'].sort()
    );
  });

  it('조건에 맞는 관계가 없으면 빈 배열을 반환한다', () => {
    expect(filterEdges(COUNTERS, HEROES, { role: 'tank', minStrength: 3 }).map((e) => e.target)).toEqual([
      'widowmaker',
    ]);
    expect(filterEdges([], HEROES, { role: 'all', minStrength: 1 })).toEqual([]);
  });
});

describe('getEdgeKind / getNodeState', () => {
  it('선택이 없으면 모든 간선은 base, 노드는 normal', () => {
    expect(getEdgeKind(COUNTERS[0], null)).toBe('base');
    expect(getNodeState('genji', null, COUNTERS)).toBe('normal');
  });

  it('선택한 영웅 기준으로 나가는/들어오는 간선을 구분한다', () => {
    expect(getEdgeKind(rel('genji', 'zenyatta', 3), 'genji')).toBe('out');
    expect(getEdgeKind(rel('winston', 'genji', 2), 'genji')).toBe('in');
    expect(getEdgeKind(rel('ana', 'reinhardt', 2), 'genji')).toBe('dim');
  });

  it('선택한 영웅 기준으로 노드 상태를 계산한다', () => {
    expect(getNodeState('genji', 'genji', COUNTERS)).toBe('selected');
    expect(getNodeState('zenyatta', 'genji', COUNTERS)).toBe('out');
    expect(getNodeState('winston', 'genji', COUNTERS)).toBe('in');
    expect(getNodeState('reinhardt', 'genji', COUNTERS)).toBe('dim');
  });

  it('필터로 빠진 간선은 노드 상태에 반영되지 않는다', () => {
    const edges = filterEdges(COUNTERS, HEROES, { role: 'all', minStrength: 2 });
    expect(getNodeState('ana', 'genji', edges)).toBe('dim');
  });
});

describe('searchHero', () => {
  it('한글 이름 부분 일치로 찾는다', () => {
    expect(searchHero('위도', HEROES)?.id).toBe('widowmaker');
  });

  it('영문 이름은 대소문자와 공백, 특수문자를 무시한다', () => {
    expect(searchHero('  GENJI ', HEROES)?.id).toBe('genji');
    expect(searchHero('soldier76', HEROES)?.id).toBe('soldier-76');
    expect(searchHero('솔저 76', HEROES)?.id).toBe('soldier-76');
  });

  it('정확히 일치하는 이름을 부분 일치보다 우선한다', () => {
    const heroes = { ...HEROES, anabel: hero('anabel', '아나벨', 'Anabel', 'support') };
    expect(searchHero('아나', heroes)?.id).toBe('ana');
  });

  it('빈 검색어나 일치 항목이 없으면 null을 반환한다', () => {
    expect(searchHero('', HEROES)).toBeNull();
    expect(searchHero('   ', HEROES)).toBeNull();
    expect(searchHero('없는영웅', HEROES)).toBeNull();
  });
});

describe('computeRingLayout / computeSectorLabels', () => {
  const ring = { cx: 500, cy: 500, radius: 400 };

  it('모든 영웅을 중심에서 반지름만큼 떨어진 원 위에 배치한다', () => {
    const layout = computeRingLayout(HEROES, ring);
    expect(Object.keys(layout).sort()).toEqual(Object.keys(HEROES).sort());
    for (const p of Object.values(layout)) {
      expect(Math.hypot(p.x - ring.cx, p.y - ring.cy)).toBeCloseTo(ring.radius, 5);
    }
  });

  it('같은 입력이면 같은 좌표를 반환한다 (결정적 배치)', () => {
    expect(computeRingLayout(HEROES, ring)).toEqual(computeRingLayout(HEROES, ring));
  });

  it('돌격 영웅 묶음은 원의 위쪽 중앙에 배치된다', () => {
    const layout = computeRingLayout(HEROES, ring);
    const tanks = ['winston', 'reinhardt'].map((id) => layout[id]);
    const avgX = tanks.reduce((s, p) => s + p.x, 0) / tanks.length;
    expect(avgX).toBeCloseTo(ring.cx, 5);
    expect(tanks.every((p) => p.y < ring.cy)).toBe(true);
  });

  it('역할별 라벨은 해당 역할 영웅들 바깥쪽에 위치한다', () => {
    const labels = computeSectorLabels(HEROES, { ...ring, labelRadius: 460 });
    expect(labels.map((l) => l.role)).toEqual(['tank', 'damage', 'support']);
    const tank = labels[0];
    expect(tank.x).toBeCloseTo(ring.cx, 5);
    expect(tank.y).toBeCloseTo(ring.cy - 460, 5);
  });
});

describe('edgeGeometry', () => {
  it('노드 반지름만큼 떨어진 곳에서 시작하고 화살촉 끝은 대상 노드 가장자리에 닿는다', () => {
    const from = { x: 100, y: 500 };
    const to = { x: 900, y: 500 };
    const g = edgeGeometry(from, to, { x: 500, y: 500 }, { nodeRadius: 20, gap: 4, arrowSize: 10 });
    expect(g.start.x).toBeCloseTo(124, 5);
    expect(g.tip.x).toBeCloseTo(876, 5);
    expect(g.d.startsWith('M124.0 500.0')).toBe(true);
    expect(g.head.startsWith('M876.0 500.0')).toBe(true);
  });

  it('곡선 제어점은 두 점의 중간보다 중심 쪽으로 당겨진다', () => {
    const g = edgeGeometry({ x: 100, y: 100 }, { x: 900, y: 100 }, { x: 500, y: 500 }, { nodeRadius: 20 });
    expect(g.control.x).toBeCloseTo(500, 5);
    expect(g.control.y).toBeGreaterThan(100);
    expect(g.control.y).toBeLessThan(500);
  });
});
