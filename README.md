# Drafter Backend (TypeScript)

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
