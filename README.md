# 🎴 Anime Draft Arena

A fully modular real-time multiplayer web application where two players compete in strategic anime character drafting battles. Players draw cards featuring characters from _One Piece, Naruto, and Bleach_, assign them to role-specific team slots, and compete for the highest combined stats.

## 🎯 Features

- **Real-time Multiplayer**: Uses Socket.IO for instant game synchronization
- **Turn-Based Drafting**: Players take turns drawing from a shuffled deck
- **Role-Based Stats**: 5 team slots (Captain, Vice Captain, Tank, Healer, Support) with character-specific stats
- **Skip Mechanic**: One-time per player to discard unwanted cards
- **Instant Scoring**: Backend calculates final scores and announces winners in real-time
- **Clean Architecture**: Modular backend and frontend with clear separation of concerns

## 📁 Project Structure

### Backend (`src/`)

- **`game/`** - Pure domain logic
  - `types.ts` - Game data structures
  - `cards.ts` - Card database with character stats
  - `roomManager.ts` - Game state management and rules enforcement
- **`services/`** - Match lifecycle helpers
  - `matchLifecycle.ts` - Match initialization and utilities
- **`sockets/`** - Real-time event handlers
  - `gameHandlers.ts` - Socket.IO event listeners and broadcasts
- **`server/`** - Express bootstrap (index.ts)

### Frontend (`client/src/`)

- **`context/`** - Global state management
  - `SocketContext.tsx` - Socket.IO connection and game state hook
- **`components/`** - Reusable UI components
  - `RoomLobby.tsx` - Create/join room interface
  - `GameBoard.tsx` - Main game board with turn management
  - `DraftCard.tsx` - Displays currently drawn card
  - `PlayerPanel.tsx` - Team display and management
  - `TeamSlot.tsx` - Individual role slots
- **`types/`** - TypeScript type definitions
  - `game.ts` - Shared game types
- **`constants/`** - Static data
  - `cards.ts` - Character database

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Backend Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Frontend Setup

1. Navigate to client folder:

```bash
cd client
npm install
```

2. Start dev server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` with proxy to backend

3. To build for production:

```bash
npm run build
```

## 🎮 How to Play

1. **Create or Join Room**: Enter your name and either create a new room or join an existing one
2. **Draft Phase**:
   - Current player clicks "Draw Card" to receive a random character
   - Assign the card to an available team slot (Captain, Vice Captain, etc.)
   - Cards are permanently removed from the deck
   - Use your one-time skip to discard an unwanted card
3. **Scoring**:
   - Once all 5 slots are filled for both players, the game calculates final scores
   - Each card contributes its role-specific stat to the final total
   - Highest score wins!

## 🔧 Game Rules

- **Deck**: 16 characters from three anime series (balanced stats)
- **Team Size**: 5 fixed roles per player
- **Turn Order**: Alternates between players
- **Skip**: One-time per player, discards drawn card without assignment
- **Scoring**: Sum of role-specific stats for assigned cards
- **Win Condition**: Higher final score (ties are possible)

## 📡 Socket Events

### Client → Server

- `create_room` - Create new game room
- `join_room` - Join existing room
- `draw_card` - Draw random card from deck
- `assign_card` - Assign drawn card to a role
- `skip_card` - Skip current drawn card

### Server → Client

- `welcome` - Connection confirmation
- `room_created` - New room created
- `room_updated` - Game state updated
- `game_over` - Final scores and winner
- `invalid_action` - Action validation error

## 🎨 Styling

The frontend uses **Tailwind CSS** with custom anime-themed colors:

- One Piece: Orange (#FF6B00)
- Naruto: Yellow (#F5A623)
- Bleach: Purple (#9B59B6)

## 🧪 Testing

### Type Checking

```bash
# Backend
npm run typecheck

# Frontend
cd client && npm run typecheck
```

### Running Tests

Visit `http://localhost:3000` to see a simple test HTML page, or use the full React UI.

## 📦 Production Build

1. Build frontend:

```bash
cd client && npm run build
```

2. Build backend:

```bash
npm run build
```

3. Start production server:

```bash
npm start
```

Frontend will be served from `public/` directory.

## 🐛 Debugging Tips

- **Server logs**: Check terminal for game events and errors
- **Network tab**: Monitor Socket.IO events in browser DevTools
- **React DevTools**: Use browser React extension for component inspection
- **Turn validation**: Server enforces turn ownership, check game state in room object
- **Card state**: All card state lives on server, client reflects it in real-time

## 🔐 State Synchronization

- **Server of Truth**: All game logic runs on backend for security
- **Client as Renderer**: Frontend is purely presentational
- **Optimistic Updates**: Socket context manages state with immediate UI feedback
- **Event-driven**: Every action is validated server-side before confirming to all clients

## 🎯 Design Principles

1. **Modularity**: Each folder has a single responsibility
2. **Type Safety**: Full TypeScript across stack
3. **No Coupling**: Game logic independent of socket layer
4. **Easy Debugging**: Clear event naming and centralized state
5. **Extensibility**: Simple to add features, modify rules, or add characters

## 💡 Future Enhancements

- Multiple rooms with different rule sets
- Player profiles and statistics
- Chat during matches
- Elo rating system
- More anime series and characters
- Replay system
- AI opponent

## 📄 License

MIT Backend (TypeScript)

A minimal Node.js backend using Express and Socket.IO in TypeScript.

## Scripts

- `npm run dev`: Start in watch mode with nodemon + ts-node
- `npm run build`: Compile TypeScript to `dist/`
- `npm start`: Run compiled server from `dist/`

## Quick Start

```bash
npm install
npm run dev
```

Then open `http://localhost:3000/health` to verify.

## Socket.IO

On connection the server emits `welcome`. It echoes `ping` with `pong`.

Example client snippet:

```ts
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");
socket.on("welcome", console.log);
socket.emit("ping", { ts: Date.now() });
socket.on("pong", console.log);
```
