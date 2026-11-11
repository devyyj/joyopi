import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import BrandLogo from './brand-logo';
import { metadata, viewport } from '@/app/site-metadata';

const publicDir = join(process.cwd(), 'public');

describe('BrandLogo', () => {
  it('밝은 화면용·어두운 화면용 워드마크를 모두 렌더링한다', () => {
    render(<BrandLogo />);
    const imgs = screen.getAllByRole('img', { name: 'joyopi' });
    const srcs = imgs.map((img) => img.getAttribute('src'));
    expect(srcs).toContain('/joyopi-wordmark.svg');
    expect(srcs).toContain('/joyopi-wordmark-dark.svg');
  });

  it('밝은 워드마크는 다크 모드에서 숨고, 어두운 워드마크는 다크 모드에서만 보인다', () => {
    render(<BrandLogo />);
    const [light, dark] = screen.getAllByRole('img', { name: 'joyopi' });
    expect(light.className).toContain('dark:hidden');
    expect(dark.className).toContain('hidden');
    expect(dark.className).toContain('dark:block');
  });
});

describe('브랜드 에셋 적용', () => {
  it('로고 파일이 public에 존재한다', () => {
    for (const f of [
      'favicon.ico',
      'favicon.svg',
      'apple-touch-icon.png',
      'icon-rounded-192.png',
      'icon-rounded-512.png',
      'icon-512.png',
      'og-image.png',
      'joyopi-wordmark.svg',
      'joyopi-wordmark-dark.svg',
    ]) {
      expect(existsSync(join(publicDir, f)), f).toBe(true);
    }
  });

  it('메타데이터가 새 파비콘·애플 아이콘·OG 이미지를 가리킨다', () => {
    const icons = JSON.stringify(metadata.icons);
    expect(icons).toContain('/favicon.svg');
    expect(icons).toContain('/favicon.ico');
    expect(icons).toContain('/apple-touch-icon.png');
    expect(JSON.stringify(metadata.openGraph)).toContain('/og-image.png');
    expect(JSON.stringify(viewport.themeColor)).toContain('#F5F2EA');
  });

  it('영문 표기는 YOPI LAB 대신 joyopi를 쓴다', () => {
    expect(String(metadata.title)).toContain('joyopi');
    expect(String(metadata.title)).not.toContain('YOPI LAB');
  });

  it('전역 색이 브랜드 값(크림·잉크·주황)을 쓴다', () => {
    const css = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8');
    expect(css).toContain('--background: #F5F2EA');
    expect(css).toContain('--foreground: #1B1B1B');
    expect(css).toContain('--primary: #E8590C');
    expect(css).not.toMatch(/#0969da|#2f81f7/i);
  });

  it('manifest가 브랜드 색과 새 아이콘을 사용한다', () => {
    const manifest = JSON.parse(readFileSync(join(publicDir, 'site.webmanifest'), 'utf8'));
    expect(manifest.theme_color).toBe('#F5F2EA');
    expect(manifest.background_color).toBe('#F5F2EA');
    const srcs = manifest.icons.map((i: { src: string }) => i.src);
    expect(srcs).toEqual(expect.arrayContaining(['/icon-rounded-192.png', '/icon-rounded-512.png', '/icon-512.png']));
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
  });
});
