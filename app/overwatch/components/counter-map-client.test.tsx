import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { CounterRelation, Hero } from '@/app/actions/overwatchData';
import CounterMapClient from './counter-map-client';

// next/font 는 Next 컴파일러가 변환하므로 테스트 환경에서는 대체한다
vi.mock('../fonts', () => ({ displayFont: { className: 'display-font' } }));

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
  widowmaker: hero('widowmaker', '위도우메이커', 'Widowmaker', 'damage'),
  ana: hero('ana', '아나', 'Ana', 'support'),
  zenyatta: hero('zenyatta', '젠야타', 'Zenyatta', 'support'),
};

const COUNTERS: CounterRelation[] = [
  { counter: 'winston', target: 'genji', level: 'counter', reason: '테슬라 캐논으로 추적' },
  { counter: 'winston', target: 'widowmaker', level: 'hard', reason: '점프로 즉시 접근' },
  { counter: 'genji', target: 'ana', level: 'counter', reason: '수면총 반사' },
  { counter: 'genji', target: 'zenyatta', level: 'hard', reason: '기동력 없는 후방 처치' },
  { counter: 'ana', target: 'reinhardt', level: 'counter', reason: '수면총으로 돌진 차단' },
];

const renderMap = () =>
  render(<CounterMapClient heroes={HEROES} counters={COUNTERS} version="테스트 버전" />);

const graph = () => screen.getByRole('group', { name: '카운터 관계도' });
const panel = () => screen.getByRole('complementary', { name: '선택한 영웅 상세' });
const edgeCount = (selector = '[data-edge]') => graph().querySelectorAll(selector).length;

describe('CounterMapClient', () => {
  it('1. 모든 영웅 노드와 데이터 기준 버전을 표시한다', () => {
    renderMap();
    for (const h of Object.values(HEROES)) {
      expect(within(graph()).getByRole('button', { name: `${h.name} 선택` })).toBeInTheDocument();
    }
    expect(screen.getByText(/테스트 버전/)).toBeInTheDocument();
  });

  it('2. 선택 전에는 안내 문구를 보여주고, 모든 관계를 하드 카운터/카운터로 구분해 그린다', () => {
    renderMap();
    expect(within(panel()).getByText('영웅을 선택하세요')).toBeInTheDocument();
    expect(edgeCount()).toBe(5);
    expect(edgeCount('[data-level="hard"]')).toBe(2);
    expect(edgeCount('[data-level="counter"]')).toBe(3);
  });

  it('3. 노드를 누르면 내가 잡는 영웅 / 나를 잡는 영웅과 사유를 보여준다', () => {
    renderMap();
    fireEvent.click(within(graph()).getByRole('button', { name: '겐지 선택' }));

    expect(within(panel()).getByRole('heading', { name: '겐지' })).toBeInTheDocument();
    const outList = within(panel()).getByRole('list', { name: '내가 잡는 영웅' });
    const inList = within(panel()).getByRole('list', { name: '나를 잡는 영웅' });
    expect(within(outList).getByText('기동력 없는 후방 처치')).toBeInTheDocument();
    expect(within(inList).getByText('윈스턴')).toBeInTheDocument();

    // 하드 카운터가 먼저 오고, 각 항목에 2단계 라벨이 붙는다
    const items = within(outList).getAllByRole('listitem');
    expect(within(items[0]).getByText('젠야타')).toBeInTheDocument();
    expect(within(items[0]).getByText('하드 카운터')).toBeInTheDocument();
    expect(within(items[1]).getByText('아나')).toBeInTheDocument();
    expect(within(items[1]).getByText('카운터')).toBeInTheDocument();
  });

  it('4. 상세 패널의 영웅을 누르면 그 영웅으로 선택이 이동한다', () => {
    renderMap();
    fireEvent.click(within(graph()).getByRole('button', { name: '겐지 선택' }));
    fireEvent.click(within(panel()).getByRole('button', { name: /윈스턴/ }));
    expect(within(panel()).getByRole('heading', { name: '윈스턴' })).toBeInTheDocument();
  });

  it('5. 선택 해제 버튼을 누르면 안내 문구로 돌아간다', () => {
    renderMap();
    fireEvent.click(within(graph()).getByRole('button', { name: '겐지 선택' }));
    fireEvent.click(within(panel()).getByRole('button', { name: '선택 해제' }));
    expect(within(panel()).getByText('영웅을 선택하세요')).toBeInTheDocument();
  });

  it('6. 필터 버튼과 점(●○) 표시는 없고, 모든 영웅이 흐려지지 않은 상태로 표시된다', () => {
    renderMap();
    for (const label of ['돌격', '공격', '지원', '모든 강도', '유리 이상', '매우 유리만']) {
      expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
    }
    fireEvent.click(within(graph()).getByRole('button', { name: '겐지 선택' }));
    expect(within(panel()).queryByText(/[●○]/)).not.toBeInTheDocument();
    fireEvent.click(within(panel()).getByRole('button', { name: '선택 해제' }));
    for (const button of within(graph()).getAllByRole('button')) {
      expect(button).toHaveStyle({ opacity: '1' });
    }
  });

  it('7. 검색하면 일치하는 영웅을 선택하고, 없으면 안내한다', () => {
    renderMap();
    const input = screen.getByRole('searchbox', { name: '영웅 검색' });
    fireEvent.change(input, { target: { value: '위도' } });
    expect(within(panel()).getByRole('heading', { name: '위도우메이커' })).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '없는영웅' } });
    expect(screen.getByText('일치하는 영웅이 없습니다.')).toBeInTheDocument();
  });

  it('8. 영웅 목록 선택 상자로도 영웅을 고를 수 있다', () => {
    renderMap();
    fireEvent.change(screen.getByRole('combobox', { name: '영웅 목록에서 선택' }), { target: { value: 'ana' } });
    expect(within(panel()).getByRole('heading', { name: '아나' })).toBeInTheDocument();
  });
});
