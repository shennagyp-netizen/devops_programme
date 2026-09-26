"use client";

import { useEffect, useRef, useState } from "react";
import { ActionIcon, Badge, Button, Group, Loader, Paper, ScrollArea, Stack, Text, Textarea, ThemeIcon } from "@mantine/core";
import type { AssistantMessage } from "./types";
import type { TutorContext } from "../../lib/tutor-contract";

type RecognitionEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionConstructor = new () => Recognition;

function recognitionConstructor() {
  if (typeof window === "undefined") return undefined;
  const candidate = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition;
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

const queueKey = "devops-programme:tutor-pending:v1";
type PendingQuery = { lessonId: string; content: string };

function readPendingQueries(): PendingQuery[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(queueKey) ?? "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 4) : [];
  } catch {
    return [];
  }
}

function writePendingQueries(value: PendingQuery[]) {
  try {
    localStorage.setItem(queueKey, JSON.stringify(value.slice(0, 4)));
  } catch {
    // Local storage is optional; the assistant must continue to work without it.
  }
}

export function AssistantPanel({ context, onClose, mobile }: {
  context: TutorContext;
  onClose: () => void;
  mobile: boolean;
}) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("");
  const recognitionRef = useRef<Recognition | null>(null);

  useEffect(() => {
    setMessages([]);
    setQuery("");
    setStatus("");
    window.speechSynthesis?.cancel();
  }, [context.lessonId]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  async function submitQuestion() {
    const content = query.trim();
    if (!content || busy) return;
    const userMessage: AssistantMessage = { id: crypto.randomUUID(), role: "user", content, createdAt: Date.now() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setQuery("");
    setBusy(true);
    setStatus("");

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: context.lessonId, messages: nextMessages.slice(-12).map(({ role, content: text }) => ({ role, content: text })) })
      });
      const payload = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || !payload.text) throw new Error(payload.error || "Tutor request failed.");

      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: payload.text!, createdAt: Date.now() }]);
      speak(payload.text);
    } catch (error) {
      const pending = readPendingQueries();
      writePendingQueries([...pending.filter((item) => item.content !== content || item.lessonId !== context.lessonId), { lessonId: context.lessonId, content }]);
      setStatus(error instanceof Error ? error.message : "The tutor is unavailable.");
    } finally {
      setBusy(false);
    }
  }

  function startVoiceInput() {
    if (recording) return;
    const Constructor = recognitionConstructor();
    if (!Constructor) {
      setStatus("Voice input is not available in this browser. Type the question instead.");
      return;
    }

    const recognition = new Constructor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      if (transcript) setQuery(transcript);
    };
    recognition.onerror = () => {
      setRecording(false);
      setStatus("Voice recognition failed. You can type the question instead.");
    };
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    setRecording(true);
    setStatus("Listening…");
    recognition.start();
  }

  const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

  return (
    <Stack h="100%" gap="sm">
      <Group justify="space-between" align="flex-start">
        <Group gap="sm">
          <ThemeIcon size="lg" radius="xl" color="blue">AI</ThemeIcon>
          <div>
            <Text fw={700}>DevOps tutor</Text>
            <Text size="xs" c="dimmed">Private, lesson-aware coaching</Text>
          </div>
        </Group>
        <ActionIcon variant="subtle" onClick={onClose} aria-label="Close tutor">×</ActionIcon>
      </Group>

      <Paper withBorder p="sm" radius="md">
        <Group gap="xs" wrap="wrap">
          <Badge variant="light">{context.lessonId}</Badge>
          <Text size="sm">{context.lessonTitle}</Text>
        </Group>
        <Text size="xs" c="dimmed" mt="xs">{context.lessonObjective}</Text>
      </Paper>

      <ScrollArea.Autosize mah={mobile ? "50vh" : 420} offsetScrollbars>
        <Stack gap="sm" pr="xs">
          {messages.length === 0 ? (
            <Paper p="sm" bg="gray.0" radius="md">
              <Text size="sm">Ask about the current lesson, a failure, a command, or why the system behaves this way.</Text>
            </Paper>
          ) : null}

          {messages.map((message) => (
            <Paper key={message.id} p="sm" radius="md" bg={message.role === "user" ? "blue.0" : "gray.0"} ml={message.role === "user" ? "2rem" : 0} mr={message.role === "assistant" ? "2rem" : 0}>
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>{message.content}</Text>
              {message.role === "assistant" && hasSpeech ? (
                <Button variant="subtle" size="compact-xs" mt="xs" onClick={() => speak(message.content)}>Speak</Button>
              ) : null}
            </Paper>
          ))}

          {busy ? <Group gap="xs"><Loader size="xs" /><Text size="xs" c="dimmed">Tutor is thinking…</Text></Group> : null}
        </Stack>
      </ScrollArea.Autosize>

      <form onSubmit={(event) => { event.preventDefault(); void submitQuestion(); }}>
        <Stack gap="xs">
          <Textarea value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Ask about this lesson…" minRows={3} maxRows={6} autosize aria-label="Question for DevOps tutor" />
          <Group justify="space-between">
            <Group gap="xs">
              <Button type="button" variant={recording ? "filled" : "light"} color={recording ? "red" : "gray"} onClick={startVoiceInput} aria-label={recording ? "Listening for voice input" : "Start voice input"} disabled={busy || recording}>
                {recording ? "Listening…" : "Voice"}
              </Button>
              <Text size="xs" c="dimmed">{status || "The assistant does not replace the fixed podcast."}</Text>
            </Group>
            <Button type="submit" disabled={!query.trim() || busy}>Send</Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
