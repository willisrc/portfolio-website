import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { chatHandler } from "./html5up-dimension/routes/chats.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 9090;

// Log startup info
console.log("Starting server...");
const anthropicApiKey = process.env.ANTHROPIC_API_KEY?.trim();
console.log("ANTHROPIC_API_KEY is set:", Boolean(anthropicApiKey));
console.log("ANTHROPIC_API_KEY source:", process.env.ANTHROPIC_API_KEY ? "runtime env" : "missing");
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
