"use client";

import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  ThemeIcon
} from "@mantine/core";
import type { AssistantMessage } from "./types";
import type { TutorContext } from "../../lib/tutor-contract";
import { splitTutorSpeech } from "./speech";

type RecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

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

type PendingQuery = {
  lessonId: string;
  content: string;
  createdAt: number;
};

const PENDING_QUEUE_KEY = "devops-programme:tutor-pending:v2";
const PENDING_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_PENDING_QUERIES = 4;

function recognitionConstructor() {
  if (typeof window === "undefined") return undefined;

  const candidate = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };

  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition;
}

function speakTutorResponse(text: string) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return false;
  }

  const units = splitTutorSpeech(text);
  if (!units.length) return false;

  window.speechSynthesis.cancel();

  for (const unit of units) {
    const utterance = new SpeechSynthesisUtterance(unit);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  return true;
}

function readPendingQueries(): PendingQuery[] {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(PENDING_QUEUE_KEY) ?? "[]"
    ) as unknown;

    if (!Array.isArray(parsed)) return [];

    const now = Date.now();

    return parsed
      .filter((item): item is PendingQuery => {
        if (!item || typeof item !== "object") return false;
        const candidate = item as Record<string, unknown>;

        return (
          typeof candidate.lessonId === "string" &&
          typeof candidate.content === "string" &&
          typeof candidate.createdAt === "number" &&
          Number.isFinite(candidate.createdAt) &&
          now - candidate.createdAt < PENDING_TTL_MS
        );
      })
      .slice(0, MAX_PENDING_QUERIES);
  } catch {
    return [];
  }
}

function writePendingQueries(value: PendingQuery[]) {
  try {
    localStorage.setItem(
      PENDING_QUEUE_KEY,
      JSON.stringify(value.slice(0, MAX_PENDING_QUERIES))
    );
  } catch {
    // Browser storage is optional; the tutor must remain usable without it.
  }
}

function queuePendingQuery(query: PendingQuery) {
  const next = readPendingQueries().filter(
    (item) => item.lessonId !== query.lessonId || item.content !== query.content
  );
  next.push(query);
  writePendingQueries(next);
}

function removePendingQuery(query: PendingQuery) {
  writePendingQueries(
    readPendingQueries().filter(
      (item) => item.lessonId !== query.lessonId || item.content !== query.content
    )
  );
}

export function AssistantPanel({
  context,
  onClose,
  mobile
}: {
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

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  async function requestTutor(conversation: AssistantMessage[]) {
    const response = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: context.lessonId,
        messages: conversation
          .slice(-12)
          .map(({ role, content: message }) => ({
            role,
            content: message
          }))
      })
    });

    const payload = (await response.json()) as {
      text?: string;
      error?: string;
    };

    if (!response.ok || !payload.text) {
      throw new Error(payload.error || "Tutor request failed.");
    }

    return payload.text;
  }

  async function submitQuestion(options?: {
    content?: string;
    fromPending?: boolean;
  }) {
    const content = (options?.content ?? query).trim();

    if (!content || busy) return;

    const userMessage: AssistantMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: Date.now()
    };

    const alreadyVisible =
      options?.fromPending &&
      messages.some(
        (message) =>
          message.role === "user" &&
          message.content === content
      );

    const nextMessages = alreadyVisible
      ? messages
      : [...messages, userMessage];

    setMessages(nextMessages);
    setQuery("");
    setBusy(true);
    setStatus("");

    try {
      const response = await requestTutor(nextMessages);

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response,
          createdAt: Date.now()
        }
      ]);

      removePendingQuery({
        lessonId: context.lessonId,
        content,
        createdAt: 0
      });

      if (!speakTutorResponse(response)) {
        setStatus(
          "The tutor response is available as text; audio playback is unavailable in this browser."
        );
      }
    } catch (error) {
      queuePendingQuery({
        lessonId: context.lessonId,
        content,
        createdAt: Date.now()
      });

      setStatus(
        error instanceof Error
          ? error.message + " Your question was kept locally for retry."
          : "The tutor is unavailable. Your question was kept locally for retry."
      );
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    function retryPendingQueries() {
      if (busy || !navigator.onLine) return;

      const pending = readPendingQueries().find(
        (item) => item.lessonId === context.lessonId
      );

      if (!pending) return;

      setStatus("Connection restored. Retrying your pending question…");
      void submitQuestion({
        content: pending.content,
        fromPending: true
      });
    }

    window.addEventListener("online", retryPendingQueries);

    if (navigator.onLine) {
      retryPendingQueries();
    }

    return () => window.removeEventListener("online", retryPendingQueries);
  }, [context.lessonId]);

  function startVoiceInput() {
    if (recording) return;

    const Constructor = recognitionConstructor();

    if (!Constructor) {
      setStatus(
        "Voice input is not available in this browser. Type the question instead."
      );
      return;
    }

    const recognition = new Constructor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[0]?.[0]?.transcript?.trim() ?? "";

      if (transcript) {
        setQuery(transcript);
        setStatus("Voice question captured. Sending it to the tutor…");
        void submitQuestion({ content: transcript });
      }
    };

    recognition.onerror = () => {
      setRecording(false);
      setStatus(
        "Voice recognition failed. You can type the question instead."
      );
    };

    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    setRecording(true);
    setStatus("Listening…");
    recognition.start();
  }

  const hasSpeech =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined";

  return (
    <Stack h="100%" gap="sm">
      <Group justify="space-between" align="flex-start">
        <Group gap="sm">
          <ThemeIcon size="lg" radius="xl" color="blue">
            AI
          </ThemeIcon>
          <div>
            <Text fw={700}>DevOps tutor</Text>
            <Text size="xs" c="dimmed">
              Private, lesson-aware coaching
            </Text>
          </div>
        </Group>

        <ActionIcon
          variant="subtle"
          onClick={onClose}
          aria-label="Close tutor"
        >
          ×
        </ActionIcon>
      </Group>

      <Paper withBorder p="sm" radius="md">
        <Group gap="xs" wrap="wrap">
          <Badge variant="light">{context.lessonId}</Badge>
          <Text size="sm">{context.lessonTitle}</Text>
        </Group>
        <Text size="xs" c="dimmed" mt="xs">
          {context.lessonObjective}
        </Text>
      </Paper>

      <ScrollArea.Autosize
        mah={mobile ? "50vh" : 420}
        offsetScrollbars
      >
        <Stack gap="sm" pr="xs">
          {messages.length === 0 ? (
            <Paper p="sm" bg="gray.0" radius="md">
              <Text size="sm">
                Ask about the current lesson, a failure, a command, or why the
                system behaves this way.
              </Text>
            </Paper>
          ) : null}

          {messages.map((message) => (
            <Paper
              key={message.id}
              p="sm"
              radius="md"
              bg={message.role === "user" ? "blue.0" : "gray.0"}
              ml={message.role === "user" ? "2rem" : 0}
              mr={message.role === "assistant" ? "2rem" : 0}
            >
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {message.content}
              </Text>

              {message.role === "assistant" && hasSpeech ? (
                <Button
                  variant="subtle"
                  size="compact-xs"
                  mt="xs"
                  onClick={() => speakTutorResponse(message.content)}
                >
                  Speak
                </Button>
              ) : null}
            </Paper>
          ))}

          {busy ? (
            <Group gap="xs">
              <Loader size="xs" />
              <Text size="xs" c="dimmed">
                Tutor is thinking…
              </Text>
            </Group>
          ) : null}
        </Stack>
      </ScrollArea.Autosize>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submitQuestion();
        }}
      >
        <Stack gap="xs">
          <Textarea
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Ask about this lesson…"
            minRows={3}
            maxRows={6}
            autosize
            aria-label="Question for DevOps tutor"
          />

          <Group justify="space-between">
            <Group gap="xs">
              <Button
                type="button"
                variant={recording ? "filled" : "light"}
                color={recording ? "red" : "gray"}
                onClick={startVoiceInput}
                aria-label={
                  recording
                    ? "Listening for voice input"
                    : "Start voice input"
                }
                disabled={busy || recording}
              >
                {recording ? "Listening…" : "Voice"}
              </Button>

              <Text size="xs" c="dimmed">
                {status ||
                  "The assistant does not replace the fixed podcast."}
              </Text>
            </Group>

            <Button type="submit" disabled={!query.trim() || busy}>
              Send
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
