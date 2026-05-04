import { GoogleGenerativeAI } from "@google/generative-ai";

const getModel = () => {
  const key = process.env.GEMINI_API_KEY;
  console.log("[AI] GEMINI_API_KEY present:", !!key, "| length:", key?.length);
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

const extractJSON = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in AI response");
  return JSON.parse(match[0]);
};

export const handleTicketWithAI = async (ticket) => {
  const model = getModel();

  const prompt = `You are a customer support AI assistant. A customer submitted a support ticket.

Subject: "${ticket.subject}"
Category: ${ticket.category}
Description: "${ticket.description}"

Decide if you can fully resolve this with a helpful reply, or if a human agent is needed.

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "canHandle": true or false,
  "reply": "your reply to the customer (only if canHandle is true, keep under 150 words)",
  "reason": "why human agent is needed (only if canHandle is false)",
  "confidence": number between 0 and 100
}

Guidelines:
- canHandle true: general FAQs, feature questions, simple troubleshooting steps, status inquiries
- canHandle false: billing disputes, account access requiring verification, sensitive complaints, complex bugs`;

  try {
    const result = await model.generateContent(prompt);
    return extractJSON(result.response.text());
  } catch {
    return { canHandle: false, reason: "AI unavailable", confidence: 0 };
  }
};

// Always generates a contextual reply using full conversation history
export const chatWithAI = async (ticket, messages) => {
  console.log("[chatWithAI] called — ticket:", ticket._id, "| messages:", messages.length);
  const model = getModel();

  const history = messages
    .map((m) => {
      const role = m.sender === "customer" ? "Customer" : m.sender === "ai" ? "AI Assistant" : "Agent";
      return `${role}: ${m.content}`;
    })
    .join("\n");

  const prompt = `You are a helpful customer support AI assistant.

Support ticket context:
Subject: "${ticket.subject}"
Category: ${ticket.category}
Description: "${ticket.description}"

Conversation history:
${history}

The customer just sent their latest message (the last Customer line above). Write a helpful, context-aware reply. Keep it concise (under 120 words) and professional. If the issue clearly requires human intervention (billing disputes, account access requiring manual verification, legal/compliance matters), acknowledge the issue and let the customer know a human agent will assist them shortly.

Reply with plain text only (no markdown, no JSON).`;

  try {
    console.log("[chatWithAI] calling Gemini...");
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    console.log("[chatWithAI] Gemini reply received, length:", text.length);
    return text;
  } catch (err) {
    console.error("[chatWithAI] Gemini FAILED:", err?.message || err);
    return null;
  }
};

export const getSuggestedReplies = async (ticket, messages) => {
  const model = getModel();

  const history = messages
    .map((m) => `${m.sender.toUpperCase()}: ${m.content}`)
    .join("\n");

  const prompt = `You are a customer support AI. Generate 3 reply suggestions for a human support agent.

Ticket Subject: "${ticket.subject}"
Category: ${ticket.category}
Conversation so far:
${history || "(no messages yet)"}

Generate exactly 3 suggestions with different tones. Respond with ONLY valid JSON:
{
  "suggestions": [
    { "tone": "Professional", "confidence": 90, "text": "reply here" },
    { "tone": "Empathetic", "confidence": 85, "text": "reply here" },
    { "tone": "Technical", "confidence": 75, "text": "reply here" }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    return extractJSON(result.response.text());
  } catch {
    return {
      suggestions: [
        { tone: "Professional", confidence: 80, text: "Thank you for reaching out. We are looking into your issue and will get back to you shortly." },
        { tone: "Empathetic", confidence: 75, text: "We sincerely apologize for the inconvenience. Our team is on it and we will resolve this as quickly as possible." },
        { tone: "Technical", confidence: 70, text: "We have received your request and our technical team is investigating. Please allow us some time to diagnose the issue." },
      ],
    };
  }
};
