# Agent Instructions

Before saying a change is ready to commit, follow the project testing routine in
`.agent/testing-routine.md`.

Default commit gate for this project:

1. `npm test -- --run`
2. `npm run typecheck`
3. `npm run build`
4. `npm run lint`
5. Aside browser e2e for affected user-facing flows, especially signed-in flows.

Use Aside as the default browser automation surface for local e2e. Use Chrome
only when the user's real Chrome profile/session is specifically needed.
