# 조요피 연구소 (YOPI LAB)

Next.js 15와 Supabase를 활용한 초고속 반응형 커뮤니티 및 개인 개발 포털입니다.

## 🚀 주요 기능

- **통합 대시보드**: 최신/인기 게시글 및 활발한 논의 실시간 집계 및 퀵 프리뷰.
- **피드형 게시판**: 
  - **무한 스크롤**: Native Intersection Observer를 이용한 끊김 없는 콘텐츠 로딩.
  - **인라인 편집**: 페이지 이동 없는 즉각적인 CRUD 및 Optimistic UI 반영.
  - **구조화된 레이아웃**: Identity Bar와 최적화된 정보 위계를 통한 높은 가독성.
- **프로필 시스템**:
  - **이미지 최적화**: 클라이언트 측 자동 리사이징(300x300 WebP) 후 업로드.
  - **익명성 기반**: 소셜 로그인 연동 및 닉네임 중심의 활동.
- **공통 UI 시스템**: 전역 다이얼로그(Alert/Confirm), 세련된 플로팅 액션 버튼(FAB), 재사용 가능한 아바타/닉네임 컴포넌트.

## 🛠 기술 스택

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend/Storage**: Supabase (Auth, Storage)
- **Database**: PostgreSQL (Supabase) + Drizzle ORM
- **Testing/Lint**: Vitest, ESLint

## 📦 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드 및 프로덕션 실행
npm run build
npm start

# 코드 검증 (Lint, TSC, Test)
npm run verify
```

## 📄 관련 문서
- [프로젝트 정의서 (docs/00_조요피연구소.md)](./docs/00_조요피연구소.md)
- [자유게시판 상세 명세 (docs/01_자유게시판.md)](./docs/01_자유게시판.md)
- [엔지니어링 가이드 (GEMINI.md)](./GEMINI.md)
