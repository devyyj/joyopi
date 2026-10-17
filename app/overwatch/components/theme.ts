import type { HeroRole } from '@/app/actions/overwatchData';
import type { EdgeKind, NodeState } from '../lib/counter-graph';

export const ACCENT = '#F99E1A';
export const OUT_COLOR = '#4FC3F7'; // 내가 잡는 영웅
export const IN_COLOR = '#FF6A3D'; // 나를 잡는 영웅
export const IN_TEXT_COLOR = '#FF8A66';

export const ROLE_FILL: Record<HeroRole, string> = {
  tank: '#1D3554',
  damage: '#4A2622',
  support: '#1D4434',
};

export const EDGE_COLOR: Record<EdgeKind, string> = {
  out: OUT_COLOR,
  in: IN_COLOR,
  base: '#6B7A8D',
  dim: '#6B7A8D',
};

export const NODE_RING: Record<NodeState, string> = {
  selected: ACCENT,
  out: OUT_COLOR,
  in: IN_COLOR,
  normal: '#4A5869',
  dim: '#334052',
};
