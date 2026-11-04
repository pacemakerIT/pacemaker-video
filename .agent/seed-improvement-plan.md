# Seed 수정 계획

대상: `prisma/seed.ts`, `prisma/seed-helpers.ts` (+ 테스트), 새 `prisma/seed-data.ts`, 새 `prisma/seed-files.json`, 새 `scripts/prepare-dev-seed-files.mjs`, `package.json`, `README.md`, `.env.local.example`, `supabase/config.toml`

작성: 2026-11-02 · 개정: 2026-11-03 (운영 콘텐츠 고정 + 버킷 미접근) · 작업 브랜치: `chore/seed-production-content`

## 목표

로컬 시드 결과가 **2026-11-03 현재 운영 사이트(https://www.paceupcareer.com)에 보이는 콘텐츠와 같게** 한다. 운영에서 숨긴 항목, 운영에 없는 예시 콘텐츠는 넣지 않는다. 테스트 계정과 마이페이지용 주문·시청 기록·찜은 이 콘텐츠만 참조한다.

## 확정된 결정

- **문구는 시드 코드에 고정한다.** 2026-11-03 운영 값을 `prisma/seed-data.ts`에 한 번 옮겨 적는다. 운영에서 다시 가져오는 스냅샷이나 내보내기 스크립트는 만들지 않는다. 운영 콘텐츠가 바뀌어도 시드는 자동으로 따라가지 않는다.
- **시드는 저장소 버킷에 접근하지 않는다.** 목록 조회, 업로드, 존재 확인 모두 하지 않는다(S3 클라이언트 자체를 만들지 않음). 개발용 버킷(`image-dev`, `document-dev`)에 있는 파일의 주소만 만들어 로컬 DB에 저장한다.
  - 주소 형식: `{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/{버킷}/{키}`. 관리자 업로드와 같은 형식이라 이미지 프록시와 전자책 뷰어가 그대로 읽는다.
  - 버킷 이름은 `SUPABASE_S3_IMG_BUCKET`, `SUPABASE_S3_EBOOK_BUCKET`에서 읽는다. 둘 다 `-dev`로 끝나고 서로 다를 때만 저장소 주소를 쓴다. 아니면 `/img/...` 대체 이미지와 빈 `bucketUrl`을 쓰고 안내를 출력한다.
  - 파일 키는 **운영과 같은 이름**으로 한다(예: `home/online-course-1.png`, `630537c5-….jpeg`, `ebook-1`). 개발용 버킷이 운영 파일을 같은 키로 갖고 있다는 전제다.
- **개발용 버킷 준비는 시드와 분리한 1회 작업**이다(아래 0단계). 시드 실행 때마다 하지 않는다.
- 가격은 **운영과 같은 2800**(화면 $2,800). 주문 금액은 `amountToCents(2800)` = 280000센트로 계산해 상품 가격과 일치시킨다.
- 상품 id와 `ebookId`는 운영 값을 그대로 쓴다. 로컬과 운영의 상세 페이지 주소가 같아 비교하기 쉽다.
- `ts-node` → `tsx` 전환은 이번 범위에서 제외한다.

## 운영에 보이는 콘텐츠 = 시드에 고정할 콘텐츠 (2026-11-03 확인)

운영 콘텐츠 테이블만 로컬 사본으로 복원해 읽었다(사용자·주문 제외, 사본은 삭제). 구현할 때 같은 방법으로 정확한 문구를 옮긴다.

| 종류           | 고정할 내용                                                                                                                                                                                                                                                                                              | 개발용 버킷 파일                                                                                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 메인 비주얼    | 3개. "Not sure where to start\nyour job search? Our Expertise" / "Get your resume\nreviewed by pros" / "Mock interviews\nwith local mentors"와 설명·버튼·링크. 썸네일 없음                                                                                                                               | 없음                                                                                                                                                                                            |
| 강의           | 공개 3개: "Resume + Interview Prep (All-in-One) - Volume 1"(INTERVIEW)·2(RESUME)·3(NETWORKING). 설명, 과정 제목·내용, `visualTitle`/`visualTitle2`, "7 Hours", 가격 `'2800'`, 대상 `{IT, GOVERNMENT}`, `videoLink`, 강사 Raphael. Lee·Sujin Ku. 정렬 값은 Volume 순으로 `a0`·`a1`·`a2`(운영은 모두 `a0`) | `image-dev/home/online-course-1~3.png`                                                                                                                                                          |
| 강의 섹션·영상 | 강의마다 섹션 3개 × 영상 4개(제목·순서·`videoId` 운영과 같음. 첫 영상만 실제 Wistia id `32ktrbrf3j`, 나머지 `vidx-…`). `Video.thumbnail`은 비움(화면에 안 나옴)                                                                                                                                          | 없음                                                                                                                                                                                            |
| 강의 추천 링크 | 운영 값에서 **숨긴 강의로 가는 링크를 뺀다**: Volume 1의 "Bonus Material for 1"(→Volume 6), Volume 3의 "Recommended Course 4"(→Volume 4). Volume 2는 그대로                                                                                                                                              | 없음                                                                                                                                                                                            |
| 강의 리뷰      | 공개 강의마다 3개, 총 9개. 운영 문구 3종과 별점                                                                                                                                                                                                                                                          | 없음                                                                                                                                                                                            |
| 전자책         | 공개 6권 전부: 마케팅·디자인·공공·IT(`isMain`), 서비스·회계. 제목, 부제, `visualTitle1/2`, 설명, 상세 설명, 목차 3항목, 분류, 대상, 가격 2800, `ebookId`, 정렬 값 `a0`~`a5`                                                                                                                              | 썸네일 6장(운영 키) → `image-dev`, PDF 6개(운영 키: `ebook-1`, `ebook-2`, `ebooks/70ae8c6c….pdf`, `b16eceb6….pdf`, `TEST_2025052603 - 254926 16:49:24`, `Celpip_template.pdf`) → `document-dev` |
| 워크숍         | 보이는 4개: Mind Training for Success, UX Design Workshop, Let's Connect!, Resume Workshop for International Opportunities. 설명, 분류, 가격 20, 장소 North York centre. 진행자·커리큘럼 없음                                                                                                            | `image-dev/home/workshop-1.png`, `workshop-4.jpg`, `workshop-image.jpg`, `workshop-3.jpg`                                                                                                       |
| 강사           | 공개 콘텐츠에 연결된 2명: Raphael. Lee, Sujin Ku(소개, 경력). 사진은 운영처럼 파일 키만 저장                                                                                                                                                                                                             | 사진 2장(운영 키 `ebd0ba18….png`, `3bb482cb….png`) → `image-dev`                                                                                                                                |

넣지 않는 것: 숨긴 강의 Volume 4·5·6, 숨긴 워크숍 4개, 운영의 테스트 강사 "aa", 예전 시드의 Linda. Kim, `Image` 테이블, 운영 영상 썸네일 값.

## 0단계 — 개발용 버킷 1회 준비 (시드와 별개) — 완료

**2026-11-03 완료.** `prisma/seed-files.json`, `scripts/dev-seed-files.mjs`(+ 테스트 6개), `scripts/prepare-dev-seed-files.mjs`를 만들고 실행했다. 미리 보기 14개 → `--apply` 14개 복사(누락 0) → 재실행 0개. 결과 `image-dev` 15개, `document-dev` 6개. 운영 버킷은 그대로(`image` 30개, `document` 7개). 대상 버킷이 `-dev`가 아니거나 원본이 `-dev`면 스크립트가 멈춘다.

준비 전 개발용 버킷 상태:

| 버킷           | 있음                                                             | 없음(채워야 함)                  |
| -------------- | ---------------------------------------------------------------- | -------------------------------- |
| `image-dev`    | `home/` 7개(워크숍·강의 사진, 홈 화면 스크립트 리허설 때 올라감) | 전자책 썸네일 6장, 강사 사진 2장 |
| `document-dev` | 없음                                                             | 전자책 PDF 6개                   |

- 시드가 가리킬 파일 목록을 `prisma/seed-files.json`(이미지 키 15개, 문서 키 6개) 한 곳에 둔다. 시드(`seed-data.ts`)와 준비 스크립트가 같은 목록을 읽는다.
- 새 스크립트 `scripts/prepare-dev-seed-files.mjs`(`npm run storage:prepare-dev-seed-files`)가 없는 파일만 운영 버킷에서 개발용 버킷으로 **같은 키로 서버 안에서 복사**한다(내려받기 없음). 기본은 미리 보기, `--apply`일 때만 복사. 운영 버킷에는 쓰지 않는다.
- 개발용 버킷이 비워지거나 새로 만들어졌을 때만 다시 실행한다. Supabase 대시보드에서 직접 올려도 된다.
- 전자책 PDF는 운영 파일을 그대로 복사한다. 두 버킷 모두 비공개이고 같은 프로젝트라 새로 노출되는 범위는 없다.

## 현재 시드의 문제 (요약)

| 구분        | 문제                                                                                                                      | 위치                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 콘텐츠      | 운영과 다른 예시 콘텐츠: 강의 6개, 강사 3명, 워크숍 8개(예시 제목), 메인 비주얼 예전 문구                                 | `seed.ts` 전반                                 |
| 데이터 오류 | 가격 2800인데 주문 항목은 2800센트(28달러)로 저장                                                                         | `seed.ts:438`, `:942`, `:948`, `:974`          |
| 데이터 오류 | 테스트 계정 upsert 결과가 아니라 고정 id로 주문·리뷰·시청 기록·찜 연결(`relationMode = "prisma"`라 오류 없이 고아 데이터) | `seed.ts:677`, `:743`, `:916`                  |
| 스토리지    | 시드가 버킷을 직접 조회해 썸네일·PDF를 고름. 확장자를 안 봐서 전자책 PDF 자리에 이미지를 고름                             | `seed.ts:42-84`, `:243-275`, `seed-helpers.ts` |
| 정합성      | 워크숍 등록이 워크숍 항목이 없는 주문에 연결됨                                                                            | `seed.ts:927-1005`                             |
| 운영        | 실행 스크립트 없음(Prisma 7은 마이그레이션 후 자동 시드 안 함), 삭제·생성이 트랜잭션 밖                                   | `package.json`, `seed.ts:277` 이후             |

## 작업 단계

커밋은 단계별로 나눈다.

### 1단계 — 버킷 접근 제거와 주소 만들기

- `seed.ts`에서 S3 클라이언트, `listBucketObjects`, 버킷 조회 결과로 썸네일·PDF를 고르는 코드를 모두 지운다. `seed-helpers.ts`의 `selectSeedImageKeys`, `selectSeedEbookKeys`, `createCyclicPicker`와 테스트도 정리한다.
- `seed-helpers.ts`에 순수 함수 두 개를 둔다(단위 테스트 포함).
  - `resolveSeedStorage(env)`: 두 버킷이 `-dev`로 끝나고 다르면 `{ mode: 'dev', imageBucket, ebookBucket, supabaseUrl }`, 아니면 `{ mode: 'local', reason }`.
  - `seedFileUrl(storage, bucketRole, key)`: `mode: 'dev'`면 공개 URL, 아니면 `null`(호출한 곳에서 `/img` 대체 경로 사용).
- 시드 시작 때 모드와 이유를 출력한다. `mode: 'local'`이면 "썸네일은 /img 대체 이미지, 전자책 PDF 없음" 안내.

### 2단계 — 운영 콘텐츠 고정

- 새 파일 `prisma/seed-data.ts`에 위 표의 콘텐츠를 상수로 옮긴다(id, 문구, 분류, 가격, 정렬 값, 파일 키). 파일 키는 `seed-files.json`의 항목을 참조한다.
- `seed.ts`의 예시 상수(`TITLE`, `PROCESS_CONTENT`, `SECTION_TITLES`, `ebooks` 배열, `ebookToc`, `workshopData`, `WORKSHOP_CURRICULUM`, 강사 upsert 3개, 메인 비주얼 3개)를 지우고 `seed-data.ts`를 쓴다.
- **워크숍 날짜**: 운영 날짜 간격을 유지하되, 가장 늦은 워크숍이 시드 실행 7일 뒤가 되도록 전체를 같은 만큼 옮긴다. 상태는 날짜로 정한다(끝났으면 `COMPLETED`, 아니면 `OPEN`). 결과: 완료 3개 + 모집 중 1개(운영과 같음).
- **강사 사진**은 운영처럼 파일 키만 저장한다(이미지 프록시가 설정된 이미지 버킷에서 찾음). `mode: 'local'`이면 `/img/raphael.png`, `/img/instructor-image.png`.

### 3단계 — 테스트 계정과 마이페이지 시나리오

- 테스트 계정(`admin@paceupcareer.com`, `user@paceupcareer.com`)은 이메일로 upsert하고 **결과의 id**를 이후 모든 데이터에 쓴다.
- 리뷰 9개: 공개 강의마다 3개, 두 테스트 계정이 번갈아 작성.
- 대시보드 주문(완료): 강의 3개 + 메인 노출 전자책 3권 + 완료된 워크숍 1개(Mind Training) + 모집 중 워크숍 1개. 금액은 `amountToCents(상품 가격)` 합계.
- 결제 완료 화면용 주문(`cs_test_seed_payment_success`): 강의 2개 + 전자책 1권 + Let's Connect!.
- 워크숍 등록(`UserWorkshop`)은 그 워크숍을 항목으로 가진 주문에 연결한다. 완료된 워크숍은 `attended: true`.
- 시청 기록: Volume 1 전체 완료, Volume 2 일부(마지막 영상 35%).
- 찜: 강의 2개, 전자책 2권, 모집 중 워크숍 1개. 장바구니는 비움.

### 4단계 — 코드 정리

- `main()`을 영역별 함수로 분리: 저장소 모드 결정, 초기화, 메인 비주얼, 강사, 강의, 전자책, 워크숍, 계정, 리뷰, 대시보드.
- 초기화와 생성을 `prisma.$transaction(async (tx) => …, { timeout: 60_000 })`로 묶는다.
- 원시 SQL 삭제는 `tx.courseToInstructor.deleteMany()`로. `UserRole` upsert 제거(마이그레이션이 삽입), 리뷰 중복 삭제 제거, `'OPEN' as unknown as WorkshopStatus` 같은 강제 형변환 제거.
- 섹션·영상은 `createMany`. 종료 처리는 `$disconnect()` 후 `process.exit(1)`.

### 5단계 — 실행 방법과 버킷 선언

- `package.json`: `"db:seed": "prisma db seed"`, `"storage:prepare-dev-seed-files": "node scripts/prepare-dev-seed-files.mjs"`.
- `supabase/config.toml`에 `image-dev`, `document-dev` 선언(운영 버킷은 선언하지 않음). 재생성: `supabase seed buckets --linked --project-ref apnbtkynvquutxdmmkre`.
- `.env.local.example`: `SUPABASE_S3_IMG_BUCKET=image-dev`, `SUPABASE_S3_EBOOK_BUCKET=document-dev`.
- `README.md` "Seeding the Database": 처음 한 번 `storage:prepare-dev-seed-files`, 마이그레이션 후 `npm run db:seed` 직접 실행, 로컬 DB에서만 실행됨, 시드는 버킷에 접근하지 않고 `-dev` 버킷 주소만 저장함, 콘텐츠는 2026-11-03 운영 기준으로 고정됨, 워크숍 날짜는 실행 시점 기준으로 이동.

## 검증

1. `npm test -- --run`, `npm run typecheck`, `npm run build`, `npm run lint`
2. **버킷 미접근 확인**: S3 접속 변수(`SUPABASE_S3_ACCESS_KEY` 등)를 비운 채 시드를 실행해도 성공해야 한다.
3. 로컬 Docker DB에서 시드 2회 연속 실행 → 결과 동일
4. 0단계 이후 로컬 `npm run db:check-content`(버킷 `-dev`) 실패 0건 → 시드가 가리키는 파일이 모두 개발용 버킷에 있음
5. 운영과 비교: 로컬 공개 API(`/api/courses`, `/api/ebooks`, `/api/workshops`)의 제목·분류·가격·순서가 운영과 같음(워크숍 날짜와 강의 순서만 다름). 로컬에서 `npm run check:public-pages -- --base-url=http://localhost:3001` 실패 0건
6. 버킷 변수를 `image`/`document`로 바꿔 실행 → 저장소 주소 대신 `/img` 대체 이미지, 안내 출력
7. 테스트 계정을 다른 id로 미리 만든 뒤 시드 → 대시보드 데이터가 그 계정에 붙음
8. Aside 브라우저: 홈·목록·상세가 운영과 같은 구성, 마이페이지 주문 금액 $2,800, 결제 완료 화면, 전자책 뷰어에서 PDF 열림

## 운영에서 함께 발견한 점 (시드 범위 밖)

- 운영 Volume 1·3의 추천 링크가 숨긴 강의(Volume 6, 4)로 간다. 상세 화면에 해당 링크가 나오고 누르면 "오류: 코스를 찾을 수 없습니다."가 보인다. 운영 데이터도 같은 방식으로 고치는 것이 좋다.
- 운영 강의 6개와 워크숍 8개의 `orderKey`가 모두 `a0`이라 표시 순서가 정해져 있지 않다(현재 강의는 Volume 2, 3, 1 순). 지금 순서로 괜찮다는 결정.
- 운영 영상 36개의 `thumbnail`이 예전 강의 썸네일 파일을 가리킨다. 화면에는 안 보이지만 이 파일들이 저장소 정리 대상에서 빠진다.
- 운영에 테스트 강사 "aa"가 있다(숨긴 워크숍에만 연결).
- 숨긴 강의 상세 페이지는 응답 200에 한국어 오류 문구가 나온다. 워크숍처럼 404로 바꾸려면 코드 수정 필요.

## 구현 결과 (2026-11-03)

- `prisma/seed-data.ts`: 운영 공개 콘텐츠를 로컬 사본에서 한 번 옮겨 적음(메인 비주얼 3, 강사 2, 강의 3, 섹션 9, 영상 36, 리뷰 9, 전자책 6, 워크숍 4). 날짜는 UTC. 강의 추천 링크 중 숨긴 강의로 가는 2개 제외. 생성에 쓴 스크립트는 저장소에 넣지 않음.
- `prisma/seed-helpers.ts`: 버킷 조회 함수 제거, `resolveSeedStorage`·`seedFileUrl`·`workshopDayShift`·`shiftDays`·`seededWorkshopStatus` 추가(+ 테스트). `prisma/seed-data.test.ts`: 시드가 쓰는 파일 키와 `seed-files.json`이 정확히 같은지, 추천 링크·강사 연결, id·정렬 값 중복, 계정 데이터 없음 확인.
- `prisma/seed.ts`: 다시 작성. S3 클라이언트 없음, 한 트랜잭션, 테스트 계정 upsert 결과 id 사용, 주문 금액 `amountToCents`, 워크숍 등록은 해당 워크숍을 산 주문에 연결.
  - 대시보드 주문: 강의 3 + 메인 전자책 3 + 지난 워크숍 2(1개 참석) = 16,840달러(1684000센트)
  - 결제 완료 주문(`cs_test_seed_payment_success`): 강의 2 + IT 전자책 + 모집 중 워크숍 = 8,420달러
  - 시청 기록 17개(Volume 1 전부, Volume 2 5개), 찜 5개, 장바구니 0
- `package.json`: `db:seed`, `storage:prepare-dev-seed-files`. `supabase/config.toml`: `image-dev`, `document-dev` 선언. `README.md` 시드 절 갱신.
- `.env.local.example`은 권한 설정상 수정하지 못함 → `SUPABASE_S3_IMG_BUCKET=image-dev`, `SUPABASE_S3_EBOOK_BUCKET=document-dev`를 직접 추가해야 함.

검증:

| 항목                                            | 결과                                                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 테스트·타입 검사·린트·빌드                      | 모두 통과                                                                                                |
| 로컬 시드 2회                                   | 콘텐츠·주문 해시 동일, 실행 약 1.6초                                                                     |
| S3 접속 변수 없이 실행                          | 성공, 결과 동일                                                                                          |
| 버킷 변수를 `image`/`document`로 실행           | `/img` 대체 이미지, 전자책 PDF 비움, 안내 출력                                                           |
| 테스트 계정을 다른 id로 바꾼 뒤 실행            | 주문 2·시청 기록 17이 그 id에 붙음                                                                       |
| 로컬 `db:check-content`(`-dev` 버킷)            | 60개 값, 실패 0                                                                                          |
| 로컬 공개 API vs 운영                           | 강의·전자책·메인 전자책·워크숍 목록 내용 같음. 강의 순서만 다름(로컬 1·2·3, 운영 2·3·1)                  |
| 로컬 `check:public-pages`                       | 33개 요청, 실패 0                                                                                        |
| 로컬 홈 화면                                    | 첫 화면·워크숍·강의·전자책 구성 운영과 같음, 깨진 이미지 0                                               |
| 로그인 화면(마이페이지, 결제 완료, 전자책 뷰어) | **미확인.** 로컬 Aside 세션이 로그인되어 있지 않고, 로그인은 Clerk 계정 비밀번호가 필요해 직접 확인 필요 |
