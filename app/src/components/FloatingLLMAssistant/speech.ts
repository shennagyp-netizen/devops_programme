export function splitTutorSpeech(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+|(?<=:)\s+(?=[A-Z0-9])/)
    .map((part) => part.trim())
    .filter(Boolean);
}
