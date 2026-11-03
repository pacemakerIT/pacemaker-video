# Seed 수정 계획

대상: `prisma/seed.ts`, `prisma/seed-helpers.ts` (+ 테스트), `prisma/seed-assets/`, `package.json`, `README.md`, `.env.local.example`, `supabase/config.toml`

작성일: 2026-11-02 (개발용 버킷 방식으로 개정)

## 확정된 결정

- 개발용 Supabase 프로젝트는 당장 분리하지 않는다. 대신 운영 프로젝트 안에 개발용 버킷 `image-dev`, `document-dev`를 두고 로컬은 이 버킷만 쓴다.
- 로컬 환경 변수는 개발용 버킷을 가리킨다.

  ```
  SUPABASE_S3_IMG_BUCKET=image-dev
  SUPABASE_S3_EBOOK_BUCKET=document-dev
  ```

- 시드는 운영 버킷(`image`, `document`)을 **읽지도 쓰지도 않는다.** 저장소 안의 고정 파일을 개발용 버킷에 올리고, 로컬 DB에는 그 URL만 저장한다.
- 업로드는 두 버킷 이름이 모두 `-dev`로 끝날 때만 한다. 아니면 업로드하지 않고 `public/img` 대체 이미지를 쓴다. 별도 켜고 끄는 변수(`SEED_REMOTE_STORAGE`)는 두지 않는다.
- 시드 상품 가격은 **28달러**로 맞춘다. 강의 `price: '28'`, 전자책 `price: 28`.
- `ts-node` → `tsx` 전환은 이번 범위에서 제외한다.

## 스토리지 구성 (2026-11-02 확인)

| 버킷           | 용도                                                         | 상태                                                                                                                            |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `image`        | 운영 이미지. `/api/images/proxy`가 설정된 이미지 버킷만 서빙 | 57개. 비공개, 용량·MIME 제한 없음                                                                                               |
| `document`     | 운영 전자책 PDF. 어드민 폼이 루트에 `<uuid>.pdf`로 업로드    | 119개. pdf 12개, 레거시 썸네일 이미지 92개, 확장자 없는 파일 12개(`ebook-1`, `ebook-2`, `test*` 등), pptx, `docker-compose.yml` |
| `image-dev`    | 로컬 개발·시드 이미지                                        | **2026-11-02 생성.** 비공개, 파일당 50MiB 제한(CLI 기본값), MIME 제한 없음. 비어 있음                                           |
| `document-dev` | 로컬 개발·시드 전자책 PDF                                    | **2026-11-02 생성.** 비공개, 파일당 50MiB 제한(CLI 기본값), MIME 제한 없음. 비어 있음                                           |

- 운영 버킷 설정은 Storage API(`GET /storage/v1/bucket`)로 읽어 확인했다. 공개 URL 접근은 400(비공개).
- 개발용 버킷은 `supabase seed buckets --linked --project-ref apnbtkynvquutxdmmkre`로 만들었다. 이때 두 버킷만 선언한 임시 `config.toml`을 썼고 저장소의 `supabase/config.toml`은 바꾸지 않았다. 결과: `buckets_created: [image-dev, document-dev]`, 운영 버킷의 `updated_at`은 그대로.
- 로컬 S3 키로 두 개발용 버킷 목록 조회가 되는 것을 확인했다.
- Vercel `Production`에는 `SUPABASE_S3_IMG_BUCKET`, `SUPABASE_S3_EBOOK_BUCKET`이 있다(값 미조회, `image`/`document`로 추정). `Preview`/`Development`에는 없다.
- Vercel `Preview`는 운영 DB(`DATABASE_URL`)를 쓴다. 따라서 Preview를 `-dev` 버킷으로 바꾸면 운영 데이터의 이미지가 깨진다. Preview는 개발용 버킷 대상이 아니다.

### 현재 시드가 운영 버킷에서 하는 일 (고칠 대상)

1. 전자책 버킷 전체를 조회해 키를 고른다. `selectSeedEbookKeys`가 확장자를 보지 않아, 운영 `document`의 **레거시 썸네일 이미지 6개**(`0489b5c7-….jpg`, `04e06b54-….png` 등)를 전자책 PDF로 고른다.
2. 이미지 버킷 전체를 조회해 썸네일을 고른다. 결과가 운영 버킷 내용에 따라 달라진다.
3. `bucketUrl`을 해석하지 못하면 앱은 `ebookId`를 오브젝트 키로 쓴다(`src/lib/ebook-file-location.ts`). 시드 `ebookId`가 `ebook-1`, `ebook-2`라서 전자책 버킷의 같은 이름 파일과 겹칠 수 있다.

## 현재 시드의 문제 (요약)

| 구분        | 문제                                                                                                                                                                            | 위치                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 데이터 오류 | 상품 가격 2800은 앱에서 2,800달러로 계산되는데, 시드 주문 항목은 2800센트(28달러)로 저장                                                                                        | `seed.ts:438`, `:942`, `:948`, `:974`   |
| 데이터 오류 | 테스트 계정 upsert 결과가 아니라 고정 id로 주문·리뷰·시청 기록·찜을 연결. 계정이 이미 다른 id로 있으면 존재하지 않는 사용자에 붙음(`relationMode = "prisma"`라 FK 오류도 안 남) | `seed.ts:677`, `:743`, `:916`           |
| 데이터 오류 | 전자책 PDF 자리에 이미지 파일을 고름 (위 1)                                                                                                                                     | `seed-helpers.ts` `selectSeedEbookKeys` |
| 스토리지    | 운영 버킷 내용을 조회해서 씀. 결과가 운영 상태에 묶이고, 운영 저장소 키가 시드에 필요함                                                                                         | `seed.ts:42-84`, `:243-275`             |
| 정합성      | 워크숍 등록 3건이 워크숍 항목이 없는 주문에 연결됨. 결제 완료 주문의 워크숍은 다른 주문의 등록을 가리킴                                                                         | `seed.ts:927-1005`                      |
| 정합성      | 모든 전자책 목차가 개발자용, 강의 대상 분야가 분류와 무관하게 고정, `HIDDEN`·`isMain` 워크숍 없음, 사용자 화면에 안 나오는 가짜 Vimeo `videoLink`                               | `seed.ts:437`, `:446`, `:577`, `:760`   |
| 운영        | 실행 스크립트 없음. Prisma 7은 `migrate dev`/`reset` 후 시드를 자동 실행하지 않음                                                                                               | `package.json`                          |
| 운영        | 삭제와 생성이 트랜잭션 밖. 중간 실패 시 반쯤 빈 DB                                                                                                                              | `seed.ts:277` 이후                      |
| 운영        | 워크숍 상태가 시드 시점·로컬 시간대로 고정되고 앱이 다시 계산하지 않음                                                                                                          | `seed.ts:177`, `:872`                   |
| 정리        | 아래 4단계 목록                                                                                                                                                                 | —                                       |

## 작업 단계

브랜치: `chore/seed-cleanup` (Jira 티켓이 있으면 `PACE-<번호>/seed-cleanup`). 커밋은 단계별로 나눈다.

### 1단계 — 시드 파일을 개발용 버킷에만 올리고, 로컬 DB는 그 URL만 가리킨다

**버킷 판단** (`seed-helpers.ts`의 순수 함수 + 단위 테스트)

- `resolveSeedStorage(env)`:
  - `SUPABASE_S3_IMG_BUCKET`, `SUPABASE_S3_EBOOK_BUCKET`, `NEXT_PUBLIC_SUPABASE_URL`, S3 접속 변수가 모두 있고,
  - 두 버킷 이름이 모두 `-dev`로 끝나며 서로 다를 때만 `{ mode: 'dev', imageBucket, ebookBucket }`.
  - 그 밖에는 `{ mode: 'local', reason }`. `SUPABASE_S3_BUCKET`이나 다른 버킷으로 대체하지 않는다.
- `mode: 'dev'`일 때 Supabase 호스트와 두 버킷 이름을 출력한다.
- `mode: 'local'`일 때 이유와 "전자책 PDF는 열리지 않음. `.env`에 `-dev` 버킷을 설정하면 업로드함" 안내를 출력한다.
- 저장소 클라이언트는 `mode: 'dev'`일 때만 만든다.

**올릴 파일** (저장소 안의 고정 파일)

| 원본                                                             | 개발용 버킷 키                       | 쓰는 곳                         |
| ---------------------------------------------------------------- | ------------------------------------ | ------------------------------- |
| `public/img/course_image1~3.png`                                 | `image-dev/seed/course_image<n>.png` | 강의·워크숍 썸네일, 영상 썸네일 |
| `public/img/ebook_image1~6.png`                                  | `image-dev/seed/ebook_image<n>.png`  | 전자책 썸네일                   |
| `public/img/raphael.png`, `linda.png`, `instructor-image.png`    | `image-dev/seed/<파일명>`            | 강사 사진                       |
| `prisma/seed-assets/sample-ebook.pdf` (새로 추가, 작은 샘플 PDF) | `document-dev/seed/sample-ebook.pdf` | 전자책 6권 `bucketUrl`          |

- 이미지 파일은 모두 4MB 이하(최대 `raphael.png` 0.62MB).
- 메인 비주얼은 지금처럼 썸네일 없이 둔다.

**업로드 규칙**

- 키는 고정한다(`seed/…`). 업로드 전에 `HeadObject`로 확인해 같은 크기의 파일이 있으면 건너뛴다. 크기가 다르면 덮어쓴다. 시드를 반복해도 파일이 쌓이지 않는다.
- `ContentType`을 지정한다(`image/png`, `application/pdf`).
- 버킷은 시드가 만들지 않는다. 버킷이 없으면 생성 방법(5단계)을 안내하고 중단한다.
- 업로드는 DB 트랜잭션 전에 끝낸다.
- 운영 버킷 목록 조회(`listBucketObjects`)와 키 선택 함수(`selectSeedImageKeys`, `selectSeedEbookKeys`, `createCyclicPicker`)는 제거한다. 관련 테스트도 정리한다.

**DB에 저장할 값**

- URL 형식은 어드민 업로드와 같은 `{SUPABASE_URL}/storage/v1/object/public/{bucket}/{key}`. 앱의 이미지 프록시와 전자책 뷰어가 이 형식에서 버킷과 키를 읽는다.
- 전자책 `ebookId`는 `seed-ebook-<n>`. 운영 키(`ebook-1`, `ebook-2`)와 겹치지 않게 한다.
- `mode: 'local'`이면 썸네일·강사 사진은 `/img/...`, 전자책 `bucketUrl`은 빈 값.

### 2단계 — 데이터 오류 수정

- 강의 `price: '28'`, 전자책 `price: 28`.
- 주문 항목 금액은 `amountToCents(상품 가격)`으로 계산한다. `src/lib/money.ts`는 import가 없어 `../src/lib/money`로 바로 가져올 수 있다.
- 주문 합계(`subtotalAmountCents`, `totalAmountCents`)는 항목 합으로 계산한다. 하드코딩 `19600` 제거.
- 테스트 계정 upsert 결과의 `id`를 이후 모든 데이터에 사용한다.

### 3단계 — 정합성 보완

- 워크숍 등록(`UserWorkshop.orderId`)은 그 워크숍을 항목으로 가진 주문에 연결한다.
  - 완료된 워크숍(`workshopIds[0]`), 대면 워크숍(`workshopIds[6]`): 대시보드 주문에 `WORKSHOP` 항목 추가.
  - 온라인 워크숍(`workshopIds[5]`): 결제 완료 주문(`cs_test_seed_payment_success`)에 이미 있으므로 등록을 그 주문에 연결.
- 전자책 목차를 분류별로 작성한다(마케팅, 디자인, 공공, IT, 회계, 서비스).
- 강의 `targetAudienceTypes`를 강의 분류에 맞춘다.
- `HIDDEN` 상태 워크숍 1개 추가, 일부 워크숍 `isMain: true`.
- 강의 `videoLink`는 빈 값.
- 워크숍 상태가 시드 시점 기준으로 고정된다는 점을 주석과 README에 적는다.

### 4단계 — 코드 정리

- `main()`을 영역별 함수로 분리: 스토리지 준비, 초기화, 메인 비주얼, 강사, 강의, 전자책, 계정, 리뷰, 워크숍, 대시보드.
- 긴 문구 데이터는 `prisma/seed-data.ts`로 이동.
- 초기화와 생성을 `prisma.$transaction(async (tx) => …, { timeout: 60_000 })`로 묶는다.
- `'OPEN' as unknown as WorkshopStatus` → `WorkshopStatus.OPEN`.
- `resolveWorkshopStatus`의 미사용 `startDate` 인자 제거.
- 강사 3명: 배열 하나 + `createMany` (직전에 전부 삭제하므로 upsert 불필요).
- `UserRole` upsert 제거 (마이그레이션 `20250614005454`가 삽입).
- `$executeRawUnsafe('DELETE FROM "_CourseToInstructor"')` → `tx.courseToInstructor.deleteMany()`.
- 리뷰 중복 삭제(`seed.ts:738`) 제거.
- 강의 생성 로그 문구 수정("Generating English e-books" → 강의).
- 섹션 재조회 제거(생성 결과 사용), 영상은 `createMany`.
- 종료 처리: `$disconnect()` 후 `process.exit(1)`.

### 5단계 — 실행 방법과 버킷 선언 정리

- `package.json`: `"db:seed": "prisma db seed"`.
- `supabase/config.toml`에 개발용 버킷을 선언해, 버킷이 지워져도 같은 설정으로 다시 만들 수 있게 한다.

  ```toml
  [storage.buckets.image-dev]
  public = false

  [storage.buckets.document-dev]
  public = false
  ```

  재생성 명령: `supabase seed buckets --linked --project-ref apnbtkynvquutxdmmkre`. 이 파일에는 운영 버킷을 선언하지 않는다(명령이 선언된 버킷 설정을 덮어쓰므로).

- `.env.local.example`에 `SUPABASE_S3_IMG_BUCKET=image-dev`, `SUPABASE_S3_EBOOK_BUCKET=document-dev` 추가.
- `README.md` "Seeding the Database" 갱신:
  - Prisma 7에서는 마이그레이션 후 `npm run db:seed`를 직접 실행
  - 로컬 DB(localhost, `pacemaker-dev-postgres`)에서만 실행됨
  - 로컬은 `-dev` 버킷을 쓰고, 시드는 `-dev` 버킷에만 업로드함
  - 운영 DB 덤프를 로컬에서 쓰면 이미지가 깨짐(운영 데이터는 `image`를 가리킴)
  - 워크숍 상태 때문에 주기적으로 재시드 필요

## 검증

1. `npm test -- --run`, `npm run typecheck`, `npm run build`, `npm run lint`
2. 시작 전 운영 버킷 파일 수 기록(`image` 57개, `document` 119개)
3. 로컬 Docker DB에서 시드 2회 연속 실행
   - DB 결과 동일
   - `image-dev`/`document-dev` 파일 수가 두 번째 실행 후에도 그대로(중복 업로드 없음)
4. 버킷 변수를 `image`/`document`로 바꿔 실행 → 업로드하지 않고 `/img/...` 대체, 안내 출력
5. 끝난 뒤 운영 버킷 파일 수가 시작 전과 같은지 확인
6. 테스트 계정을 다른 id로 미리 만든 뒤 시드 → 대시보드 데이터가 그 계정에 붙는지 확인
7. Aside 브라우저
   - 썸네일·강사 사진이 `image-dev`에서 프록시로 표시됨
   - 전자책 뷰어에서 샘플 PDF가 열림
   - 마이페이지 주문 금액 = 상품 가격(28달러)
   - 대시보드 수강·워크숍 현황
   - `/mypage/payment-success?session_id=cs_test_seed_payment_success`
   - 워크숍 목록 상태 표시, 메인 노출 워크숍

## 남는 한계

- 로컬 S3 키는 운영 프로젝트의 키라서 운영 버킷에도 접근할 수 있다. 개발용 버킷은 파일이 섞이는 것을 막을 뿐, 키 유출 위험은 그대로다.
- 개발용 버킷 제한(파일당 50MiB)은 운영 버킷(제한 없음)과 다르다. 프로젝트 전체 업로드 제한이 같다면 실제 차이는 없다.

## 시드 범위 밖 발견 사항 (별도 작업)

- 운영 스토리지에 파일 이름처럼 생긴 **빈 버킷 9개**가 있다(`2917bdb7-….png`, `76e2a42e-….jpeg` 등, 2026-04 생성). 과거 업로드 코드가 파일 이름을 버킷 이름으로 넘긴 흔적으로 보인다.
- `document` 버킷에 테스트 파일(`test`, `TEST_2025052603 - …`, `Sample.pdf`), `docker-compose.yml`, pptx가 남아 있다. 버킷은 비공개다.
- Vercel `Preview`/`Development` 환경에는 버킷 변수가 없어 이미지 업로드(`/api/images/upload`)가 503을 반환할 수 있다. Preview는 운영 DB를 쓰므로 값을 넣는다면 운영 버킷(`image`/`document`)이어야 한다.
- 개발용 Supabase 프로젝트 분리는 팀 결정이 필요하다.
