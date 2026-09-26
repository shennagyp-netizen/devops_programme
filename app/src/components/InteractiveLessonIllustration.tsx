"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { AnimationStage, getAnimation, type AnimationTimedCueV1 } from "../animations";
import { curriculumIllustrationBindings } from "../data/curriculumIllustrationBindings";
import { animationCuesForVoice } from "../data/lessonVoiceAnimation";
import { useLessonVoiceClock } from "./LessonVoiceClock";

const PLAYBACK_STEP_MS = 900;

export function InteractiveLessonIllustration({ bindingId }: { bindingId: string }) {
  const binding = curriculumIllustrationBindings.find(
    (candidate) => candidate.id === bindingId
  );
  const definition = binding?.animationId
    ? getAnimation(binding.animationId)
    : undefined;
  const clock = useLessonVoiceClock();
  const [completed, setCompleted] = useState<string[]>([]);
  const [playing, setPlaying] = useState(false);
  const [playbackStepIndex, setPlaybackStepIndex] = useState(0);

  const voiceCues = useMemo(
    () => (binding ? animationCuesForVoice(binding, undefined) : []),
    [binding]
  );

  const playbackCues: AnimationTimedCueV1[] = useMemo(
    () =>
      (binding?.interactionSteps ?? []).map((step, index) => ({
        voiceCueId: "playback:" + step.id,
        startMs: index * PLAYBACK_STEP_MS,
        eventIds: step.successEventIds
      })),
    [binding]
  );

  const playbackTimeMs = Math.min(
    playbackStepIndex * PLAYBACK_STEP_MS + 800,
    Math.max(0, (binding?.interactionSteps.length ?? 1) * PLAYBACK_STEP_MS)
  );

  useEffect(() => {
    if (!playing || !binding?.interactionSteps.length) return;

    const timer = window.setInterval(() => {
      setPlaybackStepIndex((current) => {
        const lastIndex = binding.interactionSteps.length - 1;
        if (current >= lastIndex) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, PLAYBACK_STEP_MS);

    return () => window.clearInterval(timer);
  }, [binding, playing]);

  if (!binding || !definition) {
    if (bindingId === "D2.2:d2-2-dns") {
      return (
        <Paper withBorder p="md" radius="md">
          <Text fw={700}>DNS resolution path</Text>
          <Text size="sm" c="dimmed" mt="xs">
            Client → Recursive Resolver → Root Server → TLD Server → Authoritative Server → Answer Returns.
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            The interactive animation is unavailable, so the complete learning path remains available as text.
          </Text>
        </Paper>
      );
    }

    return (
      <Text c="dimmed">
        This interactive illustration is unavailable because its curriculum
        binding is invalid.
      </Text>
    );
  }

  const nextStep = binding.interactionSteps.find(
    (step) => !completed.includes(step.id)
  );

  const allCues = [...voiceCues, ...playbackCues];

  return (
    <Stack gap="sm">
      <AnimationStage
        definition={definition}
        cues={allCues}
        currentTimeMs={playbackTimeMs}
      />

      <Paper withBorder p="sm" radius="md">
        <Group justify="space-between" wrap="wrap">
          <Text size="sm" fw={700}>
            Visual playback
          </Text>
          <Group gap="xs">
            <Button
              size="compact-sm"
              variant="light"
              onClick={() => setPlaying((value) => !value)}
              disabled={playbackStepIndex >= binding.interactionSteps.length - 1}
            >
              {playing ? "Pause" : "Play"}
            </Button>
            <Button
              size="compact-sm"
              variant="subtle"
              onClick={() => {
                setPlaying(false);
                setPlaybackStepIndex(0);
                setCompleted([]);
              }}
            >
              Reset
            </Button>
          </Group>
        </Group>
      </Paper>

      {nextStep ? (
        <Paper withBorder p="md" radius="md">
          <Text size="xs" fw={800} c="dimmed" tt="uppercase">
            Step {nextStep.order} of {binding.interactionSteps.length}
          </Text>
          <Text mt="xs">{nextStep.prompt}</Text>
          <Button
            mt="sm"
            onClick={() =>
              setCompleted((steps) =>
                steps.includes(nextStep.id) ? steps : [...steps, nextStep.id]
              )
            }
          >
            Complete this boundary
          </Button>
        </Paper>
      ) : (
        <Text size="sm" c="dimmed">
          Visual path complete. Explain which boundary supplied the evidence.
        </Text>
      )}
    </Stack>
  );
}
