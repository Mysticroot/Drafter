# 🎮 Anime Draft Arena - Quick Start Guide

## 📋 Prerequisites

- **Node.js 18+**: [Download](https://nodejs.org/)
- **npm** or **yarn**: Comes with Node.js
- **A modern web browser**: Chrome, Firefox, Safari, or Edge

## 🚀 Installation & Setup

### Step 1: Clone/Navigate to the Project

```bash
cd /path/to/Drafter
```

### Step 2: Install Backend Dependencies

```bash
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

## ▶️ Running the Application

### Option A: Run Both in Separate Terminals (Recommended for Development)

**Terminal 1 - Start Backend Server:**

```bash
npm run dev
```

The backend will start on `http://localhost:3000`

**Terminal 2 - Start Frontend Dev Server:**

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173` with hot reload

### Option B: Build for Production

**Build Frontend:**

```bash
cd client
npm run build
cd ..
```

**Build Backend:**

```bash
npm run build
```

**Run Production Server:**

```bash
npm start
```

Visit `http://localhost:3000`

## 🎮 Playing the Game

1. **Open two browser windows** or tabs:
   - Player 1: `http://localhost:5173` (dev) or `http://localhost:3000` (prod)
   - Player 2: Same URL, different browser/incognito window

2. **Create or Join a Room:**
   - Player 1 clicks "Create Room" and enters their name
   - Copy the Room ID
   - Player 2 clicks "Join Room", enters the Room ID and their name

3. **Draft Phase:**
   - Players take turns drawing cards
   - Click "Draw Card" to receive a random character
   - Assign the card to one of 5 team roles
   - Or use Skip once to discard the card

4. **Swap Phase (Optional):**
   - Once both teams are complete, enter swap phase
   - If you didn't use skip, you can swap two cards on your team
   - Or skip the swap

5. **Results:**
   - Final scores are calculated
   - Winner is announced

## 🏗️ Project Architecture

```
Drafter/
├── src/                    # Backend (Node.js/Express/Socket.IO)
│   ├── game/               # Game domain logic
│   │   ├── types.ts        # TypeScript interfaces
│   │   ├── cards.ts        # Character data
│   │   └── roomManager.ts  # Game state & rules
│   ├── services/           # Helpers
│   │   └── matchLifecycle.ts
│   ├── sockets/            # Real-time events
│   │   └── gameHandlers.ts # Socket.IO listeners
│   └── index.ts            # Server entry point
│
├── client/                 # Frontend (React/Vite/Tailwind)
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── RoomLobby.tsx
│   │   │   ├── GameBoard.tsx
│   │   │   ├── DraftCard.tsx
│   │   │   ├── TeamSlot.tsx
│   │   │   └── PlayerPanel.tsx
│   │   ├── context/        # Socket.IO context & hooks
│   │   │   └── SocketContext.tsx
│   │   ├── types/          # TypeScript definitions
│   │   ├── constants/      # Static data
│   │   ├── App.tsx         # Root component
│   │   ├── main.tsx        # React entry point
│   │   └── index.css       # Tailwind styles
│   ├── vite.config.ts      # Vite configuration
│   ├── tailwind.config.js  # Tailwind theme
│   └── index.html          # HTML template
│
├── public/                 # Static assets & built frontend
├── package.json            # Backend dependencies
├── tsconfig.json           # TypeScript config
└── README.md               # Full documentation
```

## 🔗 Socket Events

### Client Sends

- `create_room` → Start new game
- `join_room` → Join existing game
- `draw_card` → Draw from deck
- `assign_card` → Place card on team
- `skip_card` → Discard card (once per player)
- `swap_cards` → Swap two team members
- `skip_swap` → Skip the swap phase

### Server Sends

- `room_created` → Room established
- `room_updated` → State changed
- `game_over` → Scores & winner
- `invalid_action` → Action rejected

## 🧪 Testing

### Type Check

```bash
npm run typecheck
cd client && npm run typecheck
```

### Manual Testing

- Open dev tools Console for Socket events
- Check Network tab for WebSocket communication
- Use React DevTools to inspect component state

## 🐛 Troubleshooting

| Problem                                | Solution                                          |
| -------------------------------------- | ------------------------------------------------- |
| **Port 3000 already in use**           | Change PORT env var: `PORT=3001 npm run dev`      |
| **Vite localhost:5173 not accessible** | Check firewall or use `localhost:5173` explicitly |
| **Socket.IO connection fails**         | Ensure backend is running on port 3000            |
| **Cards not loading**                  | Check all-cards.ts is imported correctly          |
| **Styles not applying**                | Clear browser cache: Ctrl+Shift+Del               |
| **Infinite loading**                   | Check browser console for JavaScript errors       |

## 📦 Dependencies

### Backend

- `express` - Web framework
- `socket.io` - WebSocket library
- `cors` - Cross-origin requests
- `typescript` - Type safety
- `ts-node` - TypeScript runner
- `nodemon` - Auto-reload

### Frontend

- `react` - UI library
- `react-dom` - DOM rendering
- `socket.io-client` - WebSocket client
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `typescript` - Type safety

## 🎨 Customization

### Add More Characters

Edit `src/game/cards.ts` and `client/src/constants/cards.ts`:

```typescript
{
  id: "character_name",
  name: "Character Full Name",
  anime: "one_piece" | "naruto" | "bleach",
  stats: {
    captain: 85,
    viceCaptain: 80,
    tank: 75,
    healer: 65,
    support: 70,
  },
}
```

### Change Game Rules

Modify logic in `src/game/roomManager.ts`:

- Adjust team size
- Add new roles
- Change scoring
- Modify skip/swap mechanics

### Customize Styling

Edit `client/tailwind.config.js` and `client/src/index.css`

## 📚 Learn More

- [Socket.IO Docs](https://socket.io/docs/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Guide](https://vitejs.dev/)
- [Express.js](https://expressjs.com/)

## 🚀 Deployment

### Deploy to Heroku

```bash
heroku create your-app-name
git push heroku main
```

### Deploy to Vercel (Frontend) + Railway (Backend)

- Frontend: Push client/ to Vercel
- Backend: Push src/ to Railway
- Update socket connection URL in SocketContext

### Deploy to Docker

```bash
docker build -t anime-draft .
docker run -p 3000:3000 anime-draft
```

## 📄 License

MIT - Free to use and modify

---

**Happy drafting! May the best anime team win! 🎴⚔️**
