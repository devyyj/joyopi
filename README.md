# 조요피 (joyopi)

조요피(JOYOPI)가 만드는 모바일 앱의 공식 웹사이트(joyopi.com)입니다. Next.js와 Supabase로 만들었습니다.

## 🚀 주요 기능

- **개발사 공식 사이트**: 대표 메뉴 앱·소개·소식·지원·문의와 공통 푸터(사업자 정보). 앱마다 소개·개인정보 처리방침·지원·계정 삭제 안내(`/apps/...`). 로그인 없이 열립니다.
- **문의 게시판**(`/board`, 피드형): 
  - **무한 스크롤**: Native Intersection Observer를 이용한 끊김 없는 콘텐츠 로딩.
  - **인라인 편집**: 페이지 이동 없는 즉각적인 CRUD 및 Optimistic UI 반영.
  - **구조화된 레이아웃**: Identity Bar와 최적화된 정보 위계를 통한 높은 가독성.
- **계정**:
  - **최소 수집**: 구글 로그인에서 식별자와 이메일만 받고(실명·사진 없음), 프로필 화면에는 회원 탈퇴만 둡니다.
  - **익명성 기반**: 가입할 때 정해지는 무작위 닉네임으로 활동.
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
- [앱 스토어용 페이지 (docs/03_앱_스토어_페이지.md)](./docs/03_앱_스토어_페이지.md)
- [엔지니어링 가이드 (AGENTS.md)](./AGENTS.md)
