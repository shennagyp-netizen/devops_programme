import type { CurriculumIllustrationBindingV1 } from "./illustrationBindings";
import type { PodcastTtsSpeech } from "./podcastSync";

/**
 * Fixed podcast timing is intentionally not synthesized for TTS.
 *
 * The TTS engine emits runtime start/end/boundary events. A static millisecond
 * timeline would be an invented recording and would make animation timing
 * appear authoritative when it is not.
 */
export function animationCuesForVoice(
  _binding: CurriculumIllustrationBindingV1,
  _speech: PodcastTtsSpeech | undefined
) {
  return [];
}

export function missingVoiceCueIds(
  binding: CurriculumIllustrationBindingV1,
  speech: PodcastTtsSpeech | undefined
) {
  if (!speech) {
    return binding.voiceCueBindings.map((cue) => cue.voiceCueId);
  }

  return [];
}
