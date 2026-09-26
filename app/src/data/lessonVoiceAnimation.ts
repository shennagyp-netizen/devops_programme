import type { AnimationTimedCueV1 } from "../animations/runtime";
import type { CurriculumIllustrationBindingV1 } from "./illustrationBindings";
import type { PodcastAudioManifest } from "./podcastSync";

/**
 * Joins two authored sources without inventing timing: the audio alignment
 * supplies the clock, while the curriculum binding supplies animation events.
 */
export function animationCuesForVoice(
  binding: CurriculumIllustrationBindingV1,
  manifest: PodcastAudioManifest | undefined
): AnimationTimedCueV1[] {
  if (!manifest) return [];

  const audioCues = new Map(manifest.cues.map((cue) => [cue.id, cue]));

  return binding.voiceCueBindings.flatMap((bindingCue) => {
    const audioCue = audioCues.get(bindingCue.voiceCueId);
    if (!audioCue) return [];

    return [{
      voiceCueId: bindingCue.voiceCueId,
      startMs: audioCue.startMs,
      endMs: audioCue.endMs,
      offsetMs: bindingCue.offsetMs,
      eventIds: bindingCue.eventIds
    }];
  });
}

export function missingVoiceCueIds(
  binding: CurriculumIllustrationBindingV1,
  manifest: PodcastAudioManifest | undefined
) {
  const available = new Set(manifest?.cues.map((cue) => cue.id) ?? []);
  return binding.voiceCueBindings
    .map((cue) => cue.voiceCueId)
    .filter((cueId) => !available.has(cueId));
}
