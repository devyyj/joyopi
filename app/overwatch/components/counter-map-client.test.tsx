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
  { counter: 'winston', target: 'genji', strength: 2, reason: '테슬라 캐논으로 추적' },
  { counter: 'winston', target: 'widowmaker', strength: 3, reason: '점프로 즉시 접근' },
  { counter: 'genji', target: 'zenyatta', strength: 3, reason: '기동력 없는 후방 처치' },
  { counter: 'genji', target: 'ana', strength: 1, reason: '수면총 반사' },
  { counter: 'ana', target: 'reinhardt', strength: 2, reason: '수면총으로 돌진 차단' },
];

const renderMap = () =>
  render(<CounterMapClient heroes={HEROES} counters={COUNTERS} version="테스트 버전" />);

const graph = () => screen.getByRole('group', { name: '카운터 관계도' });
const panel = () => screen.getByRole('complementary', { name: '선택한 영웅 상세' });
const edgeCount = () => graph().querySelectorAll('[data-edge]').length;

describe('CounterMapClient', () => {
  it('1. 모든 영웅 노드와 데이터 기준 버전을 표시한다', () => {
    renderMap();
    for (const h of Object.values(HEROES)) {
      expect(within(graph()).getByRole('button', { name: `${h.name} 선택` })).toBeInTheDocument();
    }
    expect(screen.getByText(/테스트 버전/)).toBeInTheDocument();
  });

  it('2. 선택 전에는 안내 문구를 보여주고, 기본 강도 필터(유리 이상)를 적용한다', () => {
    renderMap();
    expect(within(panel()).getByText('영웅을 선택하세요')).toBeInTheDocument();
    expect(edgeCount()).toBe(4);
  });

  it('3. 노드를 누르면 내가 잡는 영웅 / 나를 잡는 영웅과 사유를 보여준다', () => {
    renderMap();
    fireEvent.click(within(graph()).getByRole('button', { name: '겐지 선택' }));

    expect(within(panel()).getByRole('heading', { name: '겐지' })).toBeInTheDocument();
    const outList = within(panel()).getByRole('list', { name: '내가 잡는 영웅' });
    const inList = within(panel()).getByRole('list', { name: '나를 잡는 영웅' });
    expect(within(outList).getByText('젠야타')).toBeInTheDocument();
    expect(within(outList).getByText('기동력 없는 후방 처치')).toBeInTheDocument();
    // 상세 패널은 필터와 관계없이 모든 관계를 보여준다
    expect(within(outList).getByText('아나')).toBeInTheDocument();
    expect(within(inList).getByText('윈스턴')).toBeInTheDocument();
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

  it('6. 강도 필터를 바꾸면 보이는 관계가 달라진다', () => {
    renderMap();
    fireEvent.click(screen.getByRole('button', { name: '매우 유리만' }));
    expect(edgeCount()).toBe(2);
    fireEvent.click(screen.getByRole('button', { name: '모든 강도' }));
    expect(edgeCount()).toBe(5);
    expect(screen.getByRole('button', { name: '모든 강도' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('7. 역할 필터는 해당 역할이 포함된 관계만 남긴다', () => {
    renderMap();
    fireEvent.click(screen.getByRole('button', { name: '모든 강도' }));
    fireEvent.click(screen.getByRole('button', { name: '지원' }));
    expect(screen.getByRole('button', { name: '지원' })).toHaveAttribute('aria-pressed', 'true');
    expect(edgeCount()).toBe(3);
  });

  it('8. 검색하면 일치하는 영웅을 선택하고, 없으면 안내한다', () => {
    renderMap();
    const input = screen.getByRole('searchbox', { name: '영웅 검색' });
    fireEvent.change(input, { target: { value: '위도' } });
    expect(within(panel()).getByRole('heading', { name: '위도우메이커' })).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '없는영웅' } });
    expect(screen.getByText('일치하는 영웅이 없습니다.')).toBeInTheDocument();
  });

  it('9. 영웅 목록 선택 상자로도 영웅을 고를 수 있다', () => {
    renderMap();
    fireEvent.change(screen.getByRole('combobox', { name: '영웅 목록에서 선택' }), { target: { value: 'ana' } });
    expect(within(panel()).getByRole('heading', { name: '아나' })).toBeInTheDocument();
  });
});
