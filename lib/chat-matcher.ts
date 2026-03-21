import { qaEntries, type QAEntry } from "./chat-qa";

export function matchQuestion(userMessage: string): QAEntry | null {
  const msg = userMessage.toLowerCase().trim();
  if (!msg) return null;

  let bestMatch: QAEntry | null = null;
  let bestScore = 0;

  for (const entry of qaEntries) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (msg.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    // Add priority bonus
    score += (entry.priority || 0) * 0.1;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Require at least 1 keyword match
  return bestScore >= 1 ? bestMatch : null;
}
