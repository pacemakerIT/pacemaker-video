# Testing Routine

이 문서는 Pacemaker Video 프로젝트에서 에이전트가 변경사항을 커밋 가능하다고 말하기 전에 적용해야 하는 기본 테스트 루틴이다.

## 기본 원칙

- 커밋 가능 여부를 판단할 때는 단순 unit test만 보지 말고 build, typecheck, lint, 브라우저 e2e까지 확인한다.
- 변경 범위가 작아도 사용자-facing 흐름이면 Aside 브라우저로 실제 클릭 흐름을 확인한다.
- DB나 cart/order 같은 상태를 테스트 중 만들면 테스트 끝에 반드시 정리하고, 정리 결과를 확인한다.
- 테스트를 못 돌린 항목이 있으면 "통과"라고 말하지 말고, 왜 못 돌렸는지와 남은 리스크를 명확히 남긴다.

## 기본 커밋 Gate

커밋해도 되는지 확인할 때 기본적으로 아래를 실행한다.

```bash
npm test -- --run
npm run typecheck
npm run build
npm run lint
```

추가로 사용자-facing 변경은 Aside browser e2e를 돌린다.

## Browser E2E 우선순위

1. Aside
2. Playwright script
3. Chrome

Aside를 기본 브라우저 테스트 도구로 사용한다. 이 프로젝트에서는 Aside에 `localhost:3001` 로그인 세션을 유지해두고 signed-in e2e를 돌리는 방식이 가장 편하다.

Chrome은 사용자의 실제 Chrome 프로필, 쿠키, 확장, 캐시, OAuth/SSO 상태가 꼭 필요한 경우에 사용한다.

Playwright script는 반복 가능한 CI형 검증이나 console/page error 수집이 필요할 때 사용한다.

## Aside 사용 규칙

- Clerk middleware가 있는 라우트는 `127.0.0.1`보다 `localhost` 바인딩을 우선한다.
- 가능하면 기존 로그인된 Aside 세션과 같은 origin을 사용한다. 예: `http://localhost:3001`.
- `aside repl`에서 `page.url`이 stale일 수 있으므로 실제 위치는 아래처럼 확인한다.

```js
await p.evaluate(() => window.location.href);
```

- role selector가 불안정하면 DOM을 먼저 검사한 뒤 안정적인 locator를 사용한다.

```js
await p.locator('button').evaluateAll((buttons) =>
  buttons.map((button, index) => ({
    index,
    text: button.textContent?.trim(),
    aria: button.getAttribute('aria-label')
  }))
);
```

## Signed-in Flow Checklist

로그인이 필요한 기능을 바꿨다면 Aside에서 실제 로그인 세션으로 확인한다.

- 로그인 상태가 맞는지 `/api/user` 또는 화면 header로 확인한다.
- 테스트 대상 item이 cart/order/favorite 등에 이미 있는지 확인한다.
- 정상 클릭 흐름을 확인한다.
- duplicate/already-in-cart/already-owned 같은 edge case를 확인한다.
- 테스트 중 생성한 cart/order/favorite 데이터를 제거한다.
- 제거 후 DB/API 상태가 원래대로 돌아왔는지 확인한다.

## Example: Ebook Add to Cart

전자책 상세의 cart 흐름을 건드릴 때 확인할 것:

- signed-out: `Add to Cart` 클릭 시 로그인 필요 모달이 뜨고, 확인 시 `/sign-in`으로 이동한다.
- signed-in: `Add to Cart` 클릭 시 cart에 `ItemType.EBOOK`으로 추가되고 완료 모달이 뜬다.
- already in cart: 상세 버튼이 `Go to Cart`로 바뀌고, 클릭 시 `/mypage/cart`로 이동한다.
- already owned: 버튼이 `Purchased`로 바뀌고, 클릭 시 이미 구매한 콘텐츠 모달이 뜨며 cart에 추가되지 않는다.

테스트 후 대상 ebook cart/order 데이터가 남지 않았는지 확인한다.
