import { useEffect, useMemo, useState } from "react";
import {
  diagnosticDefinitions,
  recommendationForScore,
  type DiagnosticRecommendation
} from "../data/diagnostics";
import type { CourseLevel } from "../data/programme";
import { addEvidence } from "../data/evidence";
import { lessonsByCourse } from "../data/courseLessons";

const STORAGE_KEY = "devops-programme-diagnostic-results";

type StoredResult = {
  score: number;
  total: number;
  recommendation: DiagnosticRecommendation;
};

type ResultMap = Record<string, StoredResult>;

function loadResults(): ResultMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as ResultMap;
  } catch {
    return {};
  }
}

function saveResults(results: ResultMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

const recommendationText: Record<DiagnosticRecommendation, string> = {
  "skip-theory":
    "Your diagnostic shows strong prior knowledge. Keep the theory brief, but still do the lesson exercise.",
  "condense-theory":
    "You have the main idea. Use the lesson theory as a quick review, then do the exercise.",
  remediate:
    "Use the remediation lesson first. The exercise is still required after remediation."
};

export function DiagnosticPanel({
  course,
  sectionId,
  onRecommendation
}: {
  course: CourseLevel;
  sectionId?: string;
  onRecommendation: (sectionId: string, recommendation: DiagnosticRecommendation) => void;
}) {
  const definitions = diagnosticDefinitions.filter((item) =>
    item.course === course && (!sectionId || item.sectionId === sectionId)
  );
  const [activeSection, setActiveSection] = useState(sectionId ?? definitions[0]?.sectionId ?? "");
  const [results, setResults] = useState<ResultMap>(() => loadResults());
  const definition = useMemo(
    () => definitions.find((item) => item.sectionId === activeSection) ?? definitions[0],
    [definitions, activeSection]
  );
  const [answers, setAnswers] = useState<number[]>(() =>
    definition ? definition.questions.map(() => -1) : []
  );

  useEffect(() => {
    for (const [storedSectionId, storedResult] of Object.entries(results)) {
      onRecommendation(storedSectionId, storedResult.recommendation);
    }
  }, [onRecommendation, results]);

  if (!definition) {
    return (
      <div className="content-card">
        <span className="eyebrow">ADAPTATION</span>
        <h3>Prerequisite diagnostic</h3>
        <p>
          A diagnostic is not authored for this section yet. Theory remains available,
          and the exercises remain mandatory.
        </p>
      </div>
    );
  }

  const result = results[definition.sectionId];
  const complete = answers.every((answer) => answer >= 0);

  function chooseSection(next: string) {
    setActiveSection(next);
    const nextDefinition = definitions.find((item) => item.sectionId === next);
    setAnswers(nextDefinition ? nextDefinition.questions.map(() => -1) : []);
  }

  function submit() {
    const score = answers.reduce(
      (sum, answer, index) =>
        sum + (answer === definition.questions[index].correctOption ? 1 : 0),
      0
    );
    const recommendation = recommendationForScore(score, definition.questions.length);
    const nextResults = {
      ...results,
      [definition.sectionId]: {
        score,
        total: definition.questions.length,
        recommendation
      }
    };
    setResults(nextResults);
    saveResults(nextResults);

    const projectId =
      lessonsByCourse[definition.course].find(
        (lesson) => lesson.sectionId === definition.sectionId
      )?.projectId;

    if (projectId) {
      addEvidence({
        course: definition.course,
        projectId,
        kind: "diagnostic",
        summary: `${definition.sectionId}: ${score}/${definition.questions.length} · ${recommendation}`
      });
    }

    onRecommendation(definition.sectionId, recommendation);
  }

  return (
    <div className="content-card">
      <div className="course-path-head">
        <div>
          <span className="eyebrow">ADAPTATION · PREREQUISITE CHECK</span>
          <h3>Can we compress the theory?</h3>
          <p>
            This diagnostic changes how much introductory theory you need. It never
            removes the hands-on exercise.
          </p>
        </div>
        <select value={definition.sectionId} onChange={(event) => chooseSection(event.target.value)}>
          {definitions.map((item) => (
            <option key={item.sectionId} value={item.sectionId}>
              {item.sectionId} · {item.title}
            </option>
          ))}
        </select>
      </div>

      {definition.questions.map((question, index) => (
        <div className="content-card" key={question.id}>
          <strong>{index + 1}. {question.prompt}</strong>
          <div className="difficulty-grid">
            {question.options.map((option, optionIndex) => (
              <button
                key={option}
                className={answers[index] === optionIndex ? "active" : ""}
                onClick={() =>
                  setAnswers((current) =>
                    current.map((value, i) => (i === index ? optionIndex : value))
                  )
                }
              >
                {String.fromCharCode(65 + optionIndex)}. {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button className="primary" onClick={submit} disabled={!complete}>
        Save diagnostic result
      </button>

      {result ? (
        <div className="content-card coach-rule">
          <strong>
            {result.score}/{result.total} · {result.recommendation}
          </strong>
          <p>{recommendationText[result.recommendation]}</p>
          {result.recommendation === "remediate" ? (
            <p>
              Remediation target: {definition.remediationLessonIds.join(" · ")}
            </p>
          ) : (
            <p>
              The associated lesson exercise is still mandatory. Theory compression does not remove hands-on work.
            </p>
          )}
        </div>
      ) : null}

      {definition.prerequisiteLessonIds.length ? (
        <p className="range">
          This section builds on: {definition.prerequisiteLessonIds.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}
