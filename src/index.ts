import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerGameHandlers } from "./sockets/gameHandlers";

const app = express();
app.use(cors());
app.use(express.json());

// (optional) serve a static client later from /public
app.use(express.static("public"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// register all socket.io events in separate module
registerGameHandlers(io);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
