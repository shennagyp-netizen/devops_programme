import { difficultyLabel, getSectionAssessments } from "../data/assessment";
import type { CourseLevel } from "../data/programme";

const labels = {
  conceptual: "Conceptual",
  diagnostic: "Diagnostic",
  "hands-on": "Hands-on"
} as const;

export function AssessmentPanel({
  courseId,
  sectionId
}: {
  courseId: CourseLevel;
  sectionId: string;
}) {
  const assessments = getSectionAssessments(courseId, sectionId);

  return (
    <div className="assessment-stack">
      <div className="content-card">
        <span className="eyebrow">SECTION ASSESSMENT</span>
        <h3>Three exam forms</h3>
        <p>
          Every form mixes difficulty. The engineering problem gets harder;
          the English does not.
        </p>
      </div>

      {assessments.map((assessment) => (
        <div className="content-card assessment-card" key={assessment.family}>
          <div className="assessment-header">
            <div>
              <h4>{labels[assessment.family]}</h4>
              <p>
                {assessment.targetItemCount} items · {assessment.expectedMinutes} minutes ·{" "}
                {assessment.requiredCognitiveLevels.join(" · ")}
              </p>
            </div>
            <span className="coach-phase">{assessment.status}</span>
          </div>

          <div className="difficulty-grid">
            <span>
              Foundation {difficultyLabel(assessment.targetDifficultyMix.foundation)}
            </span>
            <span>
              Applied {difficultyLabel(assessment.targetDifficultyMix.applied)}
            </span>
            <span>
              Difficult {difficultyLabel(assessment.targetDifficultyMix.difficult)}
            </span>
            <span>
              Challenge {difficultyLabel(assessment.targetDifficultyMix.challenge)}
            </span>
          </div>

          <p className="range">
            The item bank for this section is still being authored. These
            values are the target form mix, not a score.
          </p>
        </div>
      ))}
    </div>
  );
}
