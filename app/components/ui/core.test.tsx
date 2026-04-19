import { render, screen } from '@testing-library/react';
import { SectionHeader, Button } from './core';
import { describe, it, expect } from 'vitest';

describe('UI Core Components', () => {
  describe('SectionHeader', () => {
    it('라벨과 제목을 렌더링해야 한다', () => {
      render(<SectionHeader label="LAB" title="TEST TITLE" />);
      
      expect(screen.getByText('LAB')).toBeInTheDocument();
      expect(screen.getByText('TEST TITLE')).toBeInTheDocument();
    });

    it('설명이 있을 때 설명을 렌더링해야 한다', () => {
      render(<SectionHeader label="LAB" title="TITLE" description="THIS IS DESCRIPTION" />);
      
      expect(screen.getByText('THIS IS DESCRIPTION')).toBeInTheDocument();
    });
  });

  describe('Button', () => {
    it('기본(primary) 버튼을 렌더링해야 한다', () => {
      render(<Button>CLICK ME</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      
      expect(button).toBeInTheDocument();
      // Tailwind v4의 경우 클래스명이 직접 노출되므로 포함 여부 확인
      expect(button.className).toContain('bg-primary');
    });

    it('variant에 따라 다른 스타일을 적용해야 한다', () => {
      render(<Button variant="outline">OUTLINE</Button>);
      const button = screen.getByRole('button', { name: /outline/i });
      
      expect(button.className).toContain('border-border');
    });
  });
});
