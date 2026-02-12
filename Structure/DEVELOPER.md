# 🔧 Developer Reference - Debugging & Extension Guide

## Quick Command Reference

```bash
# Backend
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm start           # Run compiled version
npm run typecheck   # Type checking only

# Frontend
cd client
npm run dev         # Vite dev server with hot reload
npm run build       # Production build to ../public
npm run typecheck   # Type checking
```

## Common Debug Scenarios

### Issue: "Player is not YOUR turn"

**Cause**: Turn validation logic detected wrong player
**Fix**: Check in Chrome DevTools Console

```javascript
// Inspect room state
console.log(room);
console.log(room.currentPlayerIndex);
console.log(room.players[room.currentPlayerIndex].id === playerId);
```

### Issue: Cards not appearing

**Check**:

1. Backend sending `currentCard` in room state?
   - Add `console.log` in `drawNextCard()` function
2. Frontend rendering DraftCard component?
   - Check DevTools React tab for props

**Debug Code** (in roomManager.ts):

```typescript
function drawNextCard(room: GameRoom): void {
  if (room.deck.length === 0) return;
  room.currentCard = room.deck.pop() || null;
  console.log(`Drew card: ${room.currentCard?.name}`); // ADD THIS
}
```

### Issue: WebSocket not connecting

**Check**:

1. Is backend running on port 3000?

   ```bash
   lsof -i :3000  # macOS/Linux
   netstat -tuln  # Linux
   Get-NetTcpConnection -LocalPort 3000  # Windows
   ```

2. Check browser console for connection errors
3. Check Network tab → WS for socket.io connection

**Fix**: Vite proxy misconfigured?

```typescript
// client/vite.config.ts
server: {
  proxy: {
    '/socket.io': {
      target: 'http://localhost:3000',
      ws: true,  // ← Must be true for WebSocket
    },
  },
}
```

### Issue: Room not syncing between players

**Check**: Are `io.to(room.id).emit()` calls being made?

**Debug**:

1. Add logging in gameHandlers.ts:

```typescript
io.on("connection", (socket: Socket) => {
  console.log("Client connected:", socket.id);

  socket.on("assign_card", ({ roomId, slotRole }) => {
    console.log(`Assigning card for room ${roomId}`);
    // ... rest of handler
  });
});
```

2. Open DevTools Network → WS tab
3. Watch for incoming "room_updated" messages

## Adding a New Event

### Step 1: Add to Backend Socket Handler

```typescript
// src/sockets/gameHandlers.ts
socket.on("my_new_event", ({ roomId, data }) => {
  console.log("Received my_new_event:", data);

  // Process event
  const { room, error } = myNewEventHandler(roomId, socket.id, data);

  if (error) {
    socket.emit("invalid_action", { message: error });
    return;
  }

  // Broadcast to all players in room
  io.to(room.id).emit("room_updated", room);
});
```

### Step 2: Add Handler Function

```typescript
// src/game/roomManager.ts
export function myNewEventHandler(
  roomId: string,
  socketId: string,
  data: any,
): { room?: GameRoom; error?: string } {
  const room = rooms.get(roomId);
  if (!room) return { error: "Room not found" };

  const player = room.players.find((p) => p.id === socketId);
  if (!player) return { error: "Player not found" };

  // ADD YOUR LOGIC HERE

  return { room };
}
```

### Step 3: Add to TypeScript Types

```typescript
// src/game/types.ts
// Add any new fields to GameRoom, PlayerState, etc.
```

### Step 4: Add Frontend Socket Emitter

```typescript
// client/src/context/SocketContext.tsx
const myNewEvent = (roomId: string, data: any) => {
  if (socket) {
    socket.emit("my_new_event", { roomId, data });
  }
};

// Add to SocketContextType interface
const value: SocketContextType = {
  // ... existing
  myNewEvent,
};
```

### Step 5: Add to useSocket Hook

```typescript
// client/src/context/SocketContext.tsx
const { myNewEvent } = useSocket();
```

### Step 6: Trigger in React Component

```typescript
// client/src/components/MyComponent.tsx
const { room, playerId, myNewEvent } = useSocket();

const handleClick = () => {
  myNewEvent(room.id, {
    /* data */
  });
};
```

## Modifying Game Rules

### Change Deck Size

```typescript
// src/game/cards.ts
// Add/remove cards from ALL_CARDS array
export const ALL_CARDS: Card[] = [
  // ... increase or decrease the number of cards
];
```

### Change Team Size

```typescript
// src/game/types.ts
export interface TeamSlot {
  role: Role;
  cardId: string | null;
}
// Current: captain, viceCaptain, tank, healer, support (5 roles)

// To add 6th role:
export type Role =
  | "captain"
  | "viceCaptain"
  | "tank"
  | "healer"
  | "support"
  | "jungler";
```

Then update:

```typescript
// src/game/roomManager.ts
function defaultTeam(): TeamSlot[] {
  return [
    // ... existing roles
    { role: "jungler", cardId: null }, // ADD THIS
  ];
}
```

And frontend:

```typescript
// client/src/components/PlayerPanel.tsx
// The loop automatically renders all roles from player.team
```

### Change Scoring

```typescript
// src/game/roomManager.ts
function calculateScores(room: GameRoom): Record<string, number> {
  const scores: Record<string, number> = {};

  for (const player of room.players) {
    let total = 0;

    // CURRENT: Sum role-specific stats
    for (const slot of player.team) {
      if (!slot.cardId) continue;
      const card = ALL_CARDS.find((c) => c.id === slot.cardId);
      if (!card) continue;
      total += card.stats[slot.role]; // ← MODIFY THIS
    }

    // Example: Multiply by 2
    // total *= 2

    // Example: Add bonus for cards from same anime
    // const animes = new Set()
    // for (const slot of player.team) {
    //   const card = ALL_CARDS.find(c => c.id === slot.cardId)
    //   if (card) animes.add(card.anime)
    // }
    // total += animes.size * 10

    scores[player.id] = total;
  }

  return scores;
}
```

## TypeScript Strict Mode Tips

When adding new code, TypeScript strict mode enforces:

- No implicit `any` types
- All properties must be defined
- No `null` without checking

Examples:

```typescript
// ❌ BAD - Property might not exist
const name = player.name;
const length = name.length;

// ✅ GOOD - Null check
const name = player?.name;
if (name) {
  console.log(name.length);
}

// ❌ BAD - Implicit any
function doSomething(data) {}

// ✅ GOOD - Explicit type
function doSomething(data: GameRoom) {}

// ❌ BAD - Might be undefined
const player = room.players[0];
console.log(player.id);

// ✅ GOOD - Check first
const player = room.players[0];
if (player) {
  console.log(player.id);
}
```

## Performance Tips

### Minimize Room Updates

```typescript
// ❌ INEFFICIENT - Send entire game on every action
io.to(room.id).emit("room_updated", room);

// ✅ BETTER - Could send only changed data
io.to(room.id).emit("card_drawn", {
  currentCard: room.currentCard,
  deckSize: room.deck.length,
});
```

### Cache Card Lookups

```typescript
// ❌ INEFFICIENT - Loop through all cards
for (const slot of player.team) {
  const card = ALL_CARDS.find((c) => c.id === slot.cardId);
}

// ✅ BETTER - Create map once
const cardMap = new Map(ALL_CARDS.map((c) => [c.id, c]));
for (const slot of player.team) {
  const card = cardMap.get(slot.cardId);
}
```

## Testing Patterns

### Test Shuffle Function

```typescript
// src/game/roomManager.ts
function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Test in Node REPL:
// const shuffled = shuffle([1,2,3,4,5])
// Should return same elements, different order
```

### Test Scoring

```typescript
// Create mock room
const mockRoom: GameRoom = {
  id: "test",
  players: [
    {
      id: "p1",
      name: "Test",
      team: [
        {
          role: "captain",
          cardId: "luffy", // Luffy captain stat = 98
        } /* ... */,
      ],
      skipUsed: false,
      draftingComplete: true,
      swapUsed: false,
    },
  ],
  // ... rest of room
};

const scores = calculateScores(mockRoom);
// scores["p1"] should include 98 from captain slot
```

## Useful Debug Commands

```typescript
// In browser console:

// View all socket events
socket.onAny((eventName, data) => {
  console.log(`Event: ${eventName}`, data);
});

// Inspect current game room
console.table(room);

// List all players
room.players.forEach((p) => console.log(p.name, `(${p.id})`));

// Check deck size
console.log(`Deck: ${room.deck.length}/${ALL_CARDS.length}`);

// List team assignments
room.players.forEach((p) => {
  p.team.forEach((slot) => {
    const card = ALL_CARDS.find((c) => c.id === slot.cardId);
    console.log(`${p.name} - ${slot.role}: ${card?.name ?? "empty"}`);
  });
});
```

## File Structure Quick Reference

```
Key Files to Edit:
├─ src/game/cards.ts              ← Add/modify characters
├─ src/game/types.ts              ← Add new role/phase
├─ src/game/roomManager.ts        ← Game logic & rules
├─ src/sockets/gameHandlers.ts    ← Handle events
│
├─ client/src/components/GameBoard.tsx  ← Main game UI
├─ client/src/components/RoomLobby.tsx  ← Entry screen
├─ client/src/context/SocketContext.tsx ← State & hooks
└─ client/tailwind.config.js       ← Styling theme
```

## Building for Production

```bash
# Backend
npm run build
# Output: dist/

# Frontend
cd client
npm run build
# Output: ../public/

# Test production build locally
NODE_ENV=production npm start
# Visit http://localhost:3000
```

---

Happy coding! 🚀
