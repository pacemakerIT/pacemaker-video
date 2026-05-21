# 영어 카피 가이드 (Pacemaker Test)

정적 랜딩 `main.html` 등에 쓰는 **영어 문장 스타일**을 맞추기 위한 규칙이다.  
색·글꼴·간격은 `design-system.md`를 보고, **말투·단어는 이 파일**을 본다.

AI에게 시킬 때: **§금지 표현**, **§단어 통일**, **§필수 규칙**만 복사해도 된다.

---

## 톤

- **미국 영어**, 말하듯 짧게. 홍보 브로슈어 느낌 내지 않기.
- **문장 짧게.** 한 문장에 한 가지 생각.
- **you**로 사용자에게 말하는 느낌이 들면 좋고, Pacemaker가 함께한다는 뜻은 **we / us**도 가능.
- 구체적으로: _resume, interview, mentor, job search_ 같은 말 쓰기. _solution, journey_ 같은 막연한 단어는 피하기.

---

## 필수 규칙

1. 사용자에게 보이는 문장에 **대시(—, em dash) 쓰지 않기.** 마침표로 끊거나 쉼표로 이어 쓰기.
2. **상표명 `Pacemaker`** 철자 고정. 번역하지 않음.
3. 지역은 **North America** 또는 **U.S. and Canada**처럼 구체적으로. “해외” 한 단어로 흐리게 쓰지 않기.
4. **CTA 버튼**은 짧고 동사로 시작: 예) `Browse courses`, `Log in and start learning`, `View all workshops`, `Learn more`, `Sign up`.
5. 워크숍 정보 줄은 패턴 통일: `Date · …` / `Where · …` / `Host · …` (가운데 점 `·`은 괜찮음.)

---

## 금지 표현 (AI 티·광고 티 나는 말)

아래는 **쓰지 말 것** (영어 그대로 피할 목록):

`all in one`, `all-in-one`, `unlock`, `leverage`, `empower`, `cutting-edge`, `game-changer`, `take your … to the next level`, `delve`, `realm`

추가로: **대시로 긴 문장 이어 붙이기**, **“한곳에 다 있다” 류**도 피하기.

---

## 문장 부호·철자

- 대시(—) 대신 **마침표** 또는 **쉼표**.
- 본문에서 따옴표 꼭 필요할 때만. 가능하면 직선 `"` .
- 영어 철자는 **미국식** 통일 (예: behavior, organize, center — 페이지에 해당 단어가 나올 때).

---

## 단어 통일 (한글 뜻 → 쓸 영어)

| 뜻          | 쓸 말                                                   | 비고                                    |
| ----------- | ------------------------------------------------------- | --------------------------------------- |
| 서비스 이름 | Pacemaker                                               | 대문자 P                                |
| 이력서      | resume                                                  | UK 전용 페이지 아니면 CV 안 씀          |
| 면접 / 모의 | interview, mock interview                               | 연습은 mock interview                   |
| 멘토        | mentor                                                  | 제품에서 coach 쓰기로 정했을 때만 coach |
| 온라인 강의 | course, online course                                   |                                         |
| 워크숍      | workshop                                                |                                         |
| 전자책      | e-book                                                  | 하이픈 붙임                             |
| 로그인      | Log in (동작), Login (명사는 버튼에만 가끔)             | 예: _Log in and start learning_         |
| 찜          | Save / Saved                                            | 접근성 라벨                             |
| 북미 취업   | job search in North America, get hired in North America | 문맥에 맞게                             |

---

## 자주 쓰는 문장 틀 (영어 예문)

- **히어로 아래 한 줄:** 짧은 혜택 한 문장.  
  예: `Help with skills, your resume, and interviews.`
- **비디오 아래 소개:** 문제 한두 문장 → Pacemaker가 뭘 하는지.  
  예: `Finding a job here can feel confusing. Where do you even start?` 다음에 멘토 이야기.
- **강의 카드 (강사 1인칭):**  
  예: `I've tried a lot of paths in my 20s and 30s. I can help you build skills, write applications, and prep for interviews, one step at a time.`
- **“전체 보기” 링크:** `View all workshops` / `View all courses` / `View all e-books` 처럼 **View all**으로 통일.

---

## 접근성 (영어는 고정)

- 찜 버튼: `aria-label="Save"` / `aria-label="Saved"`
- 영상 iframe `title`: 예 `Pacemaker intro video`
- 스킵 링크: `Skip to content` (표준 영어 그대로)

---

## 나쁜 예 → 좋은 예

| 나쁜 예                               | 좋은 예                                                |
| ------------------------------------- | ------------------------------------------------------ |
| `…prep—all in one place`              | `Help with skills, your resume, and interviews.`       |
| `confusing—where do you` (한 줄 대시) | 마침표로 끊고 다음 문장: `confusing. Where do you`     |
| `Leverage … unlock …`                 | `Get help from people who already work in your field.` |

---

## 다른 문서와 역할

| 파일               | 역할                       |
| ------------------ | -------------------------- |
| `design.md`        | 레이아웃, 캐러셀, 스크립트 |
| `design-system.md` | 색, 폰트, 컴포넌트         |
| **이 파일**        | 영어 말투·단어만           |

---

## 배포 전 체크

- [ ] 화면에 보이는 문장에 대시(—) 없음
- [ ] 위 **금지 표현** 목록에 안 걸림
- [ ] CTA가 짧은 동사형 패턴과 맞음
- [ ] Pacemaker 철자 확인
- [ ] 새로 쓴 단어는 미국 철자로 통일
