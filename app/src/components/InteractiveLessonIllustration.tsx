"use client";

import { useMemo, useState } from "react";
import { AnimationStage, getAnimation, type AnimationTimedCueV1 } from "../animations";
import { curriculumIllustrationBindings } from "../data/curriculumIllustrationBindings";
import { animationCuesForVoice } from "../data/lessonVoiceAnimation";
import { useLessonVoiceClock } from "./LessonVoiceClock";

export function InteractiveLessonIllustration({ bindingId }: { bindingId: string }) {
  const binding = curriculumIllustrationBindings.find((candidate) => candidate.id === bindingId);
  const definition = binding?.animationId ? getAnimation(binding.animationId) : undefined;
  const clock = useLessonVoiceClock();
  const [completed, setCompleted] = useState<string[]>([]);

  const voiceCues = useMemo(
    () => (binding ? animationCuesForVoice(binding, undefined) : []),
    [binding, clock?.manifest]
  );
  const manualCues: AnimationTimedCueV1[] = completed.flatMap((stepId, index) => {
    const step = binding?.interactionSteps.find((candidate) => candidate.id === stepId);
    return step ? [{ voiceCueId: `manual:${step.id}`, startMs: index * 1000, eventIds: step.successEventIds }] : [];
  });

  if (!binding || !definition) {
    return <p className="range">This interactive illustration is unavailable because its curriculum binding is invalid.</p>;
  }

  const nextStep = binding.interactionSteps.find((step) => !completed.includes(step.id));
  const allCues = [...voiceCues, ...manualCues];
  const displayTimeMs = Math.max(clock?.elapsedMs ?? 0, completed.length * 1000 + 800);

  return (
    <div className="interactive-lesson-illustration" data-animation-id={definition.id}>
      <AnimationStage definition={definition} cues={allCues} currentTimeMs={displayTimeMs} />
      {nextStep ? (
        <div className="content-card">
          <span className="eyebrow">STEP {nextStep.order} OF {binding.interactionSteps.length}</span>
          <p>{nextStep.prompt}</p>
          <button className="primary" onClick={() => setCompleted((steps) => [...steps, nextStep.id])}>
            Complete this boundary
          </button>
        </div>
      ) : <p className="range">Request path complete: explain which boundary supplied the evidence.</p>}
    </div>
  );
}
