# 어드민 로컬 DB MCP POC 결정 기록

- 상태: 아키텍처 방향 합의, 구현 전
- 기록일: 2026-11-01
- 프로젝트: `pacemaker-video`
- 목적: 로컬 개발 DB의 제한된 콘텐츠 데이터를 MCP로 관리하는 POC의 의사결정과 확인 근거를 기록한다.

## 목표

관리자가 로컬 MCP를 통해 Pacemaker 콘텐츠의 일부를 안전하게 조회·수정할 수 있는지 검증한다. MCP는 DB에 직접 연결하지 않고 Pacemaker API를 호출한다. 개발 단계에서는 로컬 API와 로컬 DB를 사용하고, 향후 동일 MCP를 프로덕션 API에 연결해 테스트할 수 있도록 구성한다. DB를 외부에 직접 노출하거나 MCP 서버를 중앙 배포하는 방식은 이번 방향이 아니다.

## 의사결정 기록

### 1. 먼저 DB와 테이블 구성을 확인한다

**결정:** 구현에 앞서 현재 프로젝트의 로컬 DB 종류, 실제 테이블, 후보 테이블을 확인한다.

**이유:** MCP가 연결할 대상과 수정 범위를 코드의 가정만으로 정하지 않고, 개발 환경의 실제 구성을 기준으로 삼기 위해서다.

### 2. 대상 DB는 Pacemaker 프로젝트 로컬 PostgreSQL이다

**확인 근거:**

- Prisma datasource는 PostgreSQL이다 (`prisma/schema.prisma`).
- `docker-compose.yml`은 `pacemaker-dev-postgres` 컨테이너를 정의한다. 호스트 포트 `5433`을 컨테이너의 `5432`로 연결하고, `web` 데이터베이스를 사용한다.
- `.env`와 `.env.local`의 `DATABASE_URL`, `DIRECT_URL`은 `localhost:5433/web`을 가리킨다. 비밀 값은 이 문서에 기록하지 않는다.
- 처음 실행한 `supabase status`는 `supabase_db_pacemaker-video`를 찾지 못했지만, 이는 앱 DB가 없다는 뜻이 아니었다. 별도로 실행 중인 `pacemaker-dev-postgres` 컨테이너를 확인했고, 그 컨테이너에 직접 읽기 전용 스키마 조회를 수행했다.
- 별도의 Supabase 개발 스택도 Docker에 떠 있었지만, 이 프로젝트의 앱 연결 설정은 `pacemaker-dev-postgres`를 가리킨다.

**실제 테이블 확인:** `web` DB의 `public` 스키마에서 20개 테이블을 확인했다.

`Cart`, `Course`, `Ebook`, `Favorite`, `Image`, `Instructor`, `MainVisual`, `Order`, `OrderItem`, `Review`, `Section`, `User`, `UserRole`, `UserWorkshop`, `Video`, `WatchedVideo`, `Workshop`, `WorkshopInstructor`, `_CourseToInstructor`, `_prisma_migrations`.

### 3. MCP와 DB 사이에는 Pacemaker API를 둔다

**결정:** MCP 서버는 PostgreSQL에 직접 연결하지 않고, Pacemaker API를 호출한다.

**이유:** 프로덕션 검증 때 MCP는 관리자의 컴퓨터에서 로컬 실행할 수 있고, API가 인증·관리자 권한·입력 검증을 담당한다. DB에 외부 접속을 열거나 DB 자격 증명을 각 사용자 컴퓨터에 배포할 필요가 없다. 로컬 개발 시에는 같은 흐름을 로컬 API와 로컬 DB에 연결해 검증한다.

**환경별 연결:**

- 개발: 로컬 MCP → 로컬 Pacemaker API → `pacemaker-dev-postgres` (`web`)
- 프로덕션 검증: 로컬 MCP → 인증된 Pacemaker 프로덕션 API → 프로덕션 DB

MCP 로컬 실행 자체는 Claude Desktop 개인 버전에서 사용할 수 있으며, 이 방향에서는 별도의 중앙 MCP 서버를 전제로 하지 않는다. Claude 플랜과 별개로, 프로덕션 API에는 사용자별 로그인과 관리자 권한 검사가 필요하다.

**보안 경계:** 권한 판정, 허용 작업과 필드 검증, 최종 데이터 변경은 API 서버가 담당한다. MCP에는 DB 접속 비밀을 두지 않는다. API는 임의 SQL이나 임의 URL 요청을 제공하지 않고, 목적별 제한된 엔드포인트를 제공한다.

### 4. POC 대상은 `MainVisual`이다

**결정:** 첫 MCP 데이터 대상으로 `public.MainVisual`을 선택한다.

**이유:** 메인 페이지 시각 콘텐츠 테이블이라 콘텐츠 관리 흐름을 시험할 수 있고, 사용자 개인정보나 주문·결제 레코드보다 범위와 위험을 작게 유지하기 쉽다.

**로컬 DB에서 확인한 구성:**

| 컬럼          | DB 타입                       | NULL 허용 | 기본값              |
| ------------- | ----------------------------- | --------: | ------------------- |
| `id`          | `uuid`                        |    아니요 | `gen_random_uuid()` |
| `title`       | `text`                        |    아니요 | 없음                |
| `description` | `text`                        |        예 | 없음                |
| `isPublic`    | `boolean`                     |    아니요 | `false`             |
| `startDate`   | `timestamp without time zone` |        예 | 없음                |
| `endDate`     | `timestamp without time zone` |        예 | 없음                |
| `startTime`   | `text`                        |        예 | 없음                |
| `endTime`     | `text`                        |        예 | 없음                |
| `thumbnail`   | `text`                        |        예 | 없음                |
| `link`        | `text`                        |        예 | 없음                |
| `linkName`    | `text`                        |        예 | 없음                |
| `orderIndex`  | `integer`                     |    아니요 | `0`                 |
| `createdAt`   | `timestamp without time zone` |    아니요 | `CURRENT_TIMESTAMP` |
| `updatedAt`   | `timestamp without time zone` |    아니요 | 없음                |

Prisma 모델 정의와 실제 컬럼은 `prisma/schema.prisma` 및 로컬 DB를 함께 기준으로 삼는다. `supabase/schema.sql`에는 현재 Prisma 모델과 이름·구조가 다른 구버전 흔적이 있어 현재 앱 DB의 기준으로 사용하지 않는다.

### 5. 첫 수정 범위는 작게 시작한다

**제안된 시작 필드:** `title`, `description`, `isPublic`, `orderIndex`.

**제안된 보호:** `id`는 식별자로 유지하며 수정하지 않는다. 우선 삭제 기능은 제외한다.

`isPublic` 변경은 실제 콘텐츠 공개 여부를 바꿀 수 있으므로, MCP 수정 범위에 포함하기 전에 POC가 즉시 반영을 허용할지 또는 별도 승인 단계를 둘지 결정해야 한다. 이 대화에서는 수정 대상으로 고려했지만, 승인·미리보기 동작은 아직 확정하지 않았다.

## 코드 조사 결과: 기존 API와 관리자 인증

조사일: 2026-11-01

### 기존 `MainVisual` API

- `GET /api/main-visual`은 모든 메인 비주얼을 `orderIndex` 오름차순으로 반환한다. **현재 인증 검사가 없다.** 응답은 모델 전체를 반환한다.
- `GET /api/main-visual/:id`도 단건을 반환하며 **현재 인증 검사가 없다.**
- `POST /api/main-visual`, `PUT /api/main-visual/:id`, `DELETE /api/main-visual/:id`, `PATCH /api/main-visual/:id/status`, `PATCH /api/main-visual/reorder`는 `requireAdminUser()`를 호출한다.
- 생성·수정 라우트는 multipart/form-data와 이미지 업로드 처리를 포함한다. 이는 MCP용 최소 JSON 콘텐츠 수정 API 계약으로 바로 쓰기에는 맞지 않는다.
- 수정 라우트는 성공 시 `/admin/main-visual` 및 `/` 경로를 재검증한다.

관련 파일: `src/app/api/main-visual/route.ts`, `src/app/api/main-visual/[id]/route.ts`, `src/app/api/main-visual/[id]/status/route.ts`, `src/app/api/main-visual/reorder/route.ts`.

### 현재 관리자 권한 검사

- `src/lib/admin-auth.ts`의 `requireAdminUser()`는 Clerk 서버 `auth()`에서 세션의 `userId`를 얻는다.
- `getAdminAccessForClerkUserId()`는 해당 Clerk ID로 Prisma `User`를 조회하고 `roleId === 'ADMIN'`인지 확인한다. 로그인되지 않았으면 401, 관리자가 아니면 403이다.
- `/admin` 레이아웃도 같은 검사를 사용한다. 기존 API 인증은 브라우저의 Clerk 세션 컨텍스트를 전제로 하므로, MCP 프로세스의 별도 호출이 이 검사를 자동으로 통과한다고 볼 수 없다.
- 기존 코드 조사에서 MCP용 Bearer 토큰 검증 또는 전용 MCP 인증 경로는 찾지 못했다.

### 다음 설계 결정

기존 GET은 공개·비인증 경로이고 전체 모델을 반환하므로, 프로덕션 MCP의 관리자 전용 API로 그대로 사용하지 않는다. 우선 로컬 읽기 검증에 재사용할 수 있는지 확인하되, 권장안은 **최소 필드만 반환하는 MCP 전용 조회 API**를 만들고, 개발 API URL과 프로덕션 API URL 양쪽에서 동일한 인증 계약을 적용하는 것이다. 이때 사용자별 인증 토큰을 검증한 뒤 서버에서 Clerk 사용자와 `ADMIN` 역할을 확인해야 한다. 토큰 발급·갱신·폐기 방식은 아직 결정되지 않았다.

## 코드 조사 결과: Clerk OAuth 구현 가능성 검증

검증일: 2026-11-01. 개발 Clerk 인스턴스의 OAuth 메타데이터와 앱 목록을 읽고, PACE-333 전용 임시 OAuth 앱을 만들었다. 앱은 public, consent 활성화, PKCE required, `openid offline_access` 범위, 고정 loopback callback으로 설정했다. 검증 후 이 임시 앱을 삭제한다. 키와 토큰은 문서에 기록하지 않는다.

### 1. 토큰 수명, 갱신, 회수

- 프로젝트가 연결된 Clerk 인스턴스는 development 환경이다. 첫 PKCE 시도는 verifier 불일치로 실패했지만, 새 state/verifier로 재시도한 뒤 authorization code 교환에 성공했다. 액세스 토큰은 opaque Bearer 토큰이며 86,400초 만료, refresh token이 발급됐다. 실제 토큰 값은 기록하지 않았다.
- Clerk 문서는 OAuth access token 만료를 1일, refresh token 만료를 없음으로 설명한다. 또한 opaque access token은 즉시 검증·폐기가 가능하다고 하고, JWT access token은 발급 후 즉시 폐기할 수 없다고 명시한다.
- 실제 refresh 요청에서 refresh token이 교체됐고, 이전 refresh token 재사용은 `400 invalid_grant`로 거부됐다. 참고로 MCP 표준 OAuth는 HTTP transport용이고 stdio transport에는 그대로 적용하지 않는다고 명시하므로, 이 POC에서는 로컬 MCP 프로세스가 Pacemaker REST API의 OAuth client라는 점을 분리해 다룬다.
- Clerk SDK에는 OAuth grant의 access/refresh token을 폐기하는 `oauthApplications.revokeToken()` API가 있다. 단, 즉시 access token 폐기는 opaque access token에 한정된다.

### 2. OAuth 토큰 검증과 audience

- 설치된 `@clerk/nextjs`는 6.39.5, `@clerk/backend`는 3.20.1이다. 타입 정의에서 `auth({ acceptsToken: 'oauth_token' })` 지원과 OAuth 토큰 사용자 ID·client ID·scope 정보를 확인했다.
- 설치된 Clerk Backend SDK는 `verifyToken`/`authenticateRequest`에 audience 검증 옵션을 제공하고, OAuth access token 검증 API는 예상 audience를 지정할 수 있다. 앱 전용 인증 함수에서 이 옵션을 명시하는 구현은 가능하다.
- 공개 Clerk OAuth 메타데이터는 authorization code, refresh token, device code grant와 PKCE `S256`을 광고한다. 현재 공개된 built-in scope 목록은 `openid`, `profile`뿐이고, OAuth client 등록 endpoint는 광고하지 않는다. Clerk 문서상 사용자 정의 scope와 수동 등록 OAuth 앱은 지원된다.
- 새 임시 앱으로 일치하는 PKCE state/verifier를 사용해 두 차례 검증했다. authorization URL에 `http://localhost:3001/api/mcp`를 `resource`로 전달했지만, Clerk SDK의 opaque-token introspection은 유효 토큰, `audience: []`, 요청한 OAuth client ID 일치를 반환했다. 재검증에서 Clerk 공식 `/oauth_applications/access_tokens/verify` endpoint도 HTTP 200과 일치하는 client ID를 반환했고, `aud`/`audience` 필드는 없었다. 예상 API audience를 지정한 SDK 검증은 거부됐다. 따라서 이 설정에서 Clerk가 resource URL을 audience로 발급한다고 볼 수 없다. audience 검사 없이 진행하려면 예상 client ID allowlist, scope allowlist, 사용자 `ADMIN` role 확인을 모두 적용하고, Clerk OAuth 토큰의 client ID 검사가 다른 Pacemaker API에서 재사용을 막는지 검증해야 한다. 이 통제의 충분성이 확인되기 전까지 MCP API 쓰기 구현은 보류한다.

### 2.1 Client ID + scope + ADMIN 역할 조합 검토

**판정: 특정 MCP 전용 API의 애플리케이션 권한 경계로는 조건부 사용 가능하지만, audience binding과 동등한 보장은 아니다. 프로덕션 쓰기 인증의 최종 승인으로 간주하지 않는다.**

- Clerk Next.js SDK는 `auth({ acceptsToken: 'oauth_token' })`로 OAuth 토큰만 받으며, 유효한 요청에서 `userId`, `clientId`, `scopes`를 제공한다. `clientId`는 정해진 MCP OAuth 앱 값과 정확히 비교하고, scope는 요청별 허용 목록으로 검사하며, `userId`는 DB의 현재 Clerk 연결 사용자와 `roleId === 'ADMIN'`을 매 요청 대조하는 조합이 가능하다.
- 기존 `src/lib/admin-auth.ts`의 `requireAdminUser()`는 인자 없이 `auth()`를 호출하므로 기본 session token 경로다. 현재는 OAuth access token을 받아들이지 않는다. 이를 전역 변경해 OAuth를 허용하면 이 helper를 재사용하는 관리자 API 여러 개가 OAuth 클라이언트에도 노출될 수 있다. 기존 helper는 유지하고, MCP 전용 API route와 MCP 전용 auth helper에서 OAuth만 허용해야 한다.
- 현재 임시 OAuth 앱은 `openid offline_access`만 요청했다. 이 scope들은 API의 MainVisual 읽기·쓰기 권한을 나타내지 않는다. Clerk custom scope를 만들어 MCP OAuth 앱에 명시적으로 할당하고, 예를 들어 `mcp:main-visual:read`와 `mcp:main-visual:write`를 API 작업별로 검사해야 한다. 테스트에서 custom scope 발급·검증은 아직 하지 않았다.
- client ID allowlist는 허가한 OAuth 앱에서 발급된 토큰만 받게 하는 애플리케이션 정책이고, scope는 해당 앱 토큰에 허가된 작업을 나누며, DB ADMIN 확인은 사용자 권한을 현재 상태로 판단한다. 하지만 client ID는 토큰을 발급한 클라이언트를 식별할 뿐 대상 리소스 API를 식별하지 않는다. 다른 리소스 서버가 같은 Clerk issuer의 토큰을 받아들이고 같은 client/scope 정책을 쓰면 토큰 재사용을 막지 못한다. 이는 audience 기반 리소스 격리의 대체가 아니다.
- 조건부 진행 요건: MCP 전용 경로에서만 OAuth 토큰을 수락하고, 예상 issuer/environment, client ID, route별 custom scope, DB상 ADMIN을 모두 fail-closed로 검사한다. 읽기·쓰기 scope와 API 작업을 일대일로 연결하고, 기존 관리자 route와 MCP route를 분리한다. 쓰기에는 필드 allowlist·입력 검증·승인 또는 변경 요약·감사 로그·rate limit을 별도로 적용한다. opaque token을 유지해 revoke 가능성을 보존하고, 환경별 issuer와 허용 client ID를 분리한다.
- 프로덕션 쓰기 전에 남은 확인: Clerk custom scope가 실제로 OAuth access token에 발급되고 Next.js `auth()` 결과에서 기대한 값으로 전달되는지, 이 MCP 전용 검사에서 잘못된 client/scope/비관리자가 각각 차단되는지 통합 검증한다. 그리고 Pacemaker와 동일한 Clerk issuer를 쓰는 다른 API/서비스가 이 client ID와 scope를 허용하는지 조사한다. 외부 또는 별도 리소스가 허용할 수 있고 API audience가 계속 비어 있다면, 이 조합만으로 production boundary를 승인하지 말고 audience 지원 발급자나 별도 인증 구성을 선택한다.
- 기준: OAuth bearer token은 다른 리소스에 token redirect/replay될 수 있으므로 RFC 6750은 의도된 audience와 scope 제한을 권고하고, RFC 8707은 `resource` 기반 audience 제한을 설명한다. Clerk 문서는 OAuth token의 route 검증과 granted scope 확인을 제공하지만, 이번 개발 인스턴스 검증에서 요청한 `resource` audience는 반환되지 않았다.

### 2.2 API audience를 제공하는 현실적 대안

1. **Clerk OAuth access token을 JWT 형식으로 발급 — 이번 검증에서 audience 대안이 아님을 확인.** 개발 인스턴스의 전체 OAuth access-token 형식 설정을 검증 중에만 JWT로 바꾸고 `resource=http://localhost:3001/api/mcp`를 보내 발급했다. 토큰은 JWT였고 issuer·subject·client ID·scope·expiry가 있었지만 `aud`는 빈 값이었다. Clerk SDK의 예상 API audience 검증도 거부됐다. 따라서 JWT 형식만 바꿔서는 API audience가 생기지 않는다. 토큰 만료는 약 24시간이었다. grant/app 삭제 및 설정 원복은 완료했으나 JWT는 즉시 폐기되지 않을 수 있으므로, revoke 성공을 토큰의 즉시 무효화로 간주하지 않는다.
2. **Pacemaker API의 토큰 교환 endpoint가 짧은 수명의 자체 API JWT 발급 — Clerk 유지 시 가장 현실적인 대안.** MCP가 Clerk OAuth token을 MCP 전용 교환 endpoint에 제시하면, 해당 endpoint가 Clerk 유효성, 정확한 MCP client ID, 교환 전용 custom scope, 현재 DB `ADMIN` 역할을 검사하고 `iss`, `aud=Pacemaker MCP API`, `sub`, 세분화 scope, 짧은 `exp`를 포함한 Pacemaker 서명 JWT를 발급한다. 데이터 API는 오직 이 자체 JWT만 받아 정확한 audience를 검증한다. Clerk token은 교환 endpoint에만 허용하고 데이터 route에는 허용하지 않는다. API signing key를 서버의 secret manager에 보관하고, 짧은 만료로 폐기를 제한한다. 즉시 차단이 반드시 필요하면 `jti` denylist 또는 서버 측 opaque grant를 추가한다. 이 방식은 자체 issuer/key 관리와 token exchange endpoint를 구현해야 하지만, 별도 외부 인증 공급자 없이 기존 Clerk 사용자와 DB 역할을 유지한다.
3. **Auth0 등 audience가 명시적인 관리형 OAuth authorization server로 MCP client 및 API 등록.** API를 resource server로 등록해 고정 API identifier를 발급하고, MCP authorization 요청에 해당 `audience`를 넣어 토큰을 요청한다. Auth0 문서는 audience가 API Identifier와 일치해야 하며 API가 그 `aud`와 scope를 검증하는 흐름을 안내한다. 다만 Pacemaker 관리자 계정/역할을 현재 Clerk DB 사용자와 안전하게 연결해야 하므로, 사용자 연동·역할 동기화 또는 별도 관리자 계정 관리가 추가된다. 앱 전체의 인증 공급자 변경 계획이 없다면 2번보다 범위가 크다.
4. **Keycloak 등 자체 호스팅 authorization server.** API audience와 OAuth resource를 직접 구성할 수 있지만, 별도 서비스 배포·업그레이드·키와 계정 관리가 생긴다. Keycloak의 MCP 가이드는 Resource Indicators 지원을 experimental feature로 표기하므로 현재 프로덕션 단순 대안으로 우선 권하지 않는다.

**권장 순서:** 1번은 개발 인스턴스에서 테스트 완료됐고 기대 audience를 발급하지 않았다. 따라서 Clerk OAuth token을 직접 API bearer로 쓰지 않는다. 다음은 2번(Pacemaker API 자체 짧은 수명 audience JWT 발급)을 검토·구현 후보로 삼는다. 3번은 인증 플랫폼 자체를 이전하려는 별도 요구가 생길 때 검토한다. Clerk JWT template로 만든 일반 session custom JWT에 `aud`를 넣는 기능도 문서화되어 있지만 이는 OAuth access-token 설정과 별개이며, Clerk session에 로그인한 클라이언트용이라 MCP OAuth token의 직접 대체로 간주하지 않는다. OIDC ID token의 `aud`는 로그인 OAuth client를 가리키므로 API access token으로 대신 사용하지 않는다.

### 2.3 Pacemaker API 자체 audience JWT 교환 후보 검증

검토일: 2026-11-01. 데이터 변경 없이 프로젝트 구조와 로컬 서명·검증 가능성을 확인했다.

- 기존 Clerk SDK 버전은 `auth({ acceptsToken: 'oauth_token' })`를 지원하고, machine auth object에 `userId`, `clientId`, `scopes`를 제공한다. Clerk middleware는 이미 API route에 적용되어 있다. Clerk 문서도 OAuth token은 기본값에서 허용되지 않으므로 `acceptsToken`을 명시하라고 한다.
- 기존 `src/lib/admin-auth.ts`의 `getAdminAccessForClerkUserId()`는 Clerk 사용자 ID를 Pacemaker `User.clerkId`와 대조하고 DB의 현재 `roleId === 'ADMIN'`을 확인한다. 이 DB 권한 검사는 교환 때뿐 아니라 MCP 데이터 route마다 호출할 수 있다. 기존 `requireAdminUser()`를 OAuth 허용으로 전역 변경하지 않고 MCP 전용 helper를 만들어야 한다.
- 저장소에 직접 설치된 JOSE/JWT 라이브러리와 API signing key 설정은 아직 없다. Node 내장 `crypto`를 사용한 임시 RS256 실험에서 `typ: at+jwt`, issuer, subject, 정확한 `aud`, scope, 만료 claim을 가진 JWT 서명/검증이 가능했고, 잘못된 audience·변조된 서명·만료 토큰을 거부했다. 테스트 키는 메모리에서만 생성하고 폐기했다. 운영 구현에서는 직접 암호 코드를 만들지 말고 JOSE 라이브러리를 직접 의존성으로 추가해 알고리즘 allowlist와 claim 검증을 수행한다.
- 제안 흐름: MCP는 Clerk OAuth access token으로 MCP 전용 교환 endpoint를 호출한다. endpoint는 Clerk 토큰 유효성, 정확한 허용 client ID, `mcp:token:exchange` 같은 교환 scope, DB `ADMIN` 역할을 fail-closed로 확인한 뒤 Pacemaker 서명 JWT를 발급한다. 결과 API는 자체 JWT만 받고 issuer·`typ=at+jwt`·정확한 환경별 audience·만료·요청별 scope를 검증한다. 데이터 작업 route는 DB `ADMIN`을 다시 조회해 관리자 강등이 자체 JWT 만료 전에도 적용되게 한다. 자체 JWT에는 역할을 권한의 근거로 담지 않는다.
- API JWT에는 5분 내외의 짧은 만료, `iss`, `sub`, 환경별 단일 `aud`, `iat`, `exp`, `jti`, scope, client ID를 둔다. 서명 개인키는 API 서버/secret manager에만 두고 MCP에 전달하지 않는다. 사용자별 취소가 꼭 필요하면 서버 측 `jti` denylist/opaque grant를 추가한다. 그렇지 않으면 revoke 후 남는 접근의 최대 시간은 자체 JWT TTL이다.
- PACE-333 개발용 OAuth 앱을 만들고 public client, consent, PKCE required로 설정했다. Clerk 개발 인스턴스에 `mcp:main-visual:read` custom scope를 만들고 이 앱에 할당했다. production 인스턴스는 변경하지 않았다.
- 최소 POC 코드를 추가했다. `POST /api/mcp/token`은 OAuth token만 수락하고 client ID, `mcp:main-visual:read` scope, 현재 DB ADMIN을 확인한 뒤 5분 RS256 JWT를 발급한다. `GET /api/mcp/main-visual`은 자체 JWT의 서명/issuer/audience/type/key ID/client ID/scope/만료를 확인하고 DB ADMIN을 다시 검사한 뒤 허용 필드 4개만 반환한다. 기존 관리자 API helper는 변경하지 않았다.
- `jose`를 직접 dependency로 추가했다. 로컬 개인키/공개키는 무작위 생성해 gitignore된 `.env.local`에만 두었고, `.env.local.example`에는 비밀값을 비워 둔 설정 키만 추가했다. production signing key는 API 서버 secret manager에서 설정해야 한다.
- 실제 PKCE 동의와 통합 경로를 확인했다. Clerk는 `openid offline_access mcp:main-visual:read` scope의 opaque access token을 발급했고, `POST /api/mcp/token`은 200과 300초 만료의 Pacemaker Bearer JWT를 반환했다. 이를 사용한 `GET /api/mcp/main-visual`은 200으로 MainVisual 3건을 반환했고, 각 행의 필드는 `id`, `title`, `isPublic`, `orderIndex`뿐이었다. OAuth 토큰/JWT/인가 코드는 출력하거나 문서에 저장하지 않았다.
- 별도의 local API/DB 검사에서 wrong audience는 401, non-ADMIN subject는 403이었다. DB 변경은 없었다. Vitest 17개, TypeScript typecheck, 변경 파일 ESLint도 통과했다.
- 후속 negative-path 검사에서 로컬 API에 wrong client claim, 누락 scope, wrong audience, 만료 JWT, 변조 서명, 같은 `kid`지만 다른 서명키로 만든 JWT를 직접 보냈고 모두 401이었다. 전체 Vitest 605개 통과(8개 skip), typecheck, production build, lint가 통과했다. Clerk 개발 인스턴스에서 MainVisual scope가 빠진 POC 토큰과 별도 임시 OAuth client token을 교환 endpoint에 각각 보내 403을 확인했다. 두 테스트 grant를 revoke했고 임시 client 앱도 삭제했다.
- 로컬 `.env.local`은 gitignore 대상이며, tracked source/docs와 `.env.local.example`에서 개인키 PEM을 찾지 못했다. example은 development issuer/audience 설정만 제시한다. 진단 과정에서 출력된 로컬 개발키는 새 무작위 RS256 키 쌍으로 교체하고 짝 일치를 확인했다. production issuer/audience/signing key 설정이나 production key pair는 이 저장소에 없고 Vercel CLI도 사용할 수 없어 실제 환경 간 키 분리는 아직 실증할 수 없다. 배포 시 개발·production에 별도 issuer/audience와 별도 RS256 키 쌍을 넣고 교차환경 토큰 거부를 확인해야 한다.
- 표준에 맞춘 JWT access token 검증은 `typ=at+jwt` 확인과 issuer·audience·expiry 등의 필수 검사를 요구한다. 자체 교환을 RFC 9068 완전 준수라고 주장하려면 해당 프로파일과 metadata/JWKS 요건까지 구현해야 한다. 그렇지 않으면 이 토큰을 Pacemaker 내부 전용 access token으로 범위를 제한하고, 같은 API 경계에서만 수락한다.

**판정:** 최소 POC의 positive Clerk → Pacemaker token exchange → local read API 흐름과 잘못된 audience/non-ADMIN 거부를 확인했다. 자체 API token의 client/scope/audience/expiry/signature/key 거부도 로컬 HTTP 경계에서 확인했다. production-ready 승인은 아니다. 검증 시 허용하는 5초 clock tolerance 때문에 Clerk grant revoke 후 자체 JWT의 이론상 최대 잔여 허용 시간은 305초다. production 배포 환경의 별도 키/issuer 설정과 교차환경 거부, revoke 후 자체 JWT의 실제 잔여 접근 확인이 남았다.

### 3. 로컬 저장과 환경 구분

- 개발 구성에서 Clerk의 development 인스턴스가 사용되고 있다. 프로덕션 인스턴스 연결은 별도로 구성해야 하며, 개발·프로덕션 issuer와 API origin을 명시적으로 분리할 수 있다.
- 이 저장소에는 MCP 서버와 OAuth token을 Keychain에 저장하는 MCP client가 아직 없다. API 측 local OAuth client ID/audience/issuer 및 JWT 키 설정 예시는 추가했고 실제 개발 전용 설정은 ignored `.env.local`에 넣었다. macOS Keychain 더미 값 저장·복구·삭제 검증은 완료했지만 실제 OAuth 토큰은 저장하지 않았다.
- MCP API origin은 고정된 개발/프로덕션 프로필에서만 선택하도록 구현한다. 임의 URL, URL query token, 리다이렉트 대상에 Authorization 헤더 전달을 허용하지 않는다.

### 판단

**Clerk OAuth 토큰을 직접 API bearer로 쓰지 않고 Pacemaker API가 자체 audience JWT를 발급하는 최소 POC를 구현했다.** 개발 Clerk custom scope를 이용한 실제 token exchange/read API 흐름도 통과했다. 프로덕션 적용 전에는 환경별 키·issuer 분리와 revoke 후 잔여 접근 시간을 실제 배포 환경에서 확인해야 한다.

**다음 안전한 검증:** production 환경의 별도 키/issuer 설정에 접근할 수 있을 때 개발 토큰의 production API 거부와 production 토큰의 개발 API 거부를 확인한다. 비관리자(403), Clerk client/scope 불일치(403), 잘못된 audience·client claim/scope/만료/서명/키(401)는 local API 경계에서 확인했다. production 설정은 별도 검증 전까지 변경하지 않는다.

## 현재 로컬 데이터 스냅샷

확인 시점에 `MainVisual` 행은 3개였다. 모두 `isPublic = true`이고 `orderIndex`는 각각 0, 1, 2였다.

| `orderIndex` | `title`                                                                                               |
| -----------: | ----------------------------------------------------------------------------------------------------- |
|            0 | Build the skills to launch your career abroad. Experience, resumes, and interviews, all in one place. |
|            1 | Ready to take the next step?                                                                          |
|            2 | Your future career starts here.                                                                       |

이 데이터는 확인 시점의 로컬 스냅샷이며 변경될 수 있다. 본 확인 과정에서는 DB에 쓰기 작업을 하지 않았다.

## 실행 계획

### 단계 1: API 경계와 인증 방식 조사 (완료)

- 기존 API를 조사했다. 기존 GET은 비인증이며 전체 모델을 반환하고, 쓰기 API는 Clerk 세션 기반 `requireAdminUser()`를 사용한다.
- MCP 전용 사용자별 토큰 검증 경로는 현재 찾지 못했다.
- 다음 설계 과제는 로컬과 프로덕션에 공통 적용할 MCP 인증 계약을 결정하는 것이다.
- 프로덕션 연결을 위해 사용자별 인증을 어떻게 재사용하거나 추가할지 설계한다. 프로덕션 API는 매 요청마다 사용자를 인증하고 관리자 권한을 검사해야 한다.
- API 기본 URL은 환경별 설정으로 주입한다. DB 연결 문자열은 MCP에 전달하지 않는다.

### 단계 2: 로컬 API 읽기 전용 경로 준비

- API에 `MainVisual` 목록 및 단건 조회를 위한 제한된 계약을 마련하거나 기존 엔드포인트를 검토 후 재사용한다.
- 반환 필드와 페이지 크기를 제한하고, 입력 스키마·권한 검사·이해하기 쉬운 오류를 적용한다.
- 로컬에서 API가 기존 `web` PostgreSQL을 읽는지 확인한다.

### 단계 3: 로컬 MCP 읽기 도구 구현

- 목적별 MCP 도구로 `list_main_visuals`, `get_main_visual`을 제공한다.
- MCP는 정해진 Pacemaker API만 호출하며 임의 URL·SQL 실행 기능은 제공하지 않는다.
- 로컬 API를 대상으로 목록과 단건 조회를 확인한다. 초기에는 쓰기 도구를 노출하지 않는다.

### 단계 4: 변경 제안과 승인 설계

- 수정 허용 필드를 `title`, `description`, `isPublic`, `orderIndex`로 시작할지 확정한다. `id`는 변경 불가, 삭제는 제외한다.
- `isPublic` 변경의 영향과 승인 필요성을 고려해, 변경 전후 값을 보여주는 미리보기와 명시적 승인 흐름을 정의한다.
- stale update 방지(버전 또는 기존 값 비교), 중복 요청 방지, 변경 감사 로그, 오류·복구 절차를 설계한다.

### 단계 5: 승인된 로컬 수정 구현

- API 서버에서 필드 allowlist, 타입·길이 검증, 관리자 권한, 승인 검증을 강제한다.
- MCP에는 변경안 제시와 확정 적용을 별도 도구로 제공한다.
- 로컬 DB에서 제한된 변경이 의도대로 저장되고 감사 가능한지 확인한다.

### 단계 6: 프로덕션 API 연결 검증

- 동일 MCP를 프로덕션 API URL로 설정해 읽기 전용부터 검증한다.
- 사용자별 로그인·관리자 권한·토큰 만료 및 폐기·rate limit·감사 로그를 확인한다.
- 쓰기는 테스트 데이터 또는 승인된 저위험 항목에 한해 마지막에 검증한다. 프로덕션 DB를 MCP 컴퓨터에서 직접 열지 않는다.

## 다음 작업

1. **로컬 MCP 클라이언트와 읽기 도구 구현:** 고정된 local API origin만 호출하고 Clerk OAuth PKCE 로그인 → `POST /api/mcp/token` 교환 → 5분 Pacemaker JWT 갱신을 연결한다. 토큰은 Keychain에 보관하고 `list_main_visuals`, `get_main_visual`만 먼저 노출한다.
2. **읽기 전용 MCP 흐름 검증:** Claude Desktop 등 실제 MCP host에서 로그인·토큰 갱신·MainVisual 조회를 확인한다. 비관리자, 취소/만료된 Clerk grant, API JWT 만료 상황에서 거부와 오류 복구도 점검한다.
3. **쓰기 권한 계약 설계:** 허용 필드, 길이/타입 검증, 동시 수정 방지, 미리보기와 사용자 확인, 감사 로그, 복구 기준을 정한다. `mcp:main-visual:write`를 read scope와 분리한다.
4. **승인된 로컬 쓰기 도구 구현:** API에서 관리자와 입력을 검증하고, MCP에는 제안과 명시적 적용을 분리한다. 로컬 DB에서 저장 결과와 audit log를 확인하고 테스트 데이터를 정리한다.
5. **Production 적용 검증:** production Clerk 앱/client ID와 custom scopes, 서버 전용 signing key, issuer/audience를 별도로 설정한다. production에서 read-only 로그인·권한·환경 간 토큰 거부·취소 후 잔여 수명(최대 305초)·rate limit·감사 로그를 검증한 다음 기능을 활성화한다. production DB 직접 연결은 사용하지 않는다.

## 현재 상태

로컬 PostgreSQL과 테이블 구조 확인, `MainVisual` 선정, API 경유 아키텍처 합의를 마쳤다. PACE-333 브랜치에 MCP 전용 token exchange/read API POC와 테스트를 커밋했고, Clerk 개발 인스턴스에서 성공 흐름과 client/scope 거부를 실제 검증했다. 자체 JWT의 audience·client·scope·만료·서명·키 거부, 비관리자 차단도 확인했다. DB 레코드는 수정하지 않았다. MCP 클라이언트 도구 구현과 production 전용 인증 설정 및 production 교차환경 검증은 남아 있다.

### 2026-11-08 main 반영 후 재검증

- 브랜치를 Clerk Core 3 업그레이드(`@clerk/nextjs` 7.9.23, `@clerk/backend` 3.26.5)가 포함된 main 위로 rebase했다. 충돌은 없었고 MCP 코드는 수정 없이 typecheck를 통과했다. `auth({ acceptsToken: 'oauth_token' })` 계약은 그대로 유효하다.
- 서명 변조 단위 테스트가 간헐적으로 실패했다. RS256 서명(256바이트)의 base64url 마지막 글자는 하위 4비트가 채움 비트라서, 마지막 글자만 바꾸면 디코딩 결과가 같아 서명이 유효하게 남는 경우가 있었다. 검증 코드 결함이 아니라 테스트 결함이므로 첫 글자를 변조하도록 고쳤고 20회 연속 통과했다.
- 전체 Vitest 372개 통과(4개 skip), typecheck, production build, lint를 통과했다.
- 로컬 dev 서버에서 HTTP 경계를 다시 확인했다. 교환 endpoint는 인증 없음·가짜 Clerk 토큰·자체 JWT 제시를 모두 401로 거부했다. 조회 endpoint는 정상 관리자 토큰에 200과 MainVisual 3건(허용 필드 4개)을 반환했고, 일반 사용자는 403, audience·만료·scope·client ID·`typ`·서명 변조·같은 `kid`의 다른 키는 모두 401이었다. 모든 응답은 `Cache-Control: no-store`였다. DB는 변경하지 않았다.
- 실제 Clerk PKCE 동의를 거친 성공 교환(200)은 Clerk 7 환경에서 다시 수행하지 않았다. 관리자 계정 로그인이 필요하므로 MCP 클라이언트 구현 단계에서 함께 확인한다.

### 2026-11-08 MCP 클라이언트 구현 전 결정

- **대상:** POC 범위는 `MainVisual`로 한정한다. 강의(`Course`)는 POC 대상에서 제외한다.
- **위치:** MCP 프로그램은 이 저장소 안의 별도 폴더에 자체 `package.json`을 두고, 웹앱 빌드와 분리한다.
- **지원 환경:** macOS와 Windows를 지원한다. Claude Desktop뿐 아니라 Codex 등 로컬(stdio) MCP를 실행하는 다른 호스트에서도 같은 프로그램을 쓴다. 토큰 저장은 호스트가 아니라 MCP 프로세스가 담당하므로 호스트별 차이는 실행 설정에만 있다.
- **토큰 저장(제안):** `@napi-rs/keyring`으로 OS 보안 저장소를 사용한다. macOS는 Keychain, Windows는 Credential Manager, Linux는 Secret Service다. `keytar`는 유지보수가 중단되어 사용하지 않는다. 저장 대상은 Clerk refresh token 하나뿐이며 Pacemaker JWT와 Clerk access token은 메모리에만 둔다. Windows Credential Manager의 값 크기 제한(2,560바이트)을 넘지 않도록 토큰 외 데이터를 함께 저장하지 않는다.
- **보안 저장소가 없을 때:** 평문 파일로 대체하지 않는다. 토큰을 메모리에만 두고 프로세스 시작마다 브라우저 로그인을 요구한다.
- **호스트별 별도 grant:** Clerk는 refresh 시 refresh token을 교체하고 이전 값 재사용을 거부한다. 여러 호스트가 같은 저장 항목을 공유하면 동시 갱신 시 한쪽이 `invalid_grant`로 실패할 수 있다. 저장 항목 이름에 호스트 식별자를 넣어 Claude Desktop, Codex 등이 각자 로그인하고 각자 refresh token을 갖게 한다.
- **로그인을 기다리지 않는 도구 응답:** MCP 호스트는 도구 응답을 보통 60초 안팎까지만 기다린다. 로그인이 필요하면 브라우저를 열고 즉시 "로그인 후 다시 요청" 안내를 반환하며, MCP 프로세스가 백그라운드에서 최대 5분간 콜백을 기다린다.

### 2026-11-08 읽기 전용 MCP 클라이언트 구현

- `mcp/` 폴더에 stdio MCP 서버를 추가했다. 도구는 `list_main_visuals`, `get_main_visual`, `sign_in`, `sign_out`이다. 사용법은 `mcp/README.md`에 있다.
- API에 `GET /api/mcp/main-visual/[id]`를 추가했다. 인증 후 UUID를 검증하고 `id`, `title`, `description`, `isPublic`, `orderIndex`만 반환한다. 목록 route와 함께 MCP 전용 인증 helper(`src/lib/mcp-request-auth.ts`)를 사용한다.
- 루트 `tsconfig.json`, Vitest, `.gitignore`에서 `mcp/`를 분리했다. `mcp/`는 자체 lockfile, TypeScript 빌드, Node 내장 테스트 실행기를 쓴다.
- 검증: 루트 Vitest 379개 통과(4개 skip), typecheck, build, lint 통과. `mcp/` typecheck, 단위 테스트 39개, build 통과.
- 로컬 dev 서버와 빌드된 MCP를 stdio로 연결해 확인했다. 도구 4개가 노출됐고, 잘못된 UUID는 입력 검증에서 거부됐다. 로그인 전 조회는 Clerk 개발 인스턴스의 PKCE(S256) 로그인 주소와 `openid offline_access mcp:main-visual:read` scope를 반환했고, Clerk는 이 주소를 sign-in 화면으로 302 리다이렉트했다. 콜백 서버는 위조 state를 400으로 거부했고, 두 번째 요청은 "진행 중" 안내를 반환했다. macOS Keychain에 더미 값 저장·조회·삭제를 확인했고 남은 항목은 없었다.
- 남은 확인: Claude Desktop·Codex 실제 등록, Windows에서 자격 증명 관리자 저장과 브라우저 열기.

### 2026-11-08 실제 관리자 로그인 확인

- 처음 로그인 시도는 Clerk가 `redirect_uri` 불일치로 거부했다. Clerk OAuth 앱(`PACE-333 Pacemaker MCP Local POC`)에는 이전 실험용 `http://localhost:8765/callback`만 등록돼 있었다.
- 사용자 승인 후 Clerk Backend API로 `http://127.0.0.1:53134/callback`을 추가했다. 기존 주소는 유지했다. 공개 클라이언트, PKCE 필수, scope(`openid offline_access mcp:main-visual:read`)는 그대로다. `localhost` 대신 `127.0.0.1`을 쓰는 이유는 RFC 8252 권고와 이름 해석 차이를 피하기 위해서다.
- 로컬 dev 서버(Clerk 7)와 빌드된 MCP를 stdio로 연결하고 관리자 계정으로 브라우저 로그인했다. 결과:
  - 로그인 → `/api/mcp/token` 교환 → 목록 조회 3건(`id,title,isPublic,orderIndex`) → 한 건 조회(`description` 추가, id 일치) 성공.
  - Keychain에 refresh token이 저장됐다(`development:login-check`).
  - MCP 프로세스를 새로 띄운 뒤 브라우저 없이 저장된 로그인만으로 같은 조회가 성공했다. refresh token 회전 후 재저장도 동작한다.
  - `sign_out`은 revoke 성공을 반환했고 Keychain 항목이 지워졌다.
- 이로써 Clerk 7 업그레이드 후 OAuth 토큰 교환 경로의 실제 동작도 확인됐다.

### 2026-11-08 개발자 테스트용 설치 단순화

- 배경: 개발자는 이미 각자 `npm run dev`와 시드된 로컬 DB(관리자·일반 사용자 계정 포함)를 쓰고 있다. 남은 설치 부담은 서버 `MCP_*` 설정 6개, 서명 키 생성, MCP 등록 시 Clerk 주소·client ID·host 이름 입력이었다.
- 서버: `src/lib/mcp-settings.ts`로 설정 읽기를 모았다. `NODE_ENV=development`에서 `MCP_*` 값이 비어 있으면 개발용 issuer/audience/kid와 개발 Clerk OAuth 앱의 공개 client ID를 쓴다. 키 쌍이 둘 다 없으면 서버 시작 후 메모리에 RS256 키 쌍을 만들고 `globalThis`에 두어 route 묶음들이 같은 키를 쓴다. 재시작하면 키가 바뀌고, MCP는 401을 받으면 Clerk 토큰으로 API 토큰을 다시 교환한다. 키 하나만 설정된 경우와 development 외 환경에서는 기본값을 쓰지 않고 기존처럼 설정 불완전으로 실패한다. 배포 환경은 모든 `MCP_*` 값을 명시해야 한다.
- MCP: development profile에서 Clerk 개발 인스턴스 주소와 MCP OAuth client ID를 기본값으로 넣었다. 둘 다 공개값이다. `PACEMAKER_MCP_HOST`가 없으면 MCP host가 연결 시 보내는 이름(`claude-code`, `codex-mcp-client` 등)으로 Keychain 항목을 나눈다. 그래서 Keychain 항목은 첫 사용 시점에 정한다.
- 결과: 개발자 설치는 `cd mcp && npm ci && npm run build`와 등록 한 줄(`claude mcp add pacemaker-admin -- node <절대 경로>/mcp/dist/index.js`)로 줄었다. 설정값은 모두 선택 사항이며 `mcp/README.md`에 정리했다.
- 확인: 서버 `MCP_*` 값을 모두 비우고 dev 서버를 띄운 뒤, MCP도 API 주소 외 설정 없이 실행했다. 토큰 교환 route는 503이 아니라 401을 반환해 개발 기본값이 쓰였음을 확인했다. 관리자 브라우저 로그인 → 목록 3건·한 건 조회 성공, 연결한 MCP host 이름으로 Keychain 항목 생성, 재실행 후 저장된 로그인으로 조회 성공, `sign_out` 후 revoke 성공과 Keychain 항목 삭제까지 확인했다. 루트 테스트 385개(4개 skip), typecheck, lint, build 통과. `mcp/` typecheck, 테스트 43개, build 통과.

### 2026-11-08 메인 배너 수정 기능 설계

#### 사용자 결정

- 첫 버전에서 바꿀 수 있는 필드는 `title`, `description`, `linkName`, `link`, `isPublic`이다. 한 배너 안에서 끝나는 변경만 다룬다. 순서(`orderIndex`), 노출 기간, 이미지, 추가, 삭제는 다음 버전으로 미룬다.
- 변경 기록은 DB의 새 테이블에 남긴다.
- `link`는 사이트 안 주소(`/`로 시작)만 허용한다.

#### 흐름: 미리보기와 적용을 나눈다

1. `propose_main_visual_update({ id, changes })` → `POST /api/mcp/main-visual/[id]/proposals`
   - 쓰기 scope와 DB `ADMIN`을 확인하고 `changes`를 검증한다.
   - 현재 행을 읽어 실제로 달라지는 필드만 골라 `before`/`after`를 만든다. 달라지는 필드가 없으면 400이다.
   - 변경 확인 토큰(`changeToken`)을 발급한다. Pacemaker 키로 서명한 JWT이고 `typ=mcp-change+jwt`, `sub`(관리자), `client_id`, 배너 id, 변경 값, 미리보기 시점의 `updatedAt`, 10분 만료, `jti`를 담는다.
   - 실제 화면 미리보기 주소(`previewUrl`)도 함께 돌려준다. 아래 "실제 화면 미리보기 페이지"를 본다.
   - DB는 바꾸지 않는다. MCP 도구는 `readOnlyHint: true`이고, 결과에 전후 비교, 미리보기 링크, "사용자에게 보여 주고 확인을 받은 뒤에만 적용하라"는 안내를 넣는다.
2. `apply_main_visual_update({ changeToken })` → `POST /api/mcp/main-visual/apply`
   - 쓰기 scope와 DB `ADMIN`을 다시 확인하고, 토큰의 서명·`typ`·만료·`sub`가 요청자와 같은지·`client_id`를 검증한다. 변경 값도 다시 검증한다.
   - 한 트랜잭션에서 `updateMany({ where: { id, updatedAt: 미리보기 시점 값 } })`로 바꾼다. 0건이면 409이다. 미리보기 뒤에 다른 사람이 고쳤다는 뜻이므로 다시 제안해야 한다.
   - 같은 트랜잭션에서 변경 기록을 남기고, 기존 관리자 API처럼 `/`와 `/admin/main-visual`을 다시 그리게 한다.
   - MCP 도구는 `destructiveHint: true`로 표시해 MCP host가 실행 전에 사용자 확인을 받게 한다.

토큰 방식을 고른 이유:

- 적용 단계는 미리보기에서 보여 준 값만 적용할 수 있다. 모델이 그사이 값을 바꿔 보낼 수 없다.
- 적용하면 `updatedAt`이 바뀌므로 같은 토큰을 다시 보내도 409로 막힌다. 미리보기 저장용 테이블이 따로 필요 없다.
- 한계: 서버는 사람이 실제로 승인했는지 증명할 수 없다. 사람의 확인은 MCP host의 도구 실행 확인과 도구 설명에 기댄다. MCP elicitation(서버가 host를 통해 사용자에게 직접 묻는 기능)은 host 지원 여부를 확인한 뒤 다음 버전에서 검토한다.

#### 실제 화면 미리보기 페이지

사용자 결정(2026-11-08): 글자 비교와 함께, 홈 화면 배너와 똑같이 그린 미리보기를 사이트 페이지로 제공한다. MCP host의 화면 띄우기 확장(MCP Apps)은 지원 host가 제한적이라 다음 버전에서 검토한다. 링크 방식은 Claude Code, Claude Desktop, Codex 모두에서 쓸 수 있다.

- 주소: `/admin/main-visual/preview/[token]`. `/admin` 레이아웃이 이미 `requireAdminUser()`로 관리자가 아니면 로그인이나 홈으로 보낸다. 브라우저에서 관리자 계정으로 로그인해 있어야 열린다. 미리보기 토큰의 `sub`와 브라우저 사용자가 같을 필요는 없다.
- 미리보기 토큰: 변경 확인 토큰과 별도로 발급하는 `typ=mcp-preview+jwt` JWT. 배너 id, 변경 값, 미리보기 시점의 `updatedAt`, 10분 만료를 담는다. 적용 route는 이 `typ`을 거부하므로 링크로는 볼 수만 있다. 배너 글자만 담기고 개인 정보는 없다.
- 화면: 지금 모습과 바꾼 뒤 모습을 위아래로 나란히 그린다. 각각 홈 화면 배너 부품 `ListHeader`에 슬라이드 하나만 넘기고 자동 넘김은 끈다. 바뀌는 항목 목록과 링크 만료 시각을 함께 보여 준다.
- 홈 화면과 같은 규칙을 쓰도록 `src/app/page.tsx`의 "배너 → 슬라이드" 변환(순서별 청록·주황 색, 35자 이상 제목 글자 크기, 버튼 문구·링크)과 공개·노출 기간 필터를 `src/lib/main-visual-slides.ts`로 떼어 내 홈 화면과 미리보기가 함께 쓴다.
- 배너 색은 홈 화면에 보이는 배너들 사이의 순서로 정해진다. 그래서 변경 전후 각각 보이는 배너 목록을 계산해 순서를 구한다. 공개 여부 변경 등으로 홈 화면에 보이지 않게 되면 "홈 화면에 보이지 않음"을 표시한다.
- 미리보기 뒤에 배너가 바뀌어 `updatedAt`이 다르면 "미리보기 이후 배너가 바뀌었다. 다시 제안하라"를 표시한다. 만료되거나 서명이 틀린 토큰은 404로 처리한다.
- `previewUrl`의 origin은 요청을 받은 서버 origin이다(배포 환경은 `NEXT_PUBLIC_APP_URL`). MCP는 이 origin이 설정된 API origin과 같을 때만 링크를 보여 준다.

#### 입력 검증 (서버 기준, 길이는 제안값)

| 필드          | 규칙                                                                                                                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`       | 앞뒤 공백 제거 후 1–120자. 줄바꿈은 허용하되 3줄까지. 그 밖의 제어 문자와 보이지 않는 문자(아래 참고)는 거부                                                                                                                   |
| `description` | 0–300자. 한 줄. 제어 문자와 보이지 않는 문자는 거부. 빈 값은 `null`로 저장                                                                                                                                                     |
| `linkName`    | 0–40자. 한 줄. 제어 문자와 보이지 않는 문자는 거부. 빈 값은 `null`로 저장                                                                                                                                                      |
| `link`        | 200자 이하. `/` 하나로 시작하고 `//`로 시작하면 거부. RFC 3986이 경로·쿼리·조각에 허용하는 ASCII 문자만 받고, 나머지는 `%XX`로 인코딩해야 함. 임의 origin을 기준으로 해석해도 origin이 바뀌지 않아야 함. 빈 값은 `null`로 저장 |
| `isPublic`    | boolean                                                                                                                                                                                                                        |

- 보이지 않는 문자: 제어 문자(C0·C1), 줄·문단 구분 문자(U+2028·U+2029), 글자 방향 바꾸기·폭 없는 공백 같은 서식 문자(Unicode `Cf`). 이어 붙인 이모지에 필요한 U+200D만 허용한다.
- 알 수 없는 필드는 거부한다(zod `strictObject`).
- 변경 후 상태에서 `link`가 있으면 `linkName`도 있어야 한다.

#### 권한 범위

- Clerk 개발 인스턴스에 `mcp:main-visual:write` custom scope를 만들고 MCP OAuth 앱에 할당한다. Clerk 설정 변경이므로 구현 시 사용자 승인을 받는다.
- MCP는 로그인할 때 읽기·쓰기 scope를 함께 요청한다.
- `/api/mcp/token`은 Clerk 토큰에 실제로 부여된 scope 중 읽기·쓰기만 골라 API JWT에 담는다. 읽기 scope는 계속 필수다.
- 조회 route는 읽기 scope를, 제안·적용 route는 쓰기 scope를 요구한다.
- 이미 저장된 읽기 전용 로그인으로 수정하면 403이 난다. MCP는 "로그아웃 후 다시 로그인해 수정 권한을 허용하라"고 안내한다.

#### 변경 기록 테이블

```prisma
model McpAuditLog {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  actorClerkId String
  clientId     String
  action       String   // "main_visual.update"
  entityId     String   @db.Uuid
  before       Json     // 바뀐 필드의 이전 값만
  after        Json     // 바뀐 필드의 새 값만
  createdAt    DateTime @default(now())

  @@index([entityId, createdAt])
}
```

- 적용 응답에 기록 id와 이전 값을 돌려준다. 되돌리기는 이전 값으로 새 제안을 만드는 방식으로 한다. 기록 조회 도구는 다음 버전에서 검토한다.

#### MCP 오류 안내

- 409: 미리보기 뒤에 배너가 바뀌었으니 다시 제안하라.
- 400: 서버의 검증 메시지를 그대로 보여 준다.
- 403(쓰기 scope 없음): 로그아웃 후 다시 로그인하라.
- 토큰 만료: 다시 제안하라.

#### 구현 순서와 확인

1. Clerk 쓰기 scope 생성과 앱 할당(사용자 승인 후).
2. Prisma 모델과 마이그레이션.
3. 서버: 검증 모듈, 변경 확인·미리보기 토큰, 제안·적용 route, 토큰 교환 scope 처리. 단위·route 테스트(401/403/400/409/200, 기록 생성).
4. 미리보기 페이지: 배너 → 슬라이드 변환 분리, 미리보기 페이지, 토큰 만료·서명 오류·배너 변경 표시. 홈 화면 렌더링이 그대로인지 기존 테스트와 화면으로 확인.
5. MCP: 로그인 scope, API 메서드, 도구 2개(미리보기 링크 포함), 오류 안내. 단위 테스트.
6. 실제 확인: 관리자 로그인 → 제목 변경 제안 → 미리보기 링크로 실제 배너 모양 확인 → 적용 → 로컬 홈 화면 반영 확인 → 이전 값으로 되돌리기 → 기록 2건 확인. 확인 후 테스트 데이터는 원래 값으로 돌려 둔다.

다음 버전 후보: MCP Apps로 대화창 안 미리보기, 순서 변경(여러 배너를 한 번에 바꾸는 별도 도구), 노출 기간(시간대 규칙 포함), 이미지, 추가·삭제, 변경 기록 조회 도구, production rate limit.

### 2026-11-08 메인 배너 수정 기능 구현과 확인

#### 구현

- DB: `McpAuditLog` 모델과 마이그레이션 `20261108000000_add_mcp_audit_log`. 로컬 DB에는 `prisma migrate deploy`로 적용했다.
- 서버
  - `src/lib/mcp-main-visual-change.ts`: 입력 검증, 변경 비교, 변경 확인·미리보기 토큰.
  - `src/lib/mcp-main-visual-store.ts`: 조회 필드, 미리보기 origin.
  - `src/lib/mcp-scope-error.ts`: scope 부족을 401과 구분해 `403 insufficient_scope`로 답한다.
  - route: `POST /api/mcp/main-visual/[id]/proposals`, `POST /api/mcp/main-visual/apply`.
  - `/api/mcp/token`은 Clerk 토큰에 부여된 읽기·쓰기 scope만 API JWT에 담는다.
- 미리보기: `/admin/main-visual/preview/[token]`. 홈 화면의 배너 변환과 노출 필터를 `src/lib/main-visual-slides.ts`로 옮겨 홈 화면과 함께 쓴다. `src/middleware.ts`는 로그인하지 않은 미리보기 요청만 `/sign-in?redirect_url=<미리보기 경로>`로 보낸다. 기존 `/admin` 레이아웃은 로그인 후 `/admin`으로 보내기 때문이다.
- MCP
  - 로그인 시 쓰기 scope도 요청한다.
  - 도구 `propose_main_visual_update`(읽기 전용 표시), `apply_main_visual_update`(`destructiveHint`)를 추가했다.
  - 변경 확인 토큰은 MCP 프로세스 메모리에 두고, 적용 도구는 8자리 `proposalId`를 받는다. 각 제안은 한 번만 쓸 수 있다.
  - 미리보기 링크는 origin이 설정된 API origin과 같을 때만 보여 준다.
- Clerk 개발 인스턴스
  - 사용자가 대시보드 OAuth applications → Scopes에서 custom scope `mcp:main-visual:write`를 만들었다. Backend API로는 instance에 없는 scope를 앱에 붙일 수 없어 422가 났다.
  - 그 뒤 Backend API로 MCP OAuth 앱의 scope에 추가했다. 지금 scope는 `mcp:main-visual:read mcp:main-visual:write offline_access openid`이다.

#### 확인

- 루트 테스트 422개 통과(4개 skip). typecheck, lint(기존 무관 경고 2개), build 통과. `mcp/` typecheck, 테스트 52개, build 통과.
- 로컬 키로 만든 API 토큰으로 HTTP 경계 24개 항목을 확인했다.
  - 읽기 전용 로그인과 일반 사용자는 403이었다. 외부 링크, 알 수 없는 필드, 같은 값 제안은 400이었다.
  - 제안만으로는 DB가 바뀌지 않았다.
  - 미리보기 토큰으로 적용하면 400이었다. 다른 사용자나 읽기 전용 로그인으로 적용하면 403이었다.
  - 적용하면 DB와 홈 화면이 바뀌었다. 같은 토큰을 재사용하거나 먼저 만든 제안을 적용하면 409였다.
  - 되돌리기와 변경 기록 3건을 확인했다.
- 실제 관리자 로그인(쓰기 scope 동의)으로 MCP 도구를 확인했다.
  - 제안 → 적용 → 같은 제안 재적용 거부 → 원래 값으로 되돌리기 → 변경 기록 2건 → `sign_out` 순서로 모두 기대대로 동작했다.
- 미리보기 링크
  - 로그인하지 않은 상태에서는 미리보기 경로를 `redirect_url`에 담아 로그인 화면으로 보냈다.
  - 관리자 브라우저에서는 지금·바꾼 뒤 배너가 홈 화면 디자인 그대로 보였다(사용자 확인).
- 확인 뒤 배너 3건은 원래 값으로 되돌렸다(`updatedAt`은 바뀜). 로컬 `McpAuditLog`에는 확인 기록이 남아 있다.

#### 남은 일

- Claude Desktop·Codex 실제 등록, Windows 확인.
- production 적용 전: production Clerk custom scope, 서명 키, issuer/audience 분리, rate limit.

### 2026-11-09 보안·엣지 케이스 점검과 보완

#### 점검

- 로컬 개발 서버에 HTTP로 약 150개 항목, 빌드한 MCP 프로그램에 약 40개 항목을 확인했다. 스크립트는 로컬 `.env.local`의 MCP 키로 토큰을 만들고, 끝나면 배너 값과 `updatedAt`을 SQL로 되돌리고 자기가 남긴 `McpAuditLog` 행을 지운다.
- API JWT 위조(다른 키, `alg: none`, 공개키 HS256, 만료, 긴 수명, `iss`·`aud`·`kid`·`typ`·`client_id`·`jti` 변조, 서명 유지 payload 변조), 변경 확인·미리보기 토큰 바꿔 쓰기, 역할·scope, 변경 확인 토큰 위조(진짜 키로 서명한 금지 값 포함), 같은 토큰 동시 적용, 낡은 제안, 링크 우회 문자열, 입력 경계값, 5MB 본문, 홈 화면 XSS, 로그인 redirect, 응답 머리글을 확인했다. 모두 기대대로 막혔다.
- MCP: 잘못된 API·Clerk 주소, 운영 프로필, 포트, 호스트 이름이면 시작하지 않는다. 형식이 틀린 도구 입력은 로그인 전에 거부한다. 로그인 콜백 서버는 `127.0.0.1`에만 열리고 state가 다르면 무시하며 입력값을 되비추지 않는다.

#### 보완

- `GET /api/mcp/main-visual/[id]`와 `get_main_visual`이 `linkName`, `link`도 돌려준다. 고칠 수 있는 칸인데 현재 값을 볼 수 없었다.
- `link`는 RFC 3986 문자만 받는다. 전에는 `"`, `<`, `>` 같은 문자가 들어갔다. 화면에서는 escape되어 안전했지만 깨진 링크가 저장될 수 있었다. 잘못된 `%` 인코딩도 거부한다.
- `title`, `description`, `linkName`은 보이지 않는 문자를 거부한다. 전에는 글자 방향 바꾸기·폭 없는 공백·C1 제어 문자가 들어갔고, 줄 구분 문자(U+2028)로 3줄 제한을 피할 수 있었다.
- 미리보기 토큰에서 `sub`, `client_id`를 뺐다. 미리보기 링크는 브라우저 기록과 로그인 `redirect_url`에 남는데, 그 안에서 관리자 Clerk 사용자 id를 읽을 수 있었다. 변경 값은 남는다. 곧 홈 화면에 공개될 배너 글자이고 10분 뒤 만료된다.

#### 남은 일

- 로그인한 브라우저 확인(일반 사용자 세션으로 미리보기 열기, 로그인 상태에서 위조 미리보기 링크 열기).
- production 적용 전 rate limit. 지금은 동시 요청 50개가 모두 처리된다.
