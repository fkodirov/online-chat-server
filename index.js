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
    origin: "http://localhost:5173",
  })
);

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});

app.post("/messages", async (req, res) => {
  const { text, tags: messageTags } = req.body;
  try {
    const message = await Message.create({
      text,
      tags: messageTags.join(","),
      timestamp: new Date(),
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
      const tagsInItem = item.match(/#[a-z]+/gi);
      if (tagsInItem) {
        allTags.push(...tagsInItem);
      }
    });
    res.json(allTags);
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
