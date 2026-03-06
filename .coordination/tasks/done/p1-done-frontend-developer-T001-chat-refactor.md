---
id: T001
agent: frontend-developer
priority: 1
status: done
depends_on: []
created: 2026-03-06
---

## Task: Chat UI Refactor — Redux + FlatList + Modern UI

### Context
The original HomeScreen uses local useState for all state, a plain mapped View
for message rendering, and basic styling. Needs a full upgrade.

### Acceptance Criteria
- [ ] Redux store manages messages, roomTopic, peersCount
- [ ] rpc.ts dispatches directly to Redux (no uiEvent bridge for messages)
- [ ] FlatList replaces mapped View — inverted, keyed, memoised render
- [ ] All source files converted to TypeScript (strict)
- [ ] Modern bubble UI: avatars, timestamps, teal/white theme
- [ ] Copy-topic button in header
- [ ] typecheck passes with zero errors

### Notes
- Keep worklet/ and lib/rpc core logic (API calls) untouched in behaviour
- bare-pack must be 1.5.1 to match bare-module-traverse 1.8.x API
- expo-clipboard needed for copy-topic feature
