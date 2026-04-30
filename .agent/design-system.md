# Design System — Pacemaker Apply

에이전트가 새 페이지를 만들거나 기존 페이지 디자인을 수정할 때 **반드시** 따라야 하는 디자인 규칙이다.
이 파일에 정의된 토큰과 규칙이 유일한 정답이다. 임의로 새 값을 만들지 말 것.

---

## 1. Color Tokens

`globals.css` `@theme`에 정의된 값이 **유일한 공식 색상**이다. 인라인 hex 사용 금지.

| 토큰 (Tailwind 클래스) | CSS 변수               | Hex       | 용도                           |
| ---------------------- | ---------------------- | --------- | ------------------------------ |
| `navy`                 | `--color-navy`         | `#00263b` | 주요 텍스트, 배경, 브랜드 다크 |
| `teal`                 | `--color-teal`         | `#00adbd` | 액센트, 아이콘, 링크, 강조     |
| `orange`               | `--color-orange`       | `#ff4f02` | CTA 버튼, 강조 액션            |
| `orange-hover`         | `--color-orange-hover` | `#e04400` | CTA 버튼 hover 상태            |
| `gray-soft`            | `--color-gray-soft`    | `#f2f4f7` | 섹션 배경, 카드 배경           |
| `text-body`            | `--color-text-body`    | `#475467` | 기본 본문 텍스트 토큰          |

### 색상 적용 원칙

- `globals.css`는 **색상 토큰만 정의**한다. `body`, `h1-h4` 같은 전역 selector에 텍스트 색을 넣지 말 것.
- 페이지/컴포넌트는 **자기 텍스트 색을 직접 명시**해야 한다. 특히 hero, dark section, modal, checkout 결과 페이지처럼 배경이 바뀌는 구간은 필수다.
- 상위 컨테이너의 암묵적 상속에 기대지 말고, 제목/본문/보조 텍스트/CTA를 각각 명시한다.
- 리팩터링 시 styled-jsx → Tailwind 전환을 하더라도, 원본 색상값과 opacity(`rgba(...)`)를 그대로 유지해야 한다.
- Tailwind 우선순위 충돌이 의심되면 `text-*`를 늘리는 대신, 해당 컴포넌트에서 색 source를 하나로 정리한다.

### 허용된 보조 색상 (인라인만, 토큰 없음)

아래는 기존 코드에만 존재하는 one-off 값이다. **새 페이지에서 신규 추가 금지.** 기존 컴포넌트 유지 시에만 허용.

- 텍스트: `#101828`, `#344054`, `#667085`, `#98a2b3` (gray scale)
- 별점: `#FDB022` (star rating only)
- 가격 배지: `#FEF0C7`, `#DC6803` (pricing badge only)

### 투명도 조합 (허용된 패턴)

```
bg-navy/10    → rgba(0,38,59,0.10)
bg-teal/10    → rgba(0,173,189,0.10)
bg-orange/10  → rgba(255,79,2,0.10)
border-navy/10, border-navy/15, border-navy/20
border-teal/20
border-white/10, border-white/15, border-white/20
```

### 배경 그라디언트 (기존 페이지 패턴, 신규 시 참고)

```
// 섹션 subtle 배경
bg-[radial-gradient(circle_at_top_right,rgba(0,173,189,0.08)_0%,transparent_50%)]

// 히어로 그라디언트
bg-[linear-gradient(135deg,rgba(0,38,59,0.04)_0%,rgba(0,173,189,0.1)_55%,rgba(255,79,2,0.08)_100%)]
```

---

## 2. Typography Tokens

### 폰트 패밀리

| 용도         | CSS 변수                                 | 설정               |
| ------------ | ---------------------------------------- | ------------------ |
| 헤딩 (h1–h4) | `--font-heading` → `var(--font-poppins)` | 700 기본, 800 강조 |
| 본문         | `--font-body` → `var(--font-inter)`      | 400 기본           |

**규칙:**

- h1–h4는 globals.css에서 `font-family: var(--font-poppins), "Poppins", sans-serif`이 자동 적용됨. (Tailwind v4 `@theme` 변수 체인 우회를 위해 직접 참조)
- h1–h4는 **폰트만 전역 적용**된다. 색상은 자동 적용되지 않으므로 각 컴포넌트에서 `text-*` 또는 동등한 방식으로 지정해야 한다.
- **모든 CTA·Submit·Book·Register 버튼**은 반드시 `font-[family-name:var(--font-heading)]` 명시 필수. button 태그는 자동 적용되지 않으므로 빠뜨리면 Source Sans 3(본문 폰트)로 렌더링됨.
- **가격 숫자, 카운트다운 숫자** 등 강조 수치 요소에도 `font-[family-name:var(--font-heading)]` 또는 `font-heading` 명시 필수.
- p, span에서 Poppins를 쓸 경우: `font-[family-name:var(--font-heading)]` 명시.
- **본문 폰트**: 브랜드 가이드상 Acumin Variable Concept이나, 웹 프로젝트에서는 **Source Sans 3**를 공식 대체 폰트로 사용함 (동일 디자이너 Robert Slimbach 작품, 유사한 휴머니스트 비율). CSS 변수명은 `--font-inter`를 유지하여 하위 호환성 보존. Google Fonts 기반으로 Next.js에 로드되어 있으므로 변경 금지.
- **폰트 변수 위치**: `--font-poppins`, `--font-inter` 변수는 반드시 `<html>` 요소에 className으로 적용되어야 함. `@theme`이 `:root` 레벨에서 참조하므로 `<body>`에 적용 시 CSS 변수 체인이 끊김.

### 타이포그래피 스케일

```
// 히어로 타이틀
mobile: text-[2rem] ~ text-[2.5rem]
tablet(md): text-[3.5rem] ~ text-[3.8rem]

// 섹션 타이틀 (h2)
mobile: text-[2.2rem]
tablet(md): text-[2.75rem]

// 서브섹션 타이틀 (h3)
text-xl ~ text-[1.4rem]

// 본문 대
text-[1.125rem] ~ text-[1.2rem]

// 본문 소
text-[1rem] ~ text-[1.1rem]

// 캡션 / 레이블
text-[0.85rem] ~ text-[0.9rem]

// 히어로 상단 레이블 / hero badge (uppercase)
mobile: text-[0.82rem]
tablet(md): text-[0.9rem]

// 섹션 badge / 카드 메타 레이블 (uppercase)
text-xs ~ text-[0.8rem]
```

### 폰트 웨이트

| 클래스           | 값  | 용도                     |
| ---------------- | --- | ------------------------ |
| `font-normal`    | 400 | 본문                     |
| `font-medium`    | 500 | 강조 본문, 리스트 아이템 |
| `font-semibold`  | 600 | 서브 헤딩, 버튼          |
| `font-bold`      | 700 | 헤딩 기본                |
| `font-extrabold` | 800 | 히어로 타이틀 강조       |

### Line Height

| 클래스            | 값    | 용도                     |
| ----------------- | ----- | ------------------------ |
| body 기본         | `1.3` | globals.css body 전역    |
| `leading-tight`   | 1.25  | 헤딩, 숫자               |
| `leading-[1.3]`   | 1.3   | 히어로 카피              |
| `leading-[1.35]`  | 1.35  | 본문 보조                |
| `leading-relaxed` | 1.625 | 설명 텍스트, testimonial |

### Letter Spacing

| 클래스                                    | 용도                                    |
| ----------------------------------------- | --------------------------------------- |
| `tracking-tight`                          | 헤딩                                    |
| `tracking-wide`                           | 기존 소형 badge 레거시 값               |
| `tracking-[0.08em]`                       | 버튼 레이블 소                          |
| `tracking-[0.16em]` ~ `tracking-[0.18em]` | 소형 uppercase 섹션 레이블              |
| `tracking-[0.2em]`                        | 히어로 상단 레이블 / 주요 landing badge |

---

## 3. Spacing Tokens

### 섹션 단위 스페이싱

```
// 섹션 내부 padding (section 태그)
py-16 md:py-24    → 표준 섹션
py-12 md:py-20    → 컴팩트 섹션
py-8              → 푸터, 작은 영역

// 섹션 헤더 하단 마진
mb-16 ~ mb-20     → 섹션 타이틀 → 콘텐츠

// 콘텐츠 내부 수직 간격
space-y-2 ~ space-y-5
mb-2 ~ mb-8
```

### 컴포넌트 단위 스페이싱

```
// 카드 padding
p-6               → 소형 카드
p-8               → 표준 카드
p-10 ~ p-12       → 대형 카드 / 히어로 섹션

// 버튼 padding
px-6 py-3         → 보조 버튼
px-8 py-4         → 주 버튼
px-9 py-3         → floating CTA

// 인풋 padding
px-4 py-3

// 배지 padding
py-2 px-5         → 기본
py-2.5 px-8       → 대형 (md 이상)
```

### 그리드 Gap

```
gap-4 ~ gap-6     → 밀집 그리드 (아이콘, 배지)
gap-6             → 카드 그리드 (outcomes)
gap-10            → 피처 그리드
gap-[30px]        → 테스티모니얼
```

---

## 4. Layout Tokens

### 컨테이너 폭

| 용도               | 클래스                          |
| ------------------ | ------------------------------- |
| 기본 섹션          | `max-w-[1200px] mx-auto`        |
| 히어로             | `max-w-[1400px] mx-auto`        |
| 텍스트 블록 (헤더) | `max-w-[800px] ~ max-w-[840px]` |
| 가격 섹션          | `max-w-[500px]`                 |
| 로드맵             | `max-w-[900px]`                 |
| 모달               | `max-w-lg`                      |

**규칙:** 모든 섹션 컨테이너는 `mx-auto px-6` (모바일) 패턴 사용. 가로 패딩 기본값 `px-6`.

### 그리드 패턴

```
// 표준 3컬럼 그리드
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// 2컬럼 그리드
grid grid-cols-1 md:grid-cols-2

// 로드맵 (레이블 + 콘텐츠)
grid grid-cols-1 md:grid-cols-[220px_1fr]

// 카운트다운
grid grid-cols-4
```

### 반응형 브레이크포인트

| 접두사   | 기준    | 용도                        |
| -------- | ------- | --------------------------- |
| _(없음)_ | 0px~    | 모바일 기본                 |
| `sm:`    | 640px~  | 미세 조정 (패딩, 폰트)      |
| `md:`    | 768px~  | 레이아웃 전환 (그리드, nav) |
| `lg:`    | 1024px~ | 대형 레이아웃 (멀티 컬럼)   |

**규칙:** `xl:` 브레이크포인트는 현재 사용하지 않는다. 모바일 퍼스트로 작성.

### 반응형 작업 기준 폭

디자인 시안과 구현 검수에서 사용할 **기준 화면 폭(reference width)** 은 아래 값을 따른다.

| 구분             | 기준 폭  | 설명                                            |
| ---------------- | -------- | ----------------------------------------------- |
| 모바일 기준      | `375px`  | 기본 모바일 시안 기준. 가장 우선해서 맞추는 폭  |
| 모바일 최소 검수 | `320px`  | 작은 기기에서도 레이아웃이 무너지지 않는지 확인 |
| 모바일 확장 검수 | `414px`  | 큰 폰 폭에서 여백, 버튼 폭, 카드 비율 확인      |
| 태블릿 참고      | `768px`  | `md:` 전환 시작점. 2열/구조 변화 확인           |
| 데스크탑 기준    | `1920px` | 기본 데스크탑 시안 기준                         |

**실무 규칙:**

- 새 시안을 잡을 때는 기본적으로 `Desktop 1920px / Mobile 375px` 조합을 사용한다.
- 구현은 모바일 퍼스트로 작성하되, 최소 `320px`, 기본 `375px`, 확장 `414px`에서 모두 검수한다.
- `768px`부터는 태블릿/중간 레이아웃 확인 구간으로 보고, `md:` 전환이 자연스러운지 점검한다.
- 데스크탑 시안이 `1920px` 기준이어도 실제 콘텐츠 최대 폭은 기존 컨테이너 토큰(`max-w-[1200px]`, `max-w-[1400px]`)을 우선한다. 즉, `1920px`는 아트보드 기준이며 콘텐츠 폭 토큰을 임의로 늘리지 않는다.
- 작은 화면에서 요소를 억지로 축소해 맞추기보다, 줄바꿈 변경, 스택 전환, 여백 재조정으로 해결한다.

### 최소 높이

```
min-h-screen          → 페이지 전체
min-h-[calc(100vh-135px)]  → 히어로 섹션 (nav 높이 제외)
```

---

## 5. Border Tokens

### Border Radius

| CSS 변수 / 클래스                                    | 값       | 용도                                           |
| ---------------------------------------------------- | -------- | ---------------------------------------------- |
| `rounded-none` / `--radius-card: 0px`                | 0px      | **카드 기본값** (sharp edge)                   |
| `rounded-2xl` / `rounded-btn` / `--radius-btn: 16px` | **16px** | **모든 CTA·제출·행동 버튼** ← 유일한 버튼 반경 |
| `rounded-full`                                       | 9999px   | 아바타, 소셜 아이콘, 태그 pill 배지            |
| `rounded-xl`                                         | 12px     | 폼 인풋, 소형 UI 요소                          |
| `rounded-[20px]`                                     | 20px     | 호스트 프로필 이미지                           |

> ⚠️ **버튼 radius 확정 규칙 — 절대 준수**
>
> 모든 CTA·Registration·Submit·Book 등 행동 버튼의 `border-radius`는 **`rounded-2xl` (= 16px)** 단 하나만 사용한다.
> Tailwind 토큰 `rounded-btn`도 `--radius-btn: 16px`로 동일하게 설정되어 있으므로 `rounded-btn` 또는 `rounded-2xl` 모두 허용.
> `rounded-full`(pill), `rounded-lg`, `rounded-3xl` 등 **다른 값은 버튼에 절대 사용 금지.**
> 이 값은 기존 배포 컴포넌트(PricingSection, WaitlistModal, FloatingCTA, ServiceModal)의 실제 구현 기준이며, HTML 프로토타입과도 일치해야 한다.

**카드 규칙:** 카드는 무조건 `rounded-none`. 이는 브랜드 아이덴티티 핵심이므로 변경 금지.

### Border Color

```
// 카드 / 섹션 구분선
border-gray-100
border-gray-200
border-[#eaecf0]

// 브랜드 컬러 보더 (opacity 조합)
border-navy/10, border-navy/15, border-navy/20
border-teal/20

// 다크 배경 위
border-white/10, border-white/15, border-white/20
```

---

## 6. Shadow Tokens

### 공식 토큰

| CSS 변수        | 값                               | 용도             |
| --------------- | -------------------------------- | ---------------- |
| `--shadow-card` | `0 10px 30px rgba(0,38,59,0.08)` | 카드 기본 그림자 |

### 허용된 인라인 Shadow 패턴

```
// ★ CTA 버튼 기본 shadow (career-brew 표준 — 인라인 버튼)
shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)]      → 오렌지 버튼
shadow-[0_10px_25px_-5px_rgba(0,173,189,0.35)]    → 틸 버튼

// CTA 버튼 hover shadow (scale 시 함께 커짐)
shadow-[0_14px_28px_-5px_rgba(255,79,2,0.38)]     → 오렌지 hover
shadow-[0_14px_28px_-5px_rgba(0,173,189,0.4)]     → 틸 hover

// 모달 Submit 버튼 (w-full, 소형 shadow)
shadow-[0_4px_12px_rgba(255,79,2,0.3)]

// 히어로 비디오
shadow-[0_30px_70px_rgba(0,38,59,0.12)]     → 데스크탑
shadow-[0_15px_45px_rgba(0,38,59,0.18)]     → 모바일

// 카드 hover
shadow-[0_20px_40px_rgba(0,38,59,0.12)]

// 체크아웃 / 결제 카드
shadow-[0_20px_45px_-30px_rgba(0,38,59,0.45)]

// testimonial
shadow-[0_4px_6px_rgba(0,0,0,0.02)]

// Pricing (대형 강조)
shadow-[0_24px_48px_rgba(0,0,0,0.2)]

// Floating CTA
shadow-[0_-4px_20px_rgba(0,0,0,0.05)]
```

**규칙:** 모든 shadow의 베이스 색상은 `rgba(0,38,59,...)` (navy) 또는 `rgba(255,79,2,...)` (orange)다. 검정(`rgba(0,0,0,...)`)은 미세한 값에만 허용.

---

## 7. Z-Index Scale

| 값         | 용도                          |
| ---------- | ----------------------------- |
| `z-[9999]` | Skip to content 링크 (접근성) |
| `z-[2000]` | 모달 오버레이                 |
| `z-[1000]` | Floating CTA 버튼             |
| `z-[100]`  | 네비게이션 바                 |
| `z-10`     | 히어로 내부 콘텐츠 레이어     |
| `z-0`      | 배경 레이어                   |

---

## 8. Animation Rules

### GSAP 기본 설정 (ScrollTrigger)

```ts
// 섹션 헤더 진입
{ y: 30, opacity: 0, duration: 1, ease: "power2.out" }
ScrollTrigger: { start: "top 90%" }

// 카드 리스트 stagger
{ y: 40, opacity: 0, stagger: 0.15, duration: 0.8, ease: "back.out(1.2)" }
ScrollTrigger: { start: "top 85%" }

// 가로 슬라이드 진입
{ x: -30/30, opacity: 0, stagger: 0.2, duration: 0.8 }
ScrollTrigger: { start: "top 80%" }

// Pricing 강조 카드
{ y: 60, scale: 0.95, opacity: 0, duration: 1, ease: "back.out(1.2)" }
ScrollTrigger: { start: "top 70%" }

// Floating CTA 진입
{ y: 100, opacity: 0, delay: 2, duration: 1, ease: "power4.out" }
```

### CSS 애니메이션 (globals.css 등록된 것만 사용)

```css
/* float: 장식 요소 부유 */
animation: float 3s ease-in-out infinite;

/* scroll: 테스티모니얼 무한 스크롤 */
animation: scroll 80s linear infinite;

/* fadeIn: 모달 배경 */
animation: fadeIn 0.2s ease-out forwards;

/* slideUp: 모달 패널 */
animation: slideUp 0.3s ease-out forwards;
```

### Transition 클래스 패턴

```
transition-all duration-300           → 기본 interactive 요소
transition-colors duration-300        → 색상만 변하는 hover
transition-transform duration-500     → 이미지 스케일/회전
transition-[transform,box-shadow] duration-300  → 카드 hover
```

### Hover 상태 규칙

```
// 카드 lift
hover:-translate-y-[10px]

// 버튼 미세 lift
hover:-translate-y-[3px]

// 이미지 확대
hover:scale-105

// 이미지 회전 변화
-rotate-6 → hover:-rotate-2
```

---

## 9. Icon Rules

| 크기        | 용도                    |
| ----------- | ----------------------- |
| `w-4 h-4`   | 인라인 텍스트 내 아이콘 |
| `w-5 h-5`   | 네비게이션, 리스트 체크 |
| `size={24}` | 피처 카드 아이콘        |
| `size={28}` | 강조 아이콘             |
| `w-11 h-11` | 소셜 미디어 링크        |

---

## 10. Accessibility Rules (필수)

이 규칙들은 globals.css에 전역 적용되어 있다. **절대 되돌리지 말 것.**

```css
/* 모든 button, a, [role="button"] */
min-height: 44px;
min-width: 44px;
cursor: pointer;

/* 단, 문단 내 링크는 예외 */
p a, li a → min-height: auto; min-width: auto;

/* focus 링 */
:focus-visible → outline: 2px solid teal; outline-offset: 2px;
```

**규칙:**

- 모든 이미지에 `alt` 속성 필수.
- 아이콘만 있는 버튼에 `aria-label` 필수.
- 섹션 간 건너뛰기 링크 (`Skip to content`) 유지.
- 한국어 텍스트: `word-break: keep-all` (이미 body 전역 적용).

---

## 11. 컴포넌트 패턴

### CTA 버튼 (Primary)

> **기준:** `career-brew-career-talk` 페이지의 "Reserve My Spot" 버튼 (`src/app/career-brew-career-talk/page.tsx`)
> 새로 만드는 모든 CTA·Book·Register·Submit 버튼은 아래 패턴을 그대로 따른다. 임의로 클래스 추가/변경 금지.

```tsx
// ✅ 표준 CTA 버튼 (orange — 주 행동)
<button className="
  inline-flex items-center gap-2
  bg-orange hover:bg-orange-hover
  text-white font-bold text-lg
  font-[family-name:var(--font-heading)]
  px-8 py-4
  rounded-2xl
  shadow-[0_10px_25px_-5px_rgba(255,79,2,0.3)]
  transition-all
  hover:scale-[1.02]
">
  Button Label
</button>

// ✅ 표준 CTA 버튼 (teal — 보조 행동, Resume Review 전용)
<button className="
  inline-flex items-center gap-2
  bg-teal hover:bg-[#009aaa]
  text-white font-bold text-lg
  font-[family-name:var(--font-heading)]
  px-8 py-4
  rounded-2xl
  shadow-[0_10px_25px_-5px_rgba(0,173,189,0.35)]
  transition-all
  hover:scale-[1.02]
">
  Button Label
</button>

// ✅ 모달/폼 Submit 버튼 (w-full 레이아웃)
<button className="
  flex w-full items-center justify-center gap-2
  bg-orange hover:bg-orange-hover
  text-white font-bold text-lg
  rounded-2xl
  py-4
  shadow-[0_4px_12px_rgba(255,79,2,0.3)]
  transition-all
  hover:bg-orange-hover
  disabled:cursor-not-allowed disabled:opacity-70
">
  Submit
</button>
```

**확정 규칙:**

- `font-size`: 반드시 `text-lg` (1.125rem). `text-base`, `text-sm`, `text-[0.9rem]` 등 소형 금지
- `font-weight`: 반드시 `font-bold` (700). `font-semibold` 허용 안 됨
- `font-family`: 반드시 `font-[family-name:var(--font-heading)]` (Poppins)
- `padding`: 인라인 버튼 `px-8 py-4`, 풀위드 버튼 `py-4`
- `border-radius`: 반드시 `rounded-2xl` (16px)
- `shadow`: `0 10px 25px -5px rgba(...)` — 인라인 버튼 기준
- `hover`: 반드시 `hover:scale-[1.02]`. `hover:-translate-y-[3px]` 사용 금지

> 🚫 **절대 금지:**
>
> - `rounded-full`, `rounded-lg`, `rounded-3xl`, `rounded-[50px]` 등 다른 radius
> - `hover:-translate-y-[3px]` (translate hover)
> - `font-semibold`, `text-base`, `text-sm` 등 소형 폰트
> - `text-[0.9rem]` 등 임의 font-size

### 히어로 상단 레이블 / hero badge

`/services`, `/career-brew-career-talk`, `/pcs-1` 상단 badge는 아래 크기와 tracking을 공통으로 사용한다.

```tsx
<p className="
  inline-flex items-center gap-2
  rounded-full bg-teal/10 text-teal
  px-6 py-3
  text-[0.82rem] md:text-[0.9rem]
  font-bold uppercase tracking-[0.2em]
">
```

### 섹션 레이블 (상단 badge)

```tsx
<span className="
  inline-block
  bg-teal/10 text-teal
  text-xs font-bold uppercase tracking-[0.18em]
  py-2 px-5 rounded-full
  mb-5
">
```

### 섹션 헤더 구조

```tsx
<div className="section-header text-center mb-16 md:mb-20 max-w-[800px] mx-auto">
  {/* 레이블 */}
  <span>레이블</span>
  {/* 타이틀 */}
  <h2 className="text-[2.2rem] md:text-[2.75rem] font-bold text-navy mb-4">
  {/* 설명 */}
  <p className="text-[1.2rem] text-[#667085] leading-relaxed">
</div>
```

### 카드 기본 구조

```tsx
<div className="
  bg-white
  rounded-none       // ← 절대 rounded-xl 등으로 바꾸지 말 것
  border border-gray-100
  shadow-card
  p-8
  transition-[transform,box-shadow] duration-300
  hover:-translate-y-[10px]
  hover:shadow-[0_20px_40px_rgba(0,38,59,0.12)]
">
```

---

## 12. 절대 금지 사항 (DO NOT)

1. **`@theme` 외부에 새 색상 hex 직접 추가** — 반드시 토큰 사용
2. **카드에 `rounded-xl` 이상 적용** — 카드는 `rounded-none`
3. **버튼에 `rounded-full`, `rounded-lg`, `rounded-3xl`, `rounded-[50px]` 등 적용** — 버튼은 반드시 `rounded-2xl` (16px) 단 하나만 허용
4. **`xl:` 브레이크포인트 신규 사용** — `lg:`가 최대
5. **z-index 임의 값 사용** — 위 스케일 표 기준 준수
6. **shadow에 navy/orange 외 색상 사용** — 예외 없음
7. **`font-family` 직접 문자열 지정** — 반드시 `var(--font-poppins)` 등 변수 사용
8. **접근성 min-height/min-width 제거** — 터치 타겟 크기 WCAG 기준 유지
