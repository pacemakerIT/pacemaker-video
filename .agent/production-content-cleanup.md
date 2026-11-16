# 운영 콘텐츠 데이터 정리 (2026-11)

운영 사이트: https://www.paceupcareer.com · Supabase 프로젝트 `apnbtkynvquutxdmmkre`

## 배경

- 운영 DB의 상품 데이터(강의 6, 전자책 6, 영상 72, 강사 3)는 예전 시드로 만든 데이터다. 그대로 쓰기로 결정했다(가격 $2,800 포함).
- 전자책 6권의 `bucketUrl`이 가짜 주소(`example-bucket.s3.amazonaws.com`)라 앱이 `ebookId`를 파일 키로 대신 쓴다. `document` 버킷에 `ebook-1`, `ebook-2`만 있어 나머지 4권은 PDF가 열리지 않는다.
- `Image` 행 4개가 존재하지 않는 `undefined` 버킷을 가리킨다. 같은 이름의 빈 버킷 9개가 운영 스토리지에 생겼다.
- 지난 워크숍 2개(2026-05-15, 2026-08-10)가 아직 `OPEN`이다. 앱은 상태를 날짜로 갱신하지 않는다.
- 운영 주문 91건·사용자 78명이 있고 주문 항목은 모두 현재 상품 id를 참조한다. **상품 id는 바꾸지 않는다.**

## 도구

| 명령                                                 | 하는 일                                                                                                              | 쓰기             |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `npm run db:check-content`                           | 썸네일·전자책 PDF가 실제 파일로 연결되는지, 가짜 값, 지난 워크숍 상태 점검. 실패 시 종료 코드 1                      | 없음             |
| `npm run check:public-pages -- --base-url=<사이트>`  | 목록 페이지, 공개 API, 모든 상세 페이지, 모든 썸네일(이미지 프록시) 응답 점검                                        | 없음             |
| `npm run db:cleanup-production-content [-- --apply]` | 전자책 `bucketUrl` 연결, `undefined` 버킷 `Image` 행 삭제, 지난 워크숍 `COMPLETED` 처리. 한 트랜잭션                 | `--apply`일 때만 |
| `npm run storage:archive-unreferenced [-- --apply]`  | DB가 참조하지 않는 `image`/`document` 파일을 `archive` 버킷(`<버킷>/<키>`)으로 이동, 파일 이름처럼 생긴 빈 버킷 삭제 | `--apply`일 때만 |

모두 `.env`를 읽는다. 로컬 `.env`는 `-dev` 버킷을 가리키므로 운영 대상으로 실행할 때는 명령마다 버킷과 DB를 지정한다.

## 전자책 PDF 연결 (임의 지정)

| ebookId   | 전자책                                                            | PDF (`document` 버킷)                                      |
| --------- | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| `ebook-1` | The 94% Success Formula: A Proven Approach… (MARKETING)           | `ebook-1` (기존 그대로)                                    |
| `ebook-2` | What Every Designer Should Know… (DESIGN)                         | `ebook-2` (기존 그대로)                                    |
| `ebook-3` | A Resume That Gets You Hired in the North American Public Sector  | `ebooks/70ae8c6c-8159-464d-a02e-0dfe959a7af2.pdf` (5.04MB) |
| `ebook-4` | The 94% Success Formula: Resumes That Win Jobs and Interviews     | `b16eceb6-8fc2-485d-ae1c-aa58cef31e0a.pdf` (1.52MB)        |
| `ebook-5` | A practical guide to Interviews for finance and accounting roles… | `TEST_2025052603 - 254926 16:49:24` (0.74MB)               |
| `ebook-6` | The 94% success approach: communicate your value…                 | `Celpip_template.pdf` (3쪽)                                |

같은 내용의 복사본(`ebooks/87320a2a…`, `ebooks/e102d4e2…`, `d7a8fdbf…`, `TEST_… 16:49:30`, `TEST_… 16:51:29`)은 연결하지 않고 archive로 옮긴다. 실제 원고가 정해지면 관리자 화면에서 교체한다.

## 진행 상황

| 단계                   | 상태                                                                                                                                                                                                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. 백업                | 완료. `~/Backups/pacemaker-video/2026-11-02/` (`schema.sql`, `public-data.sql`, 권한 600). Supabase 백업 목록은 비어 있고 PITR은 꺼져 있다                                                                                                                                                                             |
| 2. 정리 전 점검        | 완료. 데이터 점검 실패 16건(가짜 `bucketUrl` 6, 없는 PDF 4, `undefined` 버킷 `Image` 4, 지난 워크숍 2). 공개 페이지 47개 요청 실패 0건                                                                                                                                                                                 |
| 3. 리허설              | 완료. 운영 덤프를 로컬 `prod_copy` DB에 복원 → 정리 12건 적용 → 데이터 점검 실패 0건 → 재실행 시 변경 0건. 보관 미리 보기: `image` 34개(26.5MB), `document` 112개(204MB), 빈 버킷 9개. `prod_copy`는 삭제함                                                                                                            |
| 4. `archive` 버킷 생성 | 완료(비공개)                                                                                                                                                                                                                                                                                                           |
| 5. 운영 적용           | 완료(2026-11-02). 12건 적용: 전자책 `bucketUrl` 6, `Image` 행 삭제 4, 워크숍 `COMPLETED` 2. 운영 DB를 다시 읽어 값 확인(`Image` 8행, `example-bucket`·`undefined` 0건)                                                                                                                                                 |
| 6. 운영 검증           | 데이터 점검 실패 0건, 공개 페이지 47개 요청 실패 0건, 연결한 PDF 6개 모두 `application/pdf`로 존재, 지난 워크숍 중 `COMPLETED` 아닌 것 0건. **로그인 후 PDF 열림 확인은 남음**                                                                                                                                         |
| 7. 스토리지 보관 이동  | 완료(2026-11-03). `archive`로 146개(230.5MB) 이동(`image/` 34, `document/` 112), 미리 보기 목록과 정확히 일치. 빈 버킷 9개 삭제. 남은 파일: `image` 23개, `document` 7개(PDF 6 + 폴더 표시 파일). DB가 가리키는 저장소 주소 34개·이미지 키 82개 모두 존재. 공개 페이지 47개 요청 실패 0건. `archive`는 2~4주 뒤 비운다 |

## 운영 적용 절차

운영 DB 주소는 Vercel `Production`의 `DIRECT_URL`이다. 셸에만 설정하고 파일로 남기지 않는다.

```bash
export DIRECT_URL='<Vercel Production DIRECT_URL>'
export SUPABASE_S3_IMG_BUCKET=image SUPABASE_S3_EBOOK_BUCKET=document

npm run db:check-content                              # 정리 전: 실패 16건 예상
npm run db:cleanup-production-content                 # 미리 보기: 12건 예상
npm run db:cleanup-production-content -- --apply
npm run db:check-content                              # 실패 0건이어야 함
npm run check:public-pages -- --base-url=https://www.paceupcareer.com
```

로그인 확인(직접): 전자책을 구매한 테스트 계정으로 로그인해 6권 PDF가 모두 열리는지 본다.

검증 통과 후:

```bash
npm run storage:archive-unreferenced                  # 미리 보기
npm run storage:archive-unreferenced -- --apply
npm run db:check-content
npm run check:public-pages -- --base-url=https://www.paceupcareer.com
unset DIRECT_URL SUPABASE_S3_IMG_BUCKET SUPABASE_S3_EBOOK_BUCKET
```

## 되돌리기

- DB: 정리 스크립트 미리 보기 출력에 바뀌기 전 값이 있다. 전체 복구는 `~/Backups/pacemaker-video/2026-11-02/public-data.sql`.
- 스토리지: `archive` 버킷의 `<버킷>/<키>`를 원래 버킷의 `<키>`로 복사한다. 2~4주 뒤 문제가 없으면 `archive`를 비운다.

## 후속 작업

- 워크숍 상태를 날짜로 계산하도록 변경(지난 워크숍이 계속 `OPEN`으로 남는 문제).
- Vercel `Preview`가 운영 DB를 쓰고 버킷 변수가 없음 — 미리보기에서 관리자 기능을 쓰면 운영 데이터가 바뀐다.
