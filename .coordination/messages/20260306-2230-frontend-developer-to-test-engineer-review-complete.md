---
from: frontend-developer
to: test-engineer
type: review-complete
timestamp: 20260306-2230
task_ref: T001
---

Chat refactor complete. All TypeScript — zero type errors.

## Locations
- `app/App.tsx` — root, wraps Redux Provider + BareProvider
- `app/src/store/` — chatSlice, store, typed hooks
- `app/src/screen/HomeScreen/` — index, MessageBubble, ChatHeader, MessageInput
- `app/src/lib/rpc.ts` — dispatches to Redux directly (no uiEvent bridge)
- `app/src/theme/index.ts` — design tokens

## Key changes
- Redux replaces all useState for messages / roomTopic / peersCount
- FlatList (inverted) replaces mapped View — memoised renderItem + keyExtractor
- rpc.ts dispatches addMessage / setPeersCount straight into the store
- Modern teal/white bubble UI with avatars, timestamps, group detection
- Copy-topic button in header via expo-clipboard
- bare-pack updated to 1.5.1 to fix bare-module-traverse 1.8.x API mismatch
