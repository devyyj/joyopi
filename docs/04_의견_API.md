# 의견 보내기 API

모든 앱의 「의견 보내기」 시트가 쓰는 공통 API다. 규칙(화면·문구·이벤트)의 정본은 `business/apps/common.md` 4장이고, 이 문서는 API 사용법과 운영만 적는다.

- 코드: `app/api/feedback/route.ts`(라우트), `utils/feedback/`(검사·횟수 제한·Slack 메시지, 테스트 포함)
- 받은 의견: Firestore `feedback` 컬렉션(joyopi 프로젝트) + Slack 채널 알림
- 웹(joyopi.com)에서도 보낸다(2026-11-22): 헤더와 홈의 「의견 보내기」 창(`app/components/feedback/`). 앱 대신 브라우저마다 만든 익명 ID(`web-…`, localStorage)를 `deviceId`로, `meta`는 `os: web`·`lang`만 보낸다. 수집 항목은 `/policies`에 적었다

## 요청

`POST https://joyopi.com/api/feedback` · `Content-Type: application/json`(UTF-8)

```json
{
  "app": "agirok",
  "kind": "bug",
  "message": "밤중 수유 기록할 때 화면이 너무 밝아요",
  "email": "parent@example.com",
  "deviceId": "8f2c0a4e-3b1d-4c55-9a77-1e2f3a4b5c6d",
  "meta": { "appVersion": "1.0.2", "build": "11", "os": "iOS", "osVersion": "18.1", "device": "iPhone15,2", "lang": "ko" }
}
```

| 필드 | 필수 | 값 |
| --- | --- | --- |
| `app` | 예 | `agirok` · `rockgazing` · `ssamkejul` · `likeloop` · `kkotjam` · `joyopi`(joyopi.com 웹의 「사이트 전체」) |
| `kind` | 아니오 | 칩: `bug`(불편해요) · `idea`(이런 기능 원해요) · `other`(기타). 안 골랐으면 빼거나 `null` |
| `message` | 예 | 앞뒤 공백을 뺀 1~2000자 |
| `email` | 아니오 | 답장 받을 주소. 빈 문자열이면 없음 |
| `deviceId` | 예 | 앱 설치마다 처음 한 번 만들어 기기에 저장한 익명 ID(UUID 권장, 영문·숫자·`-`·`_` 8~64자). 횟수 제한에만 쓴다 |
| `meta` | 아니오 | 위 6개 키만 남기고 값은 64자로 자른다. 계정·기록 정보는 넣지 않는다 |

## 응답

| 상태 | 본문 | 앱에서 |
| --- | --- | --- |
| 200 | `{"ok":true}` | 「보냈어요, 고마워요!」 |
| 400 | `{"ok":false,"error":"empty-message"}` 등 | 앱 버그. 글을 지우지 말고 다시 시도 안내 |
| 413 | `too-large` | 위와 같음 |
| 429 | `rate-limited` | 「잠시 뒤에 다시 보내 주세요」 |
| 500 | `save-failed` · `server-config` | 「보내지 못했어요 · 다시 시도」, 글 유지 |

- 횟수 제한: 한 시간에 기기당 5번, IP당 20번(`utils/feedback/rate.ts`). 횟수는 `feedback_rate` 컬렉션에 해시 ID로 세어 IP 원문은 남지 않는다.
- Slack 알림이 실패해도 저장됐으면 200을 준다(서버 로그에 `[feedback] Slack 알림 실패`).
- 웹뷰 앱을 위해 CORS를 모든 출처에 연다(쿠키·인증 없음).
- **앱의 「신고하기」도 이 API로 온다**(2026-11-22, 모든 앱 공통 `business/apps/common.md` 12장): 각 앱 서버가 `kind: other`, 메시지 첫 줄 `[신고] <앱 이름>`, `deviceId: <앱 약칭>-report-<신고한 사람 ID>`, `meta.os: server`로 보낸다. 신고 원본은 그 앱의 서버(LikeLoop은 Firestore `reports`). 지금 보내는 앱: LikeLoop(`ll-report-…`).

## 환경 변수 (Vercel)

| 이름 | 값 |
| --- | --- |
| `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | 기존 joyopi 서버 계정(메아리와 같이 씀) |
| `SLACK_FEEDBACK_WEBHOOK_URL` | Slack Incoming Webhook 주소(비밀값, Production·Preview에 등록 2026-11-21). 없으면 저장만 되고 알림은 안 간다 |

Slack 쪽 구성(2026-11-21): 워크스페이스 `joyopi`의 비공개 채널 `#app-feedback`, Slack 앱 `joyopi feedback`(ID `A0CLJ1CDQ48`, 권한 `incoming-webhook`만). 주소가 새면 api.slack.com › joyopi feedback › Incoming Webhooks에서 지우고 새로 만든 뒤 Vercel 값을 바꾼다.

## 의견 보기

- 새 의견은 Slack 채널에 바로 뜬다. 메시지 끝의 코드(`` `abc123` ``)가 Firestore 문서 ID다.
- 전체 목록은 Firebase 콘솔 › joyopi › Firestore › `feedback`.
- 답장은 이메일을 적은 사람에게만, 사업용 Gmail에서 보낸다(`business/apps/joyopi.md` 4장).
- 선택: `feedback_rate.expireAt`에 Firestore TTL 정책을 걸면 지난 횟수 기록이 저절로 지워진다.
