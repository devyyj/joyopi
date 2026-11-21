# 조요피 (joyopi)

조요피(JOYOPI)가 만드는 모바일 앱의 공식 웹사이트(joyopi.com)입니다. Next.js와 Firebase로 만들었습니다.

## 🚀 주요 기능

- **개발자 조요피의 사이트**: 홈은 둥근 타일로 앱·유튜브·인프런 강의·새 소식·의견 보내기를 한 화면에 모은다(2026-11-22). 대표 메뉴 앱·유튜브·강의·소식·지원(소개는 푸터)과 공통 푸터(사업자 정보). 앱마다 소개·개인정보 처리방침·지원·계정 삭제 안내. 로그인 없이 열립니다.
- **홈의 바깥 데이터**(`app/_data/external.ts`): 유튜브 최근 영상·쇼츠는 채널 공개 피드를 1시간마다(`utils/youtube/feed.ts`, 쇼츠는 `/shorts/<ID>` 응답으로 구분), 인프런 강의·수강생·평점·수강평은 강사 강의 목록 페이지를 하루 한 번 읽는다(`utils/inflearn/profile.ts`). 못 읽으면 유튜브는 채널 버튼만, 인프런은 숫자 없이 기본 강의 목록을 보여 준다. 새 강의를 내면 `utils/inflearn/profile.ts`의 `FALLBACK`에도 더한다(언어별 제목). 인프런은 주소에 언어(`/ko/`·`/ja/`·`/en/`)를 붙여 그 언어 제목으로 읽는다
- **의견 보내기**: 헤더와 홈의 창에서 로그인 없이 공통 의견 API로 보낸다([docs/04](./docs/04_의견_API.md)).
- **3개 언어**: 앱 관련 페이지는 한국어·일본어·영어(`/ko/apps/...`, `/ja/...`, `/en/...`). 스토어에 등록한 언어 없는 주소(`/apps/...`)는 브라우저 언어로 보냅니다(`proxy.ts`). 소개·소식·지원·약관·에코는 한국어만. 자세한 규칙은 [docs/03 10장](./docs/03_앱_스토어_페이지.md).
- **회원·로그인 없음**: 문의는 「의견 보내기」나 메일(`hello@joyopi.com`)로 받습니다. 의견으로 받는 정보는 `/policies`에 적었다.
- **에코**(`/echo`): 메뉴에 없는 실시간 실험 서비스. 주소를 아는 사람은 로그인 없이 씁니다.

## 🛠 기술 스택

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Realtime**: Firebase Realtime Database (에코 접속자·이벤트)
- **Database**: Cloud Firestore (에코 로그, 서버 액션에서 Admin SDK로만 접근)
- **Testing/Lint**: Vitest, ESLint

## 📦 시작하기

```bash
# 의존성 설치
npm install

# 환경 변수 (.env.local): Firestore 서비스 계정
# FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (줄바꿈은 
)

# 보안 규칙 배포 (database.rules.json, firestore.rules)
npx firebase-tools deploy --only database,firestore:rules --project joyopi

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
