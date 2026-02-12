# 🏗️ Anime Draft Arena - Architecture & Design

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    WEB BROWSER (CLIENT)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  React Components                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐    │   │
│  │  │RoomLobby │  │GameBoard │  │PlayerPanel      │    │   │
│  │  └──────────┘  └──────────┘  └─────────────────┘    │   │
│  │       │              │               │               │   │
│  │       └──────────────┴───────────────┘               │   │
│  │              Socket Context Hook                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓ WebSocket                          │
│                    Socket.IO Connection                      │
└─────────────────────────────────────────────────────────────┘
                           ↕
                    TCP/IP Network
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                  NODE.JS SERVER (BACKEND)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Socket.IO Event Handlers                │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │ - create_room    - assign_card               │    │   │
│  │  │ - join_room      - skip_card                 │    │   │
│  │  │ - draw_card      - swap_cards                │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │                         ↓                             │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │  Game Domain Logic (game/)                   │    │   │
│  │  │  ┌─────────────┐  ┌──────────────────────┐  │    │   │
│  │  │  │ roomManager │  │ types.ts, cards.ts   │  │    │   │
│  │  │  │ - shuffle   │  │ - GameRoom           │  │    │   │
│  │  │  │ - validate  │  │ - PlayerState        │  │    │   │
│  │  │  │ - score     │  │ - Card definitions   │  │    │   │
│  │  │  └─────────────┘  └──────────────────────┘  │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │                         ↑                             │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │  Service Layer (services/)                   │    │   │
│  │  │  - matchLifecycle.ts (helpers)               │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │                         ↑                             │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │  In-Memory State (Room Map)                  │    │   │
│  │  │  Map<roomId, GameRoom>                       │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Express Server (index.ts)                                  │
│  - Static file serving (public/)                            │
│  - HTTP routes                                              │
│  - Socket.IO initialization                                 │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow - Game State Lifecycle

### 1. Room Creation & Joining

```
Frontend                          Backend
├─ Player enters name
├─ Clicks "Create Room"
│  └─ emit('create_room', {name})────→ registerGameHandlers
│                                      ├─ createRoom()
│                                      │  └─ new GameRoom created
│                                      │     phase: "waiting"
│                                      └─ emit('room_created')
├─ Receives roomId & joins Socket.IO
├─ Player 2 joins
│  └─ emit('join_room', {roomId, name})→ registerGameHandlers
│                                        ├─ joinRoom()
│                                        │  └─ GameRoom.phase = "draft"
│                                        │     deck: shuffled(ALL_CARDS)
│                                        └─ io.to(roomId).emit('room_updated')
├─ Both players see game start
└─ Ready to draft!
```

### 2. Draft Phase - Turn-Based Drawing

```
Current Player        Backend              Other Player
│                     │                     │
├─ Click "Draw Card"──→ draw_card event
│                     ├─ Validate: correct turn
│                     ├─ Validate: no card current drawn
│                     ├─ drawNextCard()
│                     │  └─ room.currentCard = deck.pop()
│                     ├─ Broadcast room state
│  ← ─room_updated    ← emit('room_updated')  ← room_updated
│
├─ Sees drawn card
├─ Selects team role
├─ Send assign_card ──→ handleAssignCard()
│                     ├─ Validate: card exists
│                     ├─ Validate: slot empty
│                     ├─ Assign card to role
│                     ├─ Check: team full?
│                     │  └─ If yes: mark player.draftingComplete
│                     ├─ Check: both teams full?
│                     │  └─ If yes: transition to "swap" phase
│                     ├─ Switch turn
│                     ├─ Broadcast room state
│  ← room_updated     ← emit('room_updated')  ← room_updated
│                     │
├─ Waiting...        ├─ Now Other Player's turn
│                     │
                    Other Player
                    ├─ Receives room_updated
                    ├─ Clicks "Draw Card"
                    └─ (cycle repeats)
```

### 3. Swap Phase (Optional)

```
Both Teams Complete
  │
  └─→ Phase transitions to "swap"
      ├─ If any player didn't use skip:
      │  └─ Players can now swap one pair
      ├─ emit('room_updated') with phase="swap"
      │
Player 1                          Player 2
├─ See swap UI                   ├─ See swap UI
├─ Select 2 roles
├─ emit('swap_cards')  ──→ handleSwap()
│                           ├─ Validate: player can swap
│                           ├─ Swap card IDs in slots
│                           ├─ Mark swapUsed=true
│                           ├─ Check both done?
│                           │  └─ Yes: transition to "finished"
│                           └─ emit('room_updated')
├─ ← room_updated
│
├─ OR click "Skip Swap"──→ handleSkipSwap()
│                           └─ Mark decision made
│
└─ Once both decided → Scoring!
```

### 4. Scoring & Outcome

```
Backend (calculateScores)
├─ For each player:
│  └─ For each team slot:
│     ├─ Get card from slot
│     ├─ Get stat value for this slot's role
│     └─ Add to player total
├─ Compare scores
├─ Determine winner
├─ Set phase = "finished"
├─ Broadcast game_over event
│
Frontend
├─ Receives game_over
├─ Shows results screen
└─ Display winner & scores
```

## Key Design Patterns

### 1. **Server as Source of Truth**

- All game logic lives on server
- Client validates input, server enforces rules
- State stored in server memory (Map<roomId, GameRoom>)
- Client receives continuous state updates

### 2. **Event-Driven Architecture**

- Socket.IO for real-time bidirectional communication
- Clear naming: `create_room`, `room_updated`, `game_over`
- Events validated server-side before confirming
- Broadcasting to all players in room for sync

### 3. **Modular Folder Structure**

```
game/          Pure domain logic (shuffling, scoring, validation)
├─ types.ts    ← Data structures (no logic)
├─ cards.ts    ← Static card database
└─ roomManager ← Game rules & state management

sockets/       Event handlers (input/output layer)
└─ gameHandlers ← Maps events to domain functions

services/      Helpers & utilities
└─ matchLifecycle ← Match state utilities

index.ts       Application bootstrap (servers & routing)
```

**Benefit**: Game logic completely independent of socket.io

### 4. **Component Hierarchy (Frontend)**

```
App
└─ SocketProvider (Context)
   └─ AppContent
      ├─ RoomLobby (room not joined)
      └─ GameBoard (room joined)
         ├─ DraftCard (current drawn card)
         └─ PlayerPanel (for each player)
            └─ TeamSlot (for each role) × 5
```

**Benefit**: Props flow down, hooks for state (useSocket)

### 5. **Type Safety Throughout**

- Shared types between frontend/backend
- TypeScript strict mode enabled
- Prevents runtime errors
- IDE autocomplete for events & data shapes

## Phase Transitions

```
Waiting
   │
   └─→ (Player 2 joins & clicks confirm)
        │
        v
      Draft
        │
        ├─ Players alternate turns
        ├─ Draw → Assign or Skip
        ├─ Repeat until all slots filled
        │
        └─→ (Player 1 full) AND (Player 2 full)
             │
             v
           Swap (Optional)
             │
             ├─ Players who didn't skip can swap once
             ├─ OR skip the swap phase
             │
             └─→ (Both made decision)
                  │
                  v
               Finished
                  │
                  └─ Scores calculated
                  └─ Winner announced
                  └─ Players can restart
```

## Validation Strategy

### Client-Side (User Experience)

- Disable buttons when action invalid
- Show user-friendly error messages
- Optimistic UI updates

### Server-Side (Security & Correctness)

- **Turn Validation**: Verify correct player's turn
- **State Checks**: Verify currentCard exists before assign
- **Slot Validation**: Verify slot empty before assign
- **Deck Validation**: Verify cards remain before drawing
- **Skip Validation**: Verify skip not already used
- **Phase Validation**: Verify correct game phase for action

Example from `handleAssignCard`:

```typescript
if (room.phase !== "draft") return { error: "Draft not active" };
if (currentPlayer.id !== socketId) return { error: "Not your turn" };
if (!room.currentCard) return { error: "No card drawn" };
if (slot.cardId) return { error: "Slot already filled" };
```

## Scoring Algorithm

```typescript
scores[playerId] = sum of (
  card_in_slot[i].stats[role_of_slot[i]]
  for all i in 1..5
)

Winner = argmax(scores[])
```

Example:

- Captain slot has Luffy (captain stat: 98) → +98
- Vice Captain has Sasuke (viceCaptain stat: 92) → +92
- Tank has Zoro (tank stat: 90) → +90
- Healer has Sakura (healer stat: 95) → +95
- Support has Naruto (support stat: 90) → +90
- **Total: 465**

## Error Handling

### Network Errors

- Socket reconnection with exponential backoff
- "Disconnected from server" message shown
- Auto-reconnect up to 5 times

### Validation Errors

- Server sends `invalid_action` event
- Frontend shows error message briefly
- User can retry

### State Corruption

- Deck size tracked
- Phase transitions validated
- All critical state mutations validated

## Performance Considerations

- **In-Memory Storage**: Rooms stored in Map (O(1) lookup)
- **No Database**: For MVP; can add persistence layer
- **Efficient Broadcasting**: Only affected room receives update
- **Minimial Payload**: Send only necessary state

## Security Recommendations

For production, consider:

1. **Authentication**: User login with JWT tokens
2. **Authorization**: Verify player owns their socket
3. **Rate Limiting**: Prevent spam events
4. **Input Validation**: Sanitize all inputs
5. **HTTPS/WSS**: Encrypt network traffic
6. **CORS Configuration**: Restrict origins

## Extensibility

### Add New Character

1. Add to `src/game/cards.ts`
2. Add to `client/src/constants/cards.ts`
3. Recompile and redeploy

### Add New Role

1. Update `Role` type in `types.ts` (both frontend & backend)
2. Add to `defaultTeam()` in `roomManager.ts`
3. Update TeamSlot rendering in `TeamSlot.tsx`
4. Update swap UI in `GameBoard.tsx`

### New Game Mode

1. Create new `GamePhase` variant
2. Add handlers in `gameHandlers.ts`
3. Add logic in `roomManager.ts`
4. Add UI in React components

## Testing Strategy

```
Domain Logic Tests (game/)
├─ Shuffle randomness
├─ Score calculation
├─ Validation rules
└─ Phase transitions

Socket Tests (manual / integration)
├─ Event payload validation
├─ Broadcasting to multiple clients
├─ Disconnection handling
└─ Concurrent player actions

Component Tests (Front end)
├─ RoomLobby form submission
├─ GameBoard phase rendering
├─ Button state changes
└─ Socket context integration
```

---

**Architecture Principles**:

1. ✅ **Separation of Concerns**: Game logic ≠ Socket events ≠ UI
2. ✅ **Type Safety**: Full TypeScript coverage
3. ✅ **Modularity**: Clear folder structure
4. ✅ **Server Authority**: Client doesn't calculate winner
5. ✅ **Extensibility**: Easy to add features without breaking existing code
