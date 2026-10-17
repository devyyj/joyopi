import { HERO_ROLES, type CounterRelation, type Hero, type HeroRole } from '@/app/actions/overwatchData';

export type RoleFilter = HeroRole | 'all';
export type EdgeKind = 'out' | 'in' | 'dim' | 'base';
export type NodeState = 'selected' | 'out' | 'in' | 'dim' | 'normal';

export interface Point {
  x: number;
  y: number;
}

interface Ring {
  cx: number;
  cy: number;
  radius: number;
}

const byStrengthDesc = (a: CounterRelation, b: CounterRelation) => b.strength - a.strength;

/** 이 영웅이 카운터하는 관계 (강도 내림차순) */
export function getCountersOf(heroId: string, counters: CounterRelation[]): CounterRelation[] {
  return counters.filter((c) => c.counter === heroId).sort(byStrengthDesc);
}

/** 이 영웅을 카운터하는 관계 (강도 내림차순) */
export function getCounteredBy(heroId: string, counters: CounterRelation[]): CounterRelation[] {
  return counters.filter((c) => c.target === heroId).sort(byStrengthDesc);
}

/** 강도 필터와 역할 필터를 적용한다. 역할 필터는 한쪽 끝이라도 해당 역할이면 남긴다. */
export function filterEdges(
  counters: CounterRelation[],
  heroes: Record<string, Hero>,
  { role, minStrength }: { role: RoleFilter; minStrength: number }
): CounterRelation[] {
  const inRole = (id: string) => role === 'all' || heroes[id]?.role === role;
  return counters.filter((c) => c.strength >= minStrength && (inRole(c.counter) || inRole(c.target)));
}

export function getEdgeKind(edge: CounterRelation, selectedId: string | null): EdgeKind {
  if (!selectedId) return 'base';
  if (edge.counter === selectedId) return 'out';
  if (edge.target === selectedId) return 'in';
  return 'dim';
}

/** 선택한 영웅 기준 노드 상태. edges 에는 화면에 보이는(필터를 통과한) 간선을 넘긴다. */
export function getNodeState(heroId: string, selectedId: string | null, edges: CounterRelation[]): NodeState {
  if (!selectedId) return 'normal';
  if (heroId === selectedId) return 'selected';
  if (edges.some((e) => e.counter === selectedId && e.target === heroId)) return 'out';
  if (edges.some((e) => e.target === selectedId && e.counter === heroId)) return 'in';
  return 'dim';
}

const normalize = (s: string) => s.toLowerCase().replace(/[\s:.\-_]/g, '');

/** 한글/영문 이름 검색. 정확히 일치 > 앞부분 일치 > 부분 일치 순으로 우선한다. */
export function searchHero(query: string, heroes: Record<string, Hero>): Hero | null {
  const q = normalize(query);
  if (!q) return null;
  const list = Object.values(heroes);
  const keys = (h: Hero) => [h.name, h.nameEn, h.id].map(normalize);
  return (
    list.find((h) => keys(h).some((k) => k === q)) ??
    list.find((h) => keys(h).some((k) => k.startsWith(q))) ??
    list.find((h) => keys(h).some((k) => k.includes(q))) ??
    null
  );
}

/** 역할 순서대로 영웅을 나열하고, 역할 사이에 빈 칸을 하나씩 둔 원형 슬롯 */
function ringSlots(heroes: Record<string, Hero>) {
  const slots: (Hero | null)[] = [];
  for (const role of HERO_ROLES) {
    slots.push(...Object.values(heroes).filter((h) => h.role === role), null);
  }
  const step = 360 / slots.length;
  const tankCount = slots.filter((h) => h?.role === 'tank').length;
  // 돌격 묶음의 가운데가 원의 맨 위(-90°)에 오도록 시작 각도를 맞춘다
  const base = -90 - ((tankCount - 1) / 2) * step;
  return { slots, angleOf: (index: number) => ((base + index * step) * Math.PI) / 180 };
}

/** 역할별로 묶어 원 위에 배치한다. 같은 입력이면 항상 같은 좌표를 반환한다. */
export function computeRingLayout(heroes: Record<string, Hero>, { cx, cy, radius }: Ring): Record<string, Point> {
  const { slots, angleOf } = ringSlots(heroes);
  const layout: Record<string, Point> = {};
  slots.forEach((h, i) => {
    if (!h) return;
    const a = angleOf(i);
    layout[h.id] = { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  });
  return layout;
}

/** 역할 묶음의 가운데 각도에 역할 라벨 위치를 계산한다. */
export function computeSectorLabels(
  heroes: Record<string, Hero>,
  { cx, cy, labelRadius }: Omit<Ring, 'radius'> & { labelRadius: number }
): { role: HeroRole; x: number; y: number }[] {
  const { slots, angleOf } = ringSlots(heroes);
  return HERO_ROLES.flatMap((role) => {
    const indices = slots.flatMap((h, i) => (h?.role === role ? [i] : []));
    if (indices.length === 0) return [];
    const a = angleOf((indices[0] + indices[indices.length - 1]) / 2);
    return [{ role, x: cx + labelRadius * Math.cos(a), y: cy + labelRadius * Math.sin(a) }];
  });
}

const unit = (x: number, y: number): Point => {
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
};
const f = (v: number) => v.toFixed(1);

/** 원 중심 쪽으로 휘는 곡선 간선과 화살촉 경로를 계산한다. */
export function edgeGeometry(
  from: Point,
  to: Point,
  center: Point,
  { nodeRadius, gap = 4, arrowSize = 10, pull = 0.55 }: { nodeRadius: number; gap?: number; arrowSize?: number; pull?: number }
) {
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const control = { x: mid.x + (center.x - mid.x) * pull, y: mid.y + (center.y - mid.y) * pull };
  const u = unit(control.x - from.x, control.y - from.y);
  const v = unit(to.x - control.x, to.y - control.y);
  const offset = nodeRadius + gap;
  const start = { x: from.x + u.x * offset, y: from.y + u.y * offset };
  const tip = { x: to.x - v.x * offset, y: to.y - v.y * offset };
  const base = { x: tip.x - v.x * arrowSize, y: tip.y - v.y * arrowSize };
  const wing = { x: -v.y * arrowSize * 0.55, y: v.x * arrowSize * 0.55 };
  return {
    start,
    tip,
    control,
    d: `M${f(start.x)} ${f(start.y)} Q${f(control.x)} ${f(control.y)} ${f(base.x)} ${f(base.y)}`,
    head: `M${f(tip.x)} ${f(tip.y)} L${f(base.x + wing.x)} ${f(base.y + wing.y)} L${f(base.x - wing.x)} ${f(base.y - wing.y)} Z`,
  };
}
