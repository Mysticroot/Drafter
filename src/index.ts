import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { registerGameHandlers } from "./sockets/gameHandlers";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());

// 🔑 absolute path to public folder (works in dev + prod)
const publicPath = path.join(process.cwd(), "public");

// serve static files
app.use(express.static(publicPath));

// serve test.html on root
app.get("/", (_req, res) => {
  res.sendFile(path.join(publicPath, "test.html"));
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

registerGameHandlers(io);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});