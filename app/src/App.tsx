"use client";

import { AppShell, Badge, Burger, Group, Paper, ScrollArea, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { logoutAction } from "./app/actions/auth";
import { completeLearningItemAction } from "./app/actions/progress";
import { DiagnosticPanel } from "./components/DiagnosticPanel";
import { FloatingLLMAssistant } from "./components/FloatingLLMAssistant/FloatingLLMAssistant";
import { LessonPanel } from "./components/LessonPanel";
import { Progress } from "./components/Progress";
import { ProjectPanel } from "./components/ProjectPanel";
import type { DiagnosticRecommendation } from "./data/diagnostics";
import type { CompletionRecord } from "./lib/progress-contract";
import type { MasteryAttemptRecord } from "./lib/mastery-contract";
import { lessonsByCourse } from "./data/courseLessons";
import { courses, platformProfiles, type CourseLevel, type PlatformId } from "./data/programme";
import { projectsByCourse } from "./data/projects";
import type { TutorContext } from "./lib/tutor-contract";

export default function App({
  currentUser,
  initialCompletionHistory,
  initialMasteryHistory
}: {
  currentUser: { email: string };
  initialCompletionHistory: CompletionRecord[];
  initialMasteryHistory: MasteryAttemptRecord[];
}) {
  const [course, setCourse] = useState<CourseLevel>("intermediate");
  const [platform, setPlatform] = useState<PlatformId>("macos");
  const [s, setS] = useState("D1.1");
  const [diagnosticRecommendations, setDiagnosticRecommendations] =
    useState<Record<string, DiagnosticRecommendation>>({});
  const [evidenceVersion, setEvidenceVersion] = useState(0);
  const [m, setM] = useState<string[]>(() =>
    initialCompletionHistory
      .filter((item) => item.itemType === "lesson")
      .map((item) => item.itemId)
  );
  const [progressError, setProgressError] = useState("");
  const [progressBusyId, setProgressBusyId] = useState<string | null>(null);
  const [lessonMode, setLessonMode] = useState<"learn" | "do" | "recall" | "design" | "assessment">("learn");
  const [mobileNavOpened, { toggle: toggleMobileNav, close: closeMobileNav }] =
    useDisclosure(false);

  const selectedCourse = courses.find((item) => item.id === course) ?? courses[1];
  const selectedPlatform =
    platformProfiles.find((item) => item.id === platform) ?? platformProfiles[0];
  const selectedLessons = lessonsByCourse[course];

  const lesson = useMemo(
    () => selectedLessons.find((item) => item.id === s) ?? selectedLessons[0]!,
    [selectedLessons, s]
  );

  const completedInCourse = selectedLessons.filter((item) =>
    m.includes(item.id)
  ).length;

  const tutorContext: TutorContext = {
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    lessonObjective: lesson.objective,
    domain: lesson.domain,
    projectId: lesson.projectId,
    course: selectedCourse.id,
    learningMode: lessonMode
  };

  const recordDiagnosticRecommendation = useCallback(
    (sectionId: string, recommendation: DiagnosticRecommendation) => {
      setDiagnosticRecommendations((current) => ({
        ...current,
        [sectionId]: recommendation
      }));
    },
    []
  );

  function changeCourse(next: CourseLevel) {
    setCourse(next);
    const first = lessonsByCourse[next][0];

    if (first) {
      setS(first.id);
      setLessonMode("learn");
    }

    closeMobileNav();
  }

  function selectLesson(nextId: string) {
    setS(nextId);
    setLessonMode("learn");
    closeMobileNav();
  }

  async function completeLesson(id: string) {
    if (progressBusyId === id || m.includes(id)) return;

    setProgressBusyId(id);
    setProgressError("");

    try {
      const selected = selectedLessons.find((item) => item.id === id);
      if (!selected) throw new Error("Selected lesson no longer exists.");

      await completeLearningItemAction({
        itemType: "lesson",
        itemId: id,
        course: selected.course,
        projectId: selected.projectId,
        verificationLevel: "exercise-validated"
      });
      setM((current) => (current.includes(id) ? current : [...current, id]));
    } catch (error) {
      setProgressError(
        error instanceof Error
          ? "Progress was not saved: " + error.message
          : "Progress was not saved."
      );
    } finally {
      setProgressBusyId(null);
    }
  }

  return (
    <>
      <AppShell
        mode="static"
        layout="default"
        padding={{ base: "sm", sm: "md", lg: "lg" }}
        header={{ height: { base: 68, sm: 76 } }}
        navbar={{
          width: { sm: 300, lg: 360 },
          breakpoint: "sm",
          collapsed: { mobile: !mobileNavOpened, desktop: false }
        }}
        aside={{
          width: 320,
          breakpoint: "lg",
          collapsed: { mobile: true, desktop: false }
        }}
        withBorder={false}
      >
        <AppShell.Header>
          <Group h="100%" px={{ base: "sm", sm: "md", lg: "xl" }} justify="space-between">
            <Group gap="sm" wrap="nowrap">
              <Burger
                opened={mobileNavOpened}
                onClick={toggleMobileNav}
                hiddenFrom="sm"
                size="sm"
                aria-label="Open lesson navigation"
              />
              <div>
                <Text size="xs" fw={800} c="blue" tt="uppercase" style={{ letterSpacing: "0.12em" }}>
                  DevOps Programme
                </Text>
                <Title order={3} size="clamp(1.15rem, 2vw, 1.5rem)">
                  Operational mastery
                </Title>
              </div>
            </Group>

            <Group gap="sm" wrap="nowrap">
              <Link href="/" className="gateway-home-link">
                Programme home
              </Link>
              <Badge variant="light" visibleFrom="sm">
                {currentUser.email}
              </Badge>
              <form action={logoutAction}>
                <button className="secondary account-logout" type="submit">
                  Sign out
                </button>
              </form>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p={{ base: "sm", sm: "md" }}>
          <Stack h="100%" gap="md">
            <div>
              <Text fw={700}>{selectedCourse.title}</Text>
              <Text size="xs" c="dimmed">
                {selectedLessons.length} lessons · {selectedCourse.projects.length} projects
              </Text>
            </div>

            <ScrollArea.Autosize type="scroll" offsetScrollbars>
              <Stack gap="md" pr="xs">
                {selectedCourse.projects.map((projectId) => {
                  const projectLessons = selectedLessons.filter(
                    (item) => item.projectId === projectId
                  );

                  if (!projectLessons.length) return null;

                  return (
                    <Stack gap={4} key={projectId}>
                      <Text size="xs" fw={800} c="dimmed" tt="uppercase">
                        {projectId}
                      </Text>

                      {projectLessons.map((item) => (
                        <button
                          key={item.id}
                          className={
                            lesson.id === item.id
                              ? "lesson-link selected"
                              : "lesson-link"
                          }
                          onClick={() => selectLesson(item.id)}
                        >
                          <span>{item.id}</span>
                          <span>{item.title}</span>
                          {m.includes(item.id) ? <b aria-label="completed">✓</b> : null}
                        </button>
                      ))}
                    </Stack>
                  );
                })}
              </Stack>
            </ScrollArea.Autosize>
          </Stack>
        </AppShell.Navbar>

        <AppShell.Aside p="md">
          <Stack gap="md">
            <Paper withBorder p="md" radius="lg">
              <Text size="xs" fw={800} c="dimmed" tt="uppercase">
                Course progress
              </Text>
              <Progress total={selectedLessons.length} completed={completedInCourse} />
            </Paper>

            <Paper withBorder p="md" radius="lg">
              <Text size="xs" fw={800} c="dimmed" tt="uppercase">
                Environment
              </Text>
              <Text fw={700} mt={4}>{selectedPlatform.label}</Text>
              <Text size="sm" c="dimmed">{selectedPlatform.shell}</Text>
            </Paper>

            <Paper withBorder p="md" radius="lg">
              <Text size="xs" fw={800} c="dimmed" tt="uppercase">
                Current lesson
              </Text>
              <Text fw={700} mt={4}>{lesson.id} · {lesson.title}</Text>
              <Text size="sm" c="dimmed" mt={4}>
                {lesson.objective}
              </Text>
            </Paper>
          </Stack>
        </AppShell.Aside>

        <AppShell.Main>
          <Stack maw={1700} mx="auto" gap="lg">
            <Paper withBorder radius="xl" p={{ base: "md", sm: "lg", lg: "xl" }}>
              {progressError ? <Text c="red" size="sm" mb="sm">{progressError}</Text> : null}

              <Stack gap="md">
                <div>
                  <Text size="xs" fw={800} c="blue" tt="uppercase">{selectedCourse.id}</Text>
                  <Title order={2} mt={4}>{selectedCourse.title}</Title>
                  <Text c="dimmed">{selectedCourse.purpose}</Text>
                </div>

                <SegmentedControl
                  fullWidth
                  value={course}
                  onChange={(value) => changeCourse(value as CourseLevel)}
                  data={courses.map((item) => ({ value: item.id, label: item.title }))}
                />

                <SegmentedControl
                  fullWidth
                  value={platform}
                  onChange={(value) => setPlatform(value as PlatformId)}
                  data={platformProfiles.map((item) => ({ value: item.id, label: item.label }))}
                />

                <Text size="sm" c="dimmed">
                  Environment: {selectedPlatform.label} · {selectedPlatform.shell}
                </Text>

                <DiagnosticPanel
                  course={course}
                  onRecommendation={recordDiagnosticRecommendation}
                />

                <ProjectPanel
                  projects={projectsByCourse[course]}
                  refreshToken={evidenceVersion}
                />

                <Paper withBorder radius="lg" p="md">
                  <Group justify="space-between" align="flex-start" mb="sm">
                    <div>
                      <Title order={4}>Course path</Title>
                      <Text size="sm" c="dimmed">
                        Foundations and application sections stay separate, but they are used together inside the projects.
                      </Text>
                    </div>
                    <Badge variant="light">{selectedCourse.projects.join(" · ")}</Badge>
                  </Group>

                  <Stack gap="xs">
                    {selectedCourse.sections.map((section) => (
                      <div key={section.id}>
                        <Text size="sm" fw={700} component="span">{section.id}</Text>
                        <Text size="sm" component="span"> — {section.title}</Text>
                        <Text size="xs" c="dimmed" component="span"> · {section.kind}</Text>
                        <Text size="sm" c="dimmed">{section.humanExample}</Text>
                      </div>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            </Paper>

            <LessonPanel
              lesson={lesson}
              platform={platform}
              mastered={m.includes(lesson.id)}
              diagnosticRecommendation={diagnosticRecommendations[lesson.sectionId]}
              onSelectLesson={selectLesson}
              onEvidenceRecorded={() => setEvidenceVersion((value) => value + 1)}
              onModeChange={setLessonMode}
              progressReady={true}
              progressSaving={progressBusyId === lesson.id}
              initialMasteryHistory={initialMasteryHistory}
              onMaster={() => void completeLesson(lesson.id)}
            />
          </Stack>
        </AppShell.Main>
      </AppShell>

      <FloatingLLMAssistant context={tutorContext} />
    </>
  );
}
