import type { ApiProvider } from "@prisma/client";
import { decrypt } from "./encryption";
import { prisma } from "./db";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function chatWithUserAI(
  userId: string,
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<string> {
  const apiKey = await prisma.apiKey.findFirst({
    where: { userId, verifiedAt: { not: null } },
    orderBy: { updatedAt: "desc" },
  });

  if (!apiKey) {
    throw new Error("No verified API key found. Connect your key or use demo mode.");
  }

  const key = decrypt(apiKey.encryptedKey, apiKey.iv);
  const allMessages: ChatMessage[] = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  switch (apiKey.provider) {
    case "OPENAI":
      return callOpenAI(key, allMessages);
    case "ANTHROPIC":
      return callAnthropic(key, allMessages);
    case "GOOGLE":
      return callGoogle(key, allMessages);
    case "GROQ":
      return callGroq(key, allMessages);
    case "MISTRAL":
      return callMistral(key, allMessages);
    default:
      return callOpenAI(key, allMessages);
  }
}

async function callOpenAI(key: string, messages: ChatMessage[]): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? "No response";
}

async function callAnthropic(key: string, messages: ChatMessage[]): Promise<string> {
  const system = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system: system?.content,
      messages: chatMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error: ${err}`);
  }

  const data = await res.json();
  return data.content[0]?.text ?? "No response";
}

async function callGoogle(key: string, messages: ChatMessage[]): Promise<string> {
  const lastUser = messages.filter((m) => m.role === "user").pop();
  const system = messages.find((m) => m.role === "system");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system.content }] } : undefined,
        contents: [
          {
            role: "user",
            parts: [{ text: lastUser?.content ?? "Hello" }],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google AI error: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response";
}

async function callGroq(key: string, messages: ChatMessage[]): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? "No response";
}

async function callMistral(key: string, messages: ChatMessage[]): Promise<string> {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? "No response";
}

export async function verifyApiKey(provider: ApiProvider, key: string): Promise<boolean> {
  try {
    const messages: ChatMessage[] = [{ role: "user", content: "Say 'connected' in one word." }];
    switch (provider) {
      case "OPENAI":
        await callOpenAI(key, messages);
        return true;
      case "ANTHROPIC":
        await callAnthropic(key, messages);
        return true;
      case "GOOGLE":
        await callGoogle(key, messages);
        return true;
      case "GROQ":
        await callGroq(key, messages);
        return true;
      case "MISTRAL":
        await callMistral(key, messages);
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
}
