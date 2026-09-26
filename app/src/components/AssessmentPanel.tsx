"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Progress,
  Radio,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Title
} from "@mantine/core";
import type { AssessmentFamily, AssessmentItem } from "../data/assessment";
import type { CourseLevel } from "../data/programme";

type PublicItem = Omit<AssessmentItem, "correctOption">;

type StartedAssessment = {
  attemptId: string;
  formId: string;
  courseId: CourseLevel;
  sectionId: string;
  family: AssessmentFamily;
  startedAt: string;
  expiresAt: string;
  expectedMinutes: number;
  itemCount: number;
  items: PublicItem[];
};

type Answer = {
  itemId: string;
  value: number | string;
};

type Result = {
  itemCount: number;
  answeredCount: number;
  autoScoredCount: number;
  correctCount: number;
  autoScorePercent: number | null;
  reviewRequiredCount: number;
  status: "scored" | "submitted-review-required";
};

const familyLabels: Record<AssessmentFamily, string> = {
  conceptual: "Conceptual",
  diagnostic: "Diagnostic",
  "hands-on": "Hands-on"
};

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes + ":" + String(seconds).padStart(2, "0");
}

export function AssessmentPanel({
  courseId,
  sectionId
}: {
  courseId: CourseLevel;
  sectionId: string;
}) {
  const [selectedFamily, setSelectedFamily] =
    useState<AssessmentFamily>("conceptual");
  const [assessment, setAssessment] = useState<StartedAssessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const current = assessment?.items[currentIndex];

  const answeredCount = useMemo(
    () =>
      assessment?.items.reduce(
        (count, item) =>
          answers[item.id] !== undefined && String(answers[item.id]).trim() !== ""
            ? count + 1
            : count,
        0
      ) ?? 0,
    [assessment?.items, answers]
  );

  useEffect(() => {
    if (!assessment || result) return;

    const tick = () => {
      const remaining = new Date(assessment.expiresAt).getTime() - Date.now();
      setRemainingMs(Math.max(0, remaining));
      if (remaining <= 0 && !busy) {
        void submit(true);
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [assessment, result, busy, answers]);

  async function start() {
    setBusy(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/assessment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          sectionId,
          family: selectedFamily
        })
      });

      const payload = (await response.json()) as
        | StartedAssessment
        | { error?: string };

      if (!response.ok || !("attemptId" in payload)) {
        throw new Error(
          "error" in payload ? payload.error : "Assessment could not start."
        );
      }

      setAssessment(payload);
      setAnswers({});
      setMarked(new Set());
      setCurrentIndex(0);
      setRemainingMs(
        new Date(payload.expiresAt).getTime() - Date.now()
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Assessment could not start."
      );
    } finally {
      setBusy(false);
    }
  }

  async function submit(expired = false) {
    if (!assessment || busy) return;

    if (!expired) {
      const unanswered = assessment.items.length - answeredCount;
      const message =
        unanswered > 0
          ? "You have " + unanswered + " unanswered item(s). Submit anyway?"
          : "Submit this assessment now? You cannot change answers after submission.";

      if (!window.confirm(message)) return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: assessment.attemptId,
          answers: Object.entries(answers).map(([itemId, value]) => ({
            itemId,
            value
          }))
        })
      });

      const payload = (await response.json()) as { result?: Result; error?: string };

      if (!response.ok || !payload.result) {
        throw new Error(payload.error ?? "Assessment could not be submitted.");
      }

      setResult(payload.result);
      setRemainingMs(0);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Assessment could not be submitted."
      );
    } finally {
      setBusy(false);
    }
  }

  function setAnswer(value: number | string) {
    if (!current) return;
    setAnswers((previous) => ({ ...previous, [current.id]: value }));
  }

  function toggleMarked() {
    if (!current) return;
    setMarked((previous) => {
      const next = new Set(previous);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  }

  if (!assessment) {
    return (
      <Stack gap="md">
        <Paper withBorder p="lg" radius="lg">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" fw={800} c="blue" tt="uppercase">
                SECTION ASSESSMENT
              </Text>
              <Title order={3} mt={4}>
                Standardized assessment session
              </Title>
              <Text c="dimmed" mt="xs">
                The authored pilot bank remains unchanged. This screen controls
                the exam session, not the content authoring.
              </Text>
            </div>
            <Badge variant="light">V3 MVP</Badge>
          </Group>
        </Paper>

        <SimpleGrid cols={{ base: 1, md: 3 }}>
          {(Object.keys(familyLabels) as AssessmentFamily[]).map((family) => {
            const active = selectedFamily === family;
            const details =
              family === "conceptual"
                ? "20 items · 60 minutes · selected and constructed responses"
                : family === "diagnostic"
                  ? "12 items · 45 minutes · evidence and diagnosis"
                  : "8 tasks · 90 minutes · operational evidence";

            return (
              <Paper
                key={family}
                withBorder
                p="md"
                radius="lg"
                style={{
                  cursor: "pointer",
                  borderWidth: active ? 2 : 1
                }}
                onClick={() => setSelectedFamily(family)}
              >
                <Badge color={active ? "blue" : "gray"}>{familyLabels[family]}</Badge>
                <Text fw={700} mt="sm">{details}</Text>
                <Text size="sm" c="dimmed" mt="xs">
                  The form is generated from the existing competency and difficulty blueprint.
                </Text>
              </Paper>
            );
          })}
        </SimpleGrid>

        <Paper withBorder p="lg" radius="lg">
          <Text fw={700}>Session rules</Text>
          <Stack gap="xs" mt="sm">
            <Text size="sm">• One timed attempt is created when you start.</Text>
            <Text size="sm">• You can move backward and forward between items.</Text>
            <Text size="sm">• Mark items for review before final submission.</Text>
            <Text size="sm">• The server owns the answer key and final submission state.</Text>
            <Text size="sm">• Constructed and hands-on responses enter review instead of receiving a fabricated automatic score.</Text>
          </Stack>
        </Paper>

        {error ? <Text c="red">{error}</Text> : null}

        <Group justify="flex-end">
          <Button size="md" onClick={() => void start()} loading={busy}>
            Start {familyLabels[selectedFamily]} assessment
          </Button>
        </Group>
      </Stack>
    );
  }

  if (result) {
    return (
      <Stack gap="md">
        <Paper withBorder p="lg" radius="lg">
          <Badge color={result.status === "scored" ? "green" : "yellow"}>
            {result.status === "scored" ? "Scored" : "Submitted for review"}
          </Badge>
          <Title order={3} mt="sm">Assessment submitted</Title>
          <Text c="dimmed" mt="xs">
            {result.answeredCount} of {result.itemCount} items were answered.
          </Text>

          {result.autoScorePercent !== null ? (
            <Text fw={800} size="2rem" mt="md">
              {result.autoScorePercent}% automatic score
            </Text>
          ) : null}

          {result.reviewRequiredCount > 0 ? (
            <Paper withBorder p="md" mt="md" radius="md">
              <Text fw={700}>Review required</Text>
              <Text size="sm" c="dimmed" mt="xs">
                {result.reviewRequiredCount} response(s) require criterion-based
                review. The system does not invent a machine score for open-ended
                or practical evidence.
              </Text>
            </Paper>
          ) : null}
        </Paper>

        <Button
          variant="light"
          onClick={() => {
            setAssessment(null);
            setResult(null);
            setAnswers({});
            setMarked(new Set());
            setCurrentIndex(0);
          }}
        >
          Return to assessment selection
        </Button>
      </Stack>
    );
  }

  const progress = Math.round((answeredCount / assessment.items.length) * 100);
  const currentAnswer = current ? answers[current.id] : undefined;
  const markedCurrent = current ? marked.has(current.id) : false;

  return (
    <Stack gap="md">
      <Paper withBorder p="md" radius="lg">
        <Group justify="space-between">
          <div>
            <Badge>{familyLabels[assessment.family]}</Badge>
            <Text fw={700} mt={4}>
              {assessment.itemCount} items · {assessment.expectedMinutes} minutes
            </Text>
          </div>
          <div style={{ textAlign: "right" }}>
            <Text size="xs" c="dimmed">TIME REMAINING</Text>
            <Text fw={800} size="1.35rem">{formatRemaining(remainingMs)}</Text>
          </div>
        </Group>
        <Progress value={progress} mt="sm" aria-label="Assessment completion" />
        <Text size="xs" c="dimmed" mt="xs">
          {answeredCount}/{assessment.items.length} answered
        </Text>
      </Paper>

      <Paper withBorder p="sm" radius="lg">
        <ScrollArea type="auto" offsetScrollbars>
          <Group gap={6} wrap="nowrap">
            {assessment.items.map((item, index) => {
              const answered =
                answers[item.id] !== undefined &&
                String(answers[item.id]).trim() !== "";
              return (
                <Button
                  key={item.id}
                  size="compact-sm"
                  variant={index === currentIndex ? "filled" : answered ? "light" : "subtle"}
                  color={marked.has(item.id) ? "orange" : undefined}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={
                    "Go to item " +
                    String(index + 1) +
                    (marked.has(item.id) ? ", marked for review" : "")
                  }
                >
                  {index + 1}
                </Button>
              );
            })}
          </Group>
        </ScrollArea>
      </Paper>

      <Paper withBorder p={{ base: "md", sm: "lg" }} radius="lg">
        {current ? (
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" c="dimmed">
                  ITEM {currentIndex + 1} OF {assessment.items.length}
                </Text>
                <Text fw={700} size="sm" mt={4}>
                  {current.itemType instanceof Array
                    ? current.itemType.join(" · ")
                    : current.itemType}
                </Text>
              </div>
              <Button
                variant={markedCurrent ? "filled" : "light"}
                color={markedCurrent ? "orange" : "gray"}
                onClick={toggleMarked}
              >
                {markedCurrent ? "Marked for review" : "Mark for review"}
              </Button>
            </Group>

            <Divider />

            <Text size="lg" fw={600}>{current.prompt}</Text>

            {current.options?.length ? (
              <Radio.Group
                value={
                  typeof currentAnswer === "number"
                    ? String(currentAnswer)
                    : ""
                }
                onChange={(value) => setAnswer(Number(value))}
                aria-label="Assessment response"
              >
                <Stack gap="sm">
                  {current.options.map((option, index) => (
                    <Radio
                      key={option}
                      value={String(index)}
                      label={option}
                      size="md"
                    />
                  ))}
                </Stack>
              </Radio.Group>
            ) : (
              <Textarea
                value={typeof currentAnswer === "string" ? currentAnswer : ""}
                onChange={(event) => setAnswer(event.currentTarget.value)}
                minRows={8}
                maxLength={8000}
                label="Response / evidence"
                description={
                  current.family === "hands-on"
                    ? "Record the evidence, operation, diagnosis, recovery and verification required by the task."
                    : "Provide the reasoning requested by the assessment task."
                }
              />
            )}

            <Group justify="space-between">
              <Button
                variant="subtle"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              >
                Previous
              </Button>

              <Group>
                {currentIndex < assessment.items.length - 1 ? (
                  <Button
                    onClick={() =>
                      setCurrentIndex((index) =>
                        Math.min(assessment.items.length - 1, index + 1)
                      )
                    }
                  >
                    Save and next
                  </Button>
                ) : (
                  <Button color="green" onClick={() => void submit()} loading={busy}>
                    Submit assessment
                  </Button>
                )}
              </Group>
            </Group>
          </Stack>
        ) : null}
      </Paper>

      {error ? <Text c="red">{error}</Text> : null}
    </Stack>
  );
}
