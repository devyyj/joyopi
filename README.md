# 조요피 (joyopi)

조요피(JOYOPI)가 만드는 모바일 앱의 공식 웹사이트(joyopi.com)입니다. Next.js와 Supabase로 만들었습니다.

## 🚀 주요 기능

- **개발사 공식 사이트**: 대표 메뉴 앱·소개·소식·지원과 공통 푸터(사업자 정보). 앱마다 소개·개인정보 처리방침·지원·계정 삭제 안내. 로그인 없이 열립니다.
- **3개 언어**: 앱 관련 페이지는 한국어·일본어·영어(`/ko/apps/...`, `/ja/...`, `/en/...`). 스토어에 등록한 언어 없는 주소(`/apps/...`)는 브라우저 언어로 보냅니다(`proxy.ts`). 소개·소식·지원·약관·에코는 한국어만. 자세한 규칙은 [docs/03 10장](./docs/03_앱_스토어_페이지.md).
- **회원·로그인 없음**: 사이트는 개인정보를 받지 않습니다. 문의는 메일(`hello@joyopi.com`)로 받습니다.
- **에코**(`/echo`): 메뉴에 없는 실시간 실험 서비스. 주소를 아는 사람은 로그인 없이 씁니다.

## 🛠 기술 스택

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Realtime)
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
- [메아리 상세 명세 (docs/02_메아리.md)](./docs/02_메아리.md)
- [앱 스토어용 페이지 (docs/03_앱_스토어_페이지.md)](./docs/03_앱_스토어_페이지.md)
- [엔지니어링 가이드 (AGENTS.md)](./AGENTS.md)
