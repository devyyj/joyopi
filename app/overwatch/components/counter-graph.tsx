'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useRef } from 'react';
import { ROLE_LABELS, type CounterRelation, type Hero } from '@/app/actions/overwatchData';
import { cn } from '@/utils/cn';
import {
  computeRingLayout,
  computeSectorLabels,
  edgeGeometry,
  getEdgeKind,
  getNodeState,
} from '../lib/counter-graph';
import { displayFont } from '../fonts';
import { EDGE_COLOR, NODE_RING, ROLE_FILL } from './theme';

// SVG 좌표계 (정사각형). 노드는 같은 비율의 HTML 버튼으로 겹쳐 그린다.
const SIZE = 1000;
const CENTER = { x: SIZE / 2, y: SIZE / 2 };
const RADIUS = 400;
const NODE_RADIUS = 20;
const LABEL_RADIUS = 466;

// 긴 부동소수 문자열은 브라우저가 반올림해 SSR 결과와 어긋나므로(하이드레이션 경고) 자릿수를 고정한다
const pct = (v: number) => `${((v / SIZE) * 100).toFixed(3)}%`;

interface CounterGraphProps {
  heroes: Record<string, Hero>;
  edges: CounterRelation[];
  selectedId: string | null;
  onSelect: (heroId: string) => void;
}

export default function CounterGraph({ heroes, edges, selectedId, onSelect }: CounterGraphProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const layout = useMemo(() => computeRingLayout(heroes, { cx: CENTER.x, cy: CENTER.y, radius: RADIUS }), [heroes]);

  // 좁은 화면에서는 가로 스크롤이 생기므로, 처음에 원의 가운데가 보이도록 맞춘다
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);
  const sectors = useMemo(
    () => computeSectorLabels(heroes, { cx: CENTER.x, cy: CENTER.y, labelRadius: LABEL_RADIUS }),
    [heroes]
  );

  const drawnEdges = edges
    .map((edge) => {
      const kind = getEdgeKind(edge, selectedId);
      const highlighted = kind === 'out' || kind === 'in';
      const geometry = edgeGeometry(layout[edge.counter], layout[edge.target], CENTER, {
        nodeRadius: NODE_RADIUS,
        arrowSize: highlighted ? 8 + edge.strength * 2 : 7,
      });
      return {
        key: `${edge.counter}>${edge.target}`,
        kind,
        highlighted,
        geometry,
        width: highlighted ? [0, 1.6, 2.6, 4][edge.strength] : [0, 0.8, 1.2, 1.8][edge.strength],
        opacity: kind === 'dim' ? 0.06 : highlighted ? 1 : 0.3,
      };
    })
    // 강조된 간선을 위에 그린다
    .sort((a, b) => Number(a.highlighted) - Number(b.highlighted));

  return (
    <div ref={scrollRef} className="overflow-x-auto">
      <div role="group" aria-label="카운터 관계도" className="relative mx-auto aspect-square w-full min-w-[620px] max-w-[880px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true" className="absolute inset-0 h-full w-full">
          <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS} fill="none" stroke="#1C2838" strokeWidth={1} strokeDasharray="4 6" />
          <circle cx={CENTER.x} cy={CENTER.y} r={RADIUS / 2.2} fill="none" stroke="#151F2C" strokeWidth={1} />
          {drawnEdges.map((e) => (
            <g key={e.key} data-edge={e.kind} opacity={e.opacity}>
              <path d={e.geometry.d} fill="none" stroke={EDGE_COLOR[e.kind]} strokeWidth={e.width} strokeLinecap="round" />
              <path d={e.geometry.head} fill={EDGE_COLOR[e.kind]} />
            </g>
          ))}
        </svg>

        {sectors.map((s) => (
          <span
            key={s.role}
            aria-hidden="true"
            className={cn(displayFont.className, 'absolute -translate-x-1/2 -translate-y-1/2 text-lg tracking-[0.1em] text-[#5E6C7E]')}
            style={{ left: pct(s.x), top: pct(s.y) }}
          >
            {ROLE_LABELS[s.role]}
          </span>
        ))}

        {Object.values(heroes).map((hero) => {
          const p = layout[hero.id];
          const state = getNodeState(hero.id, selectedId, edges);
          const showLabel = state === 'selected' || state === 'out' || state === 'in';
          return (
            <button
              key={hero.id}
              type="button"
              aria-label={`${hero.name} 선택`}
              title={hero.name}
              onClick={() => onSelect(hero.id)}
              className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F99E1A]"
              style={{
                left: pct(p.x),
                top: pct(p.y),
                width: pct(NODE_RADIUS * 2.2),
                opacity: state === 'dim' ? 0.35 : 1,
                zIndex: showLabel ? 2 : 1,
              }}
            >
              <span
                className="relative block aspect-square w-full overflow-hidden rounded-full transition-transform group-hover:scale-110"
                style={{
                  background: ROLE_FILL[hero.role],
                  border: `${state === 'normal' || state === 'dim' ? 2 : 3}px solid ${NODE_RING[state]}`,
                  boxShadow: state === 'selected' ? '0 0 0 5px rgba(249,158,26,0.25)' : undefined,
                }}
              >
                <Image src={hero.imageUrl} alt="" fill sizes="48px" className="object-cover" />
              </span>
              {showLabel && (
                <span
                  className={cn(
                    'absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded px-1 text-[11px] leading-tight',
                    state === 'selected' ? 'bg-[#F99E1A] font-bold text-[#1A1206]' : 'bg-[#0B1119]/80 font-medium text-[#D5DEE8]'
                  )}
                >
                  {hero.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
