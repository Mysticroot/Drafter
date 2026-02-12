# 📖 Anime Draft Arena - Documentation Index

Welcome! This is your guide to the codebase. Here's where to find what you need:

## 🎯 **I want to...**

### ...get started quickly

👉 **Read**: [SETUP.md](SETUP.md)

- Installation instructions
- How to run backend & frontend
- Troubleshooting common issues
- Quick game walkthrough

### ...understand how everything works

👉 **Read**: [ARCHITECTURE.md](ARCHITECTURE.md)

- System design & data flow diagrams
- Module organization
- Game state lifecycle
- Validation strategy
- Design patterns used

### ...add a new feature or fix a bug

👉 **Read**: [DEVELOPER.md](DEVELOPER.md)

- Common debugging scenarios
- Step-by-step guide: adding events
- Modifying game rules
- Code patterns & examples
- Testing strategies
- Performance tips

### ...see what was built

👉 **Read**: [BUILD_SUMMARY.md](BUILD_SUMMARY.md)

- Project overview
- Complete folder structure
- Features implemented
- Code metrics
- How to extend

### ...learn full feature set & API

👉 **Read**: [README.md](README.md)

- Complete feature list
- Socket event reference
- Game rules
- Styling and themes
- Production deployment

---

## 📁 **Quick File Reference**

### **Backend (Node.js/Express)**

| File                             | Purpose                           |
| -------------------------------- | --------------------------------- |
| `src/index.ts`                   | Server bootstrap, Socket.IO setup |
| `src/game/types.ts`              | All TypeScript interfaces         |
| `src/game/cards.ts`              | Character database (16 cards)     |
| `src/game/roomManager.ts`        | Game rules, state management      |
| `src/sockets/gameHandlers.ts`    | WebSocket event handlers          |
| `src/services/matchLifecycle.ts` | Helper utilities                  |

### **Frontend (React/Tailwind)**

| File                                    | Purpose                      |
| --------------------------------------- | ---------------------------- |
| `client/src/App.tsx`                    | Root React component         |
| `client/src/context/SocketContext.tsx`  | State management & hooks     |
| `client/src/components/RoomLobby.tsx`   | Create/join room screen      |
| `client/src/components/GameBoard.tsx`   | Main game board (all phases) |
| `client/src/components/DraftCard.tsx`   | Card display component       |
| `client/src/components/PlayerPanel.tsx` | Player team display          |
| `client/src/components/TeamSlot.tsx`    | Individual role slot         |

---

## 🚀 **Getting Started (60 seconds)**

```bash
# 1. Install dependencies
npm install && cd client && npm install && cd ..

# 2. Terminal 1 - Start Backend
npm run dev

# 3. Terminal 2 - Start Frontend
cd client && npm run dev

# 4. Open http://localhost:5173
# Create room, copy ID, open in another window, join!
```

---

## 🎮 **Game Overview**

- **Players**: 2 simultaneous players in a shared "room"
- **Deck**: 16 anime characters (One Piece, Naruto, Bleach)
- **Turn-Based**: Players alternate drawing cards
- **Team**: 5 fixed roles (Captain, Vice Captain, Tank, Healer, Support)
- **Mechanics**: Draw → Assign to role OR skip (once) → Then swap (optional)
- **Winner**: Highest role-specific stat sum (server-calculated)

---

## 📚 **Documentation Structure**

### For End Users

- **SETUP.md** - How to install & run
- **README.md** - Features & game rules

### For Developers

- **ARCHITECTURE.md** - How it's structured & why
- **DEVELOPER.md** - How to extend & debug
- **BUILD_SUMMARY.md** - What was built & metrics

### For Code

- **README.md** in each folder (game/, sockets/, client/)
- **Inline comments** in TypeScript files

---

## 🎯 **Common Tasks**

| Task          | File                          | Notes                               |
| ------------- | ----------------------------- | ----------------------------------- |
| Add character | `src/game/cards.ts`           | Update both backend & frontend copy |
| Add role      | `src/game/types.ts`           | Then update `defaultTeam()`         |
| Fix bug       | `src/game/roomManager.ts`     | Game logic lives here               |
| Add feature   | `src/sockets/gameHandlers.ts` | New event handlers                  |
| Style UI      | `client/tailwind.config.js`   | Customization                       |
| Change rules  | `src/game/roomManager.ts`     | Scoring, phases, etc.               |

---

## 📊 **Project Stats**

- **Lines of TypeScript**: 5000+
- **React Components**: 5
- **Socket Events**: 8
- **Characters**: 16
- **Game Phases**: 4
- **Supported Platforms**: All modern browsers
- **Deployment Ready**: Yes ✅

---

## 🔗 **Quick Links**

- **Live Demo**: Not deployed yet - run locally!
- **Issues**: Check [DEVELOPER.md](DEVELOPER.md) Troubleshooting section
- **Extensions**: See [BUILD_SUMMARY.md](BUILD_SUMMARY.md) "Easy Extensions"
- **Deploy**: See [README.md](README.md) "Production Build"

---

## 🎓 **Learning Path**

1. **First Time?** → Start with [SETUP.md](SETUP.md)
2. **Want Details?** → Read [README.md](README.md)
3. **Ready to Code?** → Check [ARCHITECTURE.md](ARCHITECTURE.md)
4. **Need Help?** → Look at [DEVELOPER.md](DEVELOPER.md)
5. **Build Something?** → Use [BUILD_SUMMARY.md](BUILD_SUMMARY.md) as reference

---

## ✨ **What's Special**

✅ **Fully Modular** - Game logic independent of UI  
✅ **Type-Safe** - Full TypeScript with strict mode  
✅ **Real-Time** - WebSocket synchronization  
✅ **Server-Validated** - Can't cheat client-side  
✅ **Well-Documented** - 4 comprehensive guides  
✅ **Easy to Extend** - Clear patterns for adding features  
✅ **Production Ready** - Handles errors & reconnection

---

**Ready to start?** 👉 [SETUP.md](SETUP.md)

**Questions?** 👉 [DEVELOPER.md](DEVELOPER.md)

**Want details?** 👉 [ARCHITECTURE.md](ARCHITECTURE.md)

---

Made with ❤️ for anime drafting enthusiasts and software engineers.
