import type { ApiProvider } from "@prisma/client";

export interface ProviderConfig {
  id: ApiProvider;
  name: string;
  keyPrefix: string;
  docsUrl: string;
  stepKey: string;
}

export const AI_PROVIDERS: ProviderConfig[] = [
  {
    id: "OPENAI",
    name: "OpenAI",
    keyPrefix: "sk-",
    docsUrl: "https://platform.openai.com/api-keys",
    stepKey: "openai",
  },
  {
    id: "ANTHROPIC",
    name: "Anthropic",
    keyPrefix: "sk-ant-",
    docsUrl: "https://console.anthropic.com/settings/keys",
    stepKey: "anthropic",
  },
  {
    id: "GOOGLE",
    name: "Google AI (Gemini)",
    keyPrefix: "AI",
    docsUrl: "https://aistudio.google.com/apikey",
    stepKey: "google",
  },
  {
    id: "GROQ",
    name: "Groq",
    keyPrefix: "gsk_",
    docsUrl: "https://console.groq.com/keys",
    stepKey: "groq",
  },
  {
    id: "MISTRAL",
    name: "Mistral",
    keyPrefix: "",
    docsUrl: "https://console.mistral.ai/api-keys",
    stepKey: "mistral",
  },
];

export const SAFE_TOPICS = [
  "science",
  "mathematics",
  "history",
  "geography",
  "literature",
  "art",
  "music",
  "programming",
  "languages",
  "philosophy",
  "biology",
  "physics",
  "chemistry",
  "astronomy",
  "economics",
  "psychology",
  "health",
  "cooking",
  "sports",
  "nature",
  "technology",
  "education",
  "culture",
  "architecture",
  "engineering",
];

export const BLOCKED_TOPIC_PATTERNS = [
  /violence/i,
  /weapon/i,
  /drug/i,
  /explicit/i,
  /porn/i,
  /gambling/i,
  /hate/i,
  /terror/i,
];

export function isTopicSafe(topic: string): boolean {
  return !BLOCKED_TOPIC_PATTERNS.some((p) => p.test(topic));
}
