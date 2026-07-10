import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

export function createAnthropicClient(apiKey = process.env.ANTHROPIC_API_KEY) {
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  return new Anthropic({ apiKey });
}

function getSystemPrompt() {
  try {
    const resume = fs.readFileSync(
      path.join(process.cwd(), "public", "resume", "resume.md"),
      "utf-8"
    );

    return `You are an AI assistant embedded on the personal resume website of a software engineer. 
Answer questions about them based solely on the resume content below. 
Be conversational, concise, and honest — if something isn't covered in the resume, say so.
Never fabricate experience, skills, or details not present in the resume.

--- RESUME ---
${resume}
--- END RESUME ---`;
  } catch (error) {
    throw new Error(`Failed to load resume: ${error.message}`);
  }
}

export async function chatHandler(req, res) {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }

  try {
    const client = createAnthropicClient();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: getSystemPrompt(),
      messages,
    });

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Chat API Error:", {
      message: error.message,
      status: error.status,
      error: error.error,
      type: error.type,
      fullError: error,
    });
    if (!res.headersSent) {
      res.status(500).json({ 
        error: error.message || "Failed to process chat request",
        details: error.error?.message || error.type,
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}