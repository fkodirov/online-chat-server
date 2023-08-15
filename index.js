const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const ws = new WebSocket.Server({ server });

app.use(express.json());

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});

ws.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
