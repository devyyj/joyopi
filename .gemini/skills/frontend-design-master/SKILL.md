---
name: frontend-design-master
description: 프론트엔드 디자인 및 UX 최적화 전문 스킬. 세련된 레이아웃, 감각적인 애니메이션, 일관된 디자인 시스템(YOPI LAND 테마)을 적용할 때 사용합니다.
---

# Frontend Design Master (YOPI LAND Edition)

이 스킬은 "요피 랜드"의 핵심 가치인 '놀이터(Playground)'와 '실험실'의 분위기를 UI로 구현하기 위한 지침입니다.

## 1. 핵심 디자인 원칙
- **Vibrancy**: 정적인 무채색보다는 생동감 있는 포인트 컬러(Indigo, Emerald, Violet)와 그라데이션을 사용합니다.
- **Interactivity**: 모든 클릭 요소는 `active:scale-95`와 같은 미세한 피드백과 `hover:shadow-glow` 효과를 포함해야 합니다.
- **Glassmorphism**: 배경에 `backdrop-blur`와 미세한 투명도를 적용하여 깊이감을 줍니다.
- **Smoothness**: Framer Motion 또는 CSS Transition을 사용하여 요소의 등장을 부드럽게 처리합니다.

## 2. 디자인 토큰 및 스타일 가이드
구체적인 코드 패턴과 스타일 가이드는 다음 참조 파일을 확인하십시오.

- **[UI Patterns (patterns.md)](references/patterns.md)**: 카드, 버튼, 헤더 등의 구체적인 Tailwind 4 구현 코드.
- **[Animation Guide (animations.md)](references/animations.md)**: 사용자 경험을 높이는 애니메이션 프리셋.

## 3. 작업 프로세스
1. **분석**: 요청받은 UI의 기능적 목적을 파악합니다.
2. **스타일링**: `patterns.md`의 최신 트렌드를 반영하여 레이아웃을 잡습니다.
3. **디테일**: 그림자, 보더 그라데이션, 마이크로 인터랙션을 추가합니다.
4. **검증**: 다크 모드와 반응형(모바일 우선) 대응 여부를 확인합니다.
