import type { CurriculumIllustrationBindingV1 } from "./illustrationBindings";
import type { PodcastTtsSpeech } from "./podcastSync";

/**
 * TTS has runtime speech timing, not a static recording timeline.
 * Static animation timestamps therefore fail closed until runtime TTS
 * boundary events are explicitly connected to authored animation cues.
 */
export function animationCuesForVoice(
  _binding: CurriculumIllustrationBindingV1,
  _speech: PodcastTtsSpeech | undefined
) {
  return [];
}

export function missingVoiceCueIds(
  binding: CurriculumIllustrationBindingV1,
  _speech: PodcastTtsSpeech | undefined
) {
  return binding.voiceCueBindings.map((cue) => cue.voiceCueId);
}
