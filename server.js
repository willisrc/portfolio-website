import "dotenv/config.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { chatHandler } from "./html5up-dimension/routes/chats.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 9090;

// Log startup info
console.log("Starting server...");
console.log("ANTHROPIC_API_KEY is set:", !!process.env.ANTHROPIC_API_KEY);
console.log("Current directory:", process.cwd());

app.use(express.json());
app.use(express.static(path.join(__dirname, "html5up-dimension")));
app.post("/api/chat", chatHandler);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html5up-dimension", "index.html"));
});

app.listen(port, () => {
  console.log(`app running on http://localhost:${port}`);
});
