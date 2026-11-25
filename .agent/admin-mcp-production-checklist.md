# 관리자 MCP 운영 적용 체크리스트

운영 사이트: https://www.paceupcareer.com

PACE-333 관리자 MCP(PR #1194, 2026-11-24 병합)의 운영 적용 현황이다.
설계 근거와 남은 위험은 `docs/admin-local-db-mcp-poc-decisions.md`, 사용법은 `mcp/README.md`를 본다.

## 현재 상태 (2026-11-24 기준)

서버(운영 API) 쪽 준비는 끝났다. MCP 프로그램의 `production` 프로필은 이 문서와 같은 브랜치(`PACE-333/enable-production-mcp-profile`)에서 켰다.
**그 PR이 병합되기 전까지는 관리자가 운영에 연결할 수 없다.** (이전에는 `mcp/src/config.ts`가 `production` 프로필을 막고, `development` 프로필은 loopback http 주소만 허용했다.)

| 항목                                                                 | 상태                                                                                                                                                                   |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 운영 Clerk 권한 범위 `mcp:main-visual:read`, `mcp:main-visual:write` | 완료 (검색 정보 공개 안 함)                                                                                                                                            |
| 운영 Clerk OAuth 앱                                                  | 완료. 이름 `PACE-333 Pacemaker MCP (Production)`, client ID `v919d0TaD1AGZ3np`, 공개 클라이언트, PKCE 필수, 동의 화면 사용, 리디렉션 `http://127.0.0.1:53134/callback` |
| Vercel 운영 환경변수 `MCP_*` 6개                                     | 완료. 발급자 `urn:pacemaker:mcp-api:production`, 대상 `urn:pacemaker:admin-api:production`, 키 ID `prod-mcp-2026-11`, 운영 전용 RSA 키 쌍(개인키는 비밀값)             |
| 재배포와 서버 응답                                                   | 완료. `POST /api/mcp/token`이 503에서 401로 바뀜(설정이 읽힘). 공개 페이지 33건 점검 실패 0건                                                                          |
| 운영 DB 마이그레이션                                                 | 완료. `prisma migrate status`가 62개 모두 적용(`20261108000000_add_mcp_audit_log` 포함). 운영 `DIRECT_URL`로 실행했는지는 실행자 확인                                  |
| 같은 날 적용한 Clerk 업데이트                                        | 세션 토큰 새 형식, 재인증 요구, 새 기기 신뢰 확인. 24시간 안에는 되돌릴 수 있다. 비밀번호 재설정 세션 작업과 연 단위 요금제는 적용하지 않음                            |
| MCP 프로그램의 운영 연결                                             | 코드 변경 완료, **PR 병합 전**. 운영 프로필은 API 주소·Clerk 발급자·client ID를 코드에 고정하고 `PACEMAKER_MCP_PROFILE=production`일 때만 켜진다                       |
| 관리자 로그인으로 조회·수정까지 가는 실제 흐름                       | **미확인**                                                                                                                                                             |
| 요청 횟수 제한                                                       | 없음 (시범 단계에서는 불필요, 확장 전에 방화벽 규칙 추가. 아래 3번)                                                                                                    |

## 남은 일

### 1. MCP 프로그램에 운영 프로필 켜기

- [x] `mcp/src/config.ts`에서 `production` 프로필을 허용했다. API 주소 `https://www.paceupcareer.com`, Clerk 발급자 `https://clerk.paceupcareer.com`(운영 OAuth 탐색 주소가 이 발급자를 알리는 것을 확인), client ID `v919d0TaD1AGZ3np`를 코드에 고정하고, 다른 값은 시작 단계에서 거부한다.
- [x] 운영 프로필 테스트를 추가했고 README의 사용법과 안전 설명을 갱신했다.
- [x] 엣지 케이스 시험(`mcp/src/config.test.ts`, `mcp/src/production-flow.test.ts`). 비슷한 주소(`...com.evil.com`, `...com@evil.com`, http, 포트 등), 잘못된 발급자·탐색 문서, 리디렉션, 비관리자 403, 서버 미설정 503을 검사한다. 이 시험으로 개발 프로필이 운영 Clerk 발급자·client ID를 받아들이는 약점(localhost 프로그램이 운영 관리자 토큰을 받을 수 있음)을 찾아 막았다.
- [x] 운영 서버 위조 토큰 시험 (2026-11-24, 읽기 전용): 운영과 같은 발급자·대상·키 이름·client ID·권한 범위를 모두 맞추고 서명만 일회용 키로 만든 토큰, 개발 값 토큰, 만료, 수명 초과, 형식(typ) 다름, 알고리즘 바꿔치기(HS256), 쓰레기·20KB 문자열을 4개 경로(목록, 한 건 조회, 수정 제안, 수정 적용)에 보내 모두 401. 서명 없는 토큰(alg none)은 Vercel 방화벽이 앞단에서 403으로 차단. CORS 허용 헤더 없음, `no-store`.
- [ ] PR 병합
- [ ] 실제 개발 환경 토큰이 운영 서버에서 거부되는지(그 반대도) 로그인된 실제 토큰으로 확인한다 (아래 2번). 위 위조 시험은 일회용 키 서명이라 이 항목을 대신하지 못한다.
- [ ] 서버의 `NEXT_PUBLIC_APP_URL`이 정확히 `https://www.paceupcareer.com`인지 확인한다. 다르면 MCP가 수정 제안의 미리보기 링크를 숨긴다(링크 주소가 API 주소와 같을 때만 보여 주기 때문). 값이 숨김 처리돼 있어 코드로는 읽지 못했다.

### 2. 운영 흐름 확인 (관리자 계정으로 직접)

- [ ] 관리자 계정으로 로그인해 목록 조회가 된다.
- [ ] 일반 사용자 계정은 403으로 막힌다.
- [ ] 개발에서 받은 토큰은 운영에서, 운영 토큰은 개발에서 거부된다.
- [ ] 수정 제안 → 미리보기 → 적용 한 번을 실행하고 `McpAuditLog`에 기록이 남는다.
- [ ] 로그인 취소 후 최대 305초 안에 접근이 막힌다.
- [ ] 새 기기 로그인(이메일 인증 코드)과 비밀번호 변경(재인증)이 정상이다 (Clerk 업데이트 적용 후 확인).

### 3. 켜기 전에 정할 것

- [x] 요청 횟수 제한: 시범 단계(관리자 몇 명, 홈 배너만 수정)에서는 필요하지 않다고 판단했다. 인증 없이는 모든 경로가 막히고, 토큰은 5분, 수정은 미리보기를 거친 한 건씩이며 감사 기록이 남고 Vercel 방화벽이 앞단에 있다.
- [ ] 관리자가 늘거나 강의·가격 같은 데이터로 기능을 넓히기 전에 Vercel 방화벽 규칙으로 `/api/mcp/*`에 IP별 분당 요청 수 제한을 추가한다 (코드 변경 없이 대시보드에서 가능).
- [ ] 같은 Clerk 발급자를 쓰는 다른 서비스가 이 client ID와 권한 범위를 허용하지 않는지 조사한다 (설계 문서의 켜기 전 조사 항목).

## 참고

- 환경변수 6개: `MCP_OAUTH_CLIENT_ID`, `MCP_API_JWT_ISSUER`, `MCP_API_JWT_AUDIENCE`, `MCP_API_JWT_KEY_ID`, `MCP_API_JWT_PRIVATE_KEY`, `MCP_API_JWT_PUBLIC_KEY`. 하나라도 비면 `/api/mcp`가 503으로 실패한다. 개발·운영의 발급자, 대상, 키는 서로 달라야 한다.
- 변수 값을 바꾼 뒤에는 재배포해야 반영된다.
- 키 교체: `MCP_API_JWT_KEY_ID`와 두 키를 함께 바꾸고 재배포한다. 발급된 API 토큰은 무효가 되고, MCP는 401을 받으면 Clerk 토큰으로 다시 교환한다.
- Clerk 작업 방법: 권한 범위 생성은 대시보드(OAuth applications → Scopes)에서만 가능하고, OAuth 앱 생성과 수정은 `clerk api /oauth_applications ... --instance <운영 인스턴스 ID>`로 가능하다. 이 CLI는 `--instance prod`가 아니라 인스턴스 ID로 지정해야 운영에 접근한다. 운영 인스턴스 ID는 `clerk apps list`에서 확인한다.
- 리디렉션 주소가 `127.0.0.1`인 이유: 로그인을 마친 관리자 본인의 브라우저가 그 컴퓨터에서 실행 중인 MCP 프로그램으로 돌아오는 방식이다(RFC 8252). 운영에서도 그대로 동작한다. 포트 `53134`가 이미 쓰이면 로그인이 실패한다.
