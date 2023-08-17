require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const Message = require("./models/message-model");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const ws = new WebSocket.Server({ server });

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});

app.post("/messages", async (req, res) => {
  const { text, tags: messageTags, userId } = req.body;
  try {
    const message = await Message.create({
      text,
      tags: messageTags,
      timestamp: new Date(),
      userId,
    });

    ws.clients.forEach((client) => {
      client.send(JSON.stringify(message));
    });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Not saved!" });
  }
});

app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.findAll();
    res.json(messages);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching messages." });
  }
});

app.get("/tags", async (req, res) => {
  try {
    const messages = await Message.findAll({
      attributes: ["tags"],
    });
    const tags = messages.map((message) => message.tags);
    const allTags = [];

    tags.forEach((item) => {
      const tagsInItem = item.match(/#[а-яёА-ЯЁa-zA-Z0-9_]+/gi);
      if (tagsInItem) {
        allTags.push(...tagsInItem);
      }
    });
    res.json([...new Set(allTags)]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching tags." });
  }
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
