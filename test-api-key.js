import "dotenv/config.js";
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;

console.log("Testing Anthropic API Key...");
console.log("API Key loaded:", apiKey ? "✓ Yes" : "✗ No");

if (!apiKey) {
  console.error("ERROR: ANTHROPIC_API_KEY not found in environment");
  process.exit(1);
}

const client = new Anthropic({ apiKey });

try {
  console.log("Attempting to call Anthropic API with a simple message...");
  
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 100,
    messages: [
      { role: "user", content: "Say 'API key is valid' if you can read this." }
    ],
  });

  console.log("\n✓ SUCCESS! API Key is valid and working!");
  console.log("Response:", message.content[0].text);
  process.exit(0);
} catch (error) {
  console.error("\n✗ ERROR! API Key test failed:");
  console.error("Status:", error.status);
  console.error("Type:", error.type);
  console.error("Message:", error.message);
  
  if (error.error?.message) {
    console.error("API Error:", error.error.message);
  }
  
  process.exit(1);
}
