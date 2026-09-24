import type { ProjectDefinition } from "../data/projects";
import { listEvidence } from "../data/evidence";

export function ProjectPanel({
  projects,
  refreshToken
}: {
  projects: ProjectDefinition[];
  refreshToken: number;
}) {
  void refreshToken;
  return (
    <div className="content-card">
      <div className="course-path-head">
        <div>
          <span className="eyebrow">CONTINUOUS PROJECT SPINE</span>
          <h3>Projects are the operating context</h3>
          <p>
            Each project carries the learner forward. Lessons add capability;
            failures and evidence stay attached to the project instead of being
            forgotten when the lesson ends.
          </p>
        </div>
      </div>

      {projects.map((project) => {
        const evidence = listEvidence(project.id);
        return (
        <article className="content-card" key={project.id}>
          <div className="course-path-head">
            <div>
              <span className="eyebrow">{project.id}</span>
              <h4>{project.title}</h4>
              <p>{project.objective}</p>
            </div>
            <span className="coach-phase">PROJECT DEFINED</span>
          </div>

          <p className="range">
            <strong>Environment:</strong> {project.environment}
          </p>

          <div className="difficulty-grid">
            <span>
              <strong>Milestones</strong>
            </span>
            <span>
              <strong>Failure scenarios</strong>
            </span>
            <span>
              <strong>Evidence</strong>
            </span>
            <span>
              <strong>Completion</strong>
            </span>
          </div>

          <div className="course-path-columns">
            <div>
              <ol>
                {project.milestones.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
            <div>
              <ul>
                {project.failureScenarios.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <ul>
                {project.evidenceRequirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <ul>
                {project.completionCriteria.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="range">
            Competency gates: {project.competencyGates.join(" · ")}
          </p>
          <p className="range">
            <strong>Evidence ledger:</strong> {evidence.length} recorded item
            {evidence.length === 1 ? "" : "s"}
            {evidence.length
              ? " · " + evidence.map((item) => item.kind).join(" · ")
              : " · no evidence recorded yet"}
          </p>
        </article>
        );
      })}
    </div>
  );
}
