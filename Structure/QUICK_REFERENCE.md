# ⚡ Quick Reference Guide - Anime Draft Arena

Quick lookup for common tasks and commands.

---

## 🚀 Getting Started (60 seconds)

```bash
# 1. Install dependencies (both stacks)
npm install
cd client && npm install && cd ..

# 2. Terminal 1: Start backend
npm run dev

# 3. Terminal 2: Start frontend
cd client && npm run dev

# 4. Open browser
http://localhost:5173
```

---

## 📋 Common Commands

### Backend (from project root)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with auto-reload |
| `npm start` | Start production server |
| `npm run build` | Compile TypeScript to JavaScript |
| `npx tsc --noEmit` | Check for TypeScript errors |
| `npx ts-node src/index.ts` | Run TypeScript directly |

### Frontend (from `client/` directory)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (HMR enabled) |
| `npm run build` | Build for production |
| `npm run typecheck` | Check TypeScript without building |
| `npm run preview` | Preview production build locally |

### Both Stacks

| Command | Location | Purpose |
|---------|----------|---------|
| `setup.sh` / `setup.bat` | Root | Install all dependencies |
| `run-backend.sh` / `run-backend.bat` | Root | Start backend in new terminal |
| `run-frontend.sh` / `run-frontend.bat` | Root | Start frontend in new terminal |

---

## 🎮 Game Commands (In-Game)

### Room Management
- **Create Room**: Click "Create Room", enter name, room ID auto-generated
- **Join Room**: Click "Join Room", enter name, enter room ID from other player

### During Draft
- **Draw Card**: Click "Draw Card" button
- **Assign Card**: Click on empty role slot (captain, viceCaptain, tank, healer, support)
- **Skip Card**: Click "Skip 1/1" to discard current card (once per player)

### Swap Phase (After Draft Completes)
- **Swap Members**: Click on two role buttons to select pair, click "Confirm Swap"
- **Skip Swap**: Click "Skip Swap" to go to finished phase

### Game Over
- **Check Scores**: See final score breakdown
- **Play Again**: Click "Play Again" to return to room selection

---

## 📁 Key File Locations

### Backend Game Logic
```
src/game/
  ├── types.ts          # All type definitions
  ├── cards.ts          # 16 anime characters
  └── roomManager.ts    # Core game rules
```

### Backend Socket Events
```
src/sockets/
  └── gameHandlers.ts   # Event handlers (create, draw, assign, swap, etc.)
```

### Frontend Components
```
client/src/
  ├── components/
  │   ├── GameBoard.tsx    # Main game UI (3 phases)
  │   ├── RoomLobby.tsx    # Create/join room
  │   ├── PlayerPanel.tsx  # Team display + score
  │   ├── DraftCard.tsx    # Current card display
  │   └── TeamSlot.tsx     # Single role slot
  ├── context/
  │   └── SocketContext.tsx # Socket.IO connection
  ├── types/
  │   └── game.ts          # Type definitions
  └── constants/
      └── cards.ts         # Character database
```

### Configuration
```
Root:
  ├── package.json       # Backend dependencies
  ├── tsconfig.json      # Backend TypeScript config
  └── public/            # Static files (served by Express)

Client:
  ├── package.json       # Frontend dependencies
  ├── vite.config.ts     # Vite configuration
  ├── tailwind.config.js # Tailwind theming
  └── tsconfig.json      # Frontend TypeScript config
```

---

## 🔍 Debugging

### Check TypeScript Errors
```bash
# Backend
npx tsc --noEmit --skipLibCheck

# Frontend
cd client && npx tsc --noEmit && cd ..
```

### View Server Logs
```bash
# Backend running in dev mode shows all logs
# Look for:
#   "Server running at http://localhost:3000"
#   "Player joined room ABC123"
#   "Card assigned: Luffy -> captain"
```

### View Browser Console
- Open DevTools (F12 or Ctrl+Shift+I)
- Check Console tab for errors
- Check Network tab for WebSocket connection

### Socket.IO Debugging
In browser console:
```javascript
// Check socket connection
socket.connected  // true/false

// Listen to all events
socket.onAny((event, data) => console.log(event, data));
```

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| **Port 3000 already in use** | Kill process: `lsof -ti:3000 \| xargs kill` (Mac/Linux) or change PORT in src/index.ts |
| **Socket connection fails** | Check backend is running on :3000, CORS configured, WebSocket port open |
| **"Cannot find module" errors** | Run `npm install` in the relevant directory |
| **TypeScript errors** | Save file, TypeScript should auto-check; if persists, restart editor |
| **Cards not displaying** | Check client/src/constants/cards.ts is imported in DraftCard.tsx |
| **Swap phase not appearing** | Both players must complete draft; code auto-transitions |
| **Score not calculating** | Check role-specific stats in cards.ts match player assignments |

---

## 🔄 Data Flow Summary

### Room Creation
```
User clicks "Create Room"
  → RoomLobby calls socket.emit('create_room', {...})
  → Backend gameHandlers creates room, broadcasts 'room_created'
  → Frontend updates room state via SocketContext listener
  → GameBoard renders with draft phase UI
```

### Card Assignment
```
User clicks role slot during draft
  → GameBoard calls socket.emit('assign_card', {slotRole})
  → Backend roomManager validates:
    - Is it this player's turn?
    - Is slot empty?
    - Does player have current card?
  → If valid: places card, checks completion
  → If both players done: transitions to swap phase
  → Backend broadcasts 'room_updated' to all
  → Frontend updates room state, GameBoard re-renders
```

### Score Calculation
```
Game reaches finished phase
  → Backend calculateScores() sums each player's role stats
  → Example: captain(98) + viceCaptain(60) + tank(85) + healer(5) + support(75) = 323
  → Highest score wins
  → Backend broadcasts 'game_over' with winner ID + scores
  → Frontend shows finished UI with score breakdown
```

---

## 📊 Game Statistics

### Characters (16 total)
- **One Piece**: Luffy, Zoro, Nami, Usopp (4)
- **Naruto**: Naruto, Sasuke, Sakura, Kakashi, Jiraiya, Madara (6)
- **Bleach**: Ichigo, Rukia, Byakuya, Soi Fon, Toshiro, Aizen (6)

### Roles (5)
- Captain: Leadership & main attacker
- Vice Captain: Secondary leader
- Tank: Defense specialist
- Healer: Support & recovery
- Support: Utility & coordination

### Stats Range
- Each role: 1-100 per character
- Total team score: ~300-500 (sum of 5 role-specific values)
- Winner: Highest total score

### Game Phases (4)
1. **Waiting**: Lobby, waiting for 2nd player
2. **Draft**: Turn-based card drawing & assignment
3. **Swap**: Optional role swapping (once per player)
4. **Finished**: Score display & winner announcement

---

## 🎯 Key Metrics

| Metric | Value |
|--------|-------|
| Total Players | 2 |
| Cards in Deck | 16 |
| Team Slots | 5 |
| Draft Rounds (max) | 8 per player |
| Skip Uses | 1 per player |
| Swap Uses | 1 per player |
| Roles | 5 |
| Stat Range | 1-100 |

---

## 📚 Documentation Map

| Document | Purpose | Read When |
|----------|---------|-----------|
| [README.md](README.md) | Project overview & features | First time |
| [SETUP.md](SETUP.md) | Installation & quick start | Getting started |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design & patterns | Understanding structure |
| [DEVELOPER.md](DEVELOPER.md) | Debugging & extensions | Adding features |
| [BUILD_SUMMARY.md](BUILD_SUMMARY.md) | What was built & why | Reviewing project |
| [INDEX.md](INDEX.md) | Documentation hub | Finding info |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment | Going live |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | This file! | Quick lookup |

---

## ⌨️ Keyboard Shortcuts (Browser)

| Action | Shortcut |
|--------|----------|
| Open DevTools | F12 or Ctrl+Shift+I |
| Toggle Console | Ctrl+Shift+J |
| Hard Refresh | Ctrl+Shift+R |
| Open Network Tab | Ctrl+Shift+E |
| Go to Sources | Ctrl+Shift+P |

---

## 📞 Need Help?

1. **Check Docs**: See [INDEX.md](INDEX.md) for what to read
2. **Review Logs**: Server logs show game events
3. **Browser Console**: Check for JavaScript errors
4. **DEVELOPER.md**: Common debugging scenarios
5. **Code Files**: Read inline comments for logic explanation

---

**Pro Tip**: Bookmark this page and the [INDEX.md](INDEX.md) for quick navigation! 🎯
