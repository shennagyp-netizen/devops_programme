import { useMemo, useState } from "react";
import { AppShell, Badge, Button, Card, Group, Progress, Stack, Tabs, Text, Title } from "@mantine/core";
import type { LearningMode, LearningProgramme } from "../core/contracts";
import { createLearningRuntime } from "../runtime";

const labels: Record<LearningMode, string> = {
  learn: "Learn",
  do: "Do",
  recall: "Recall",
  design: "Design",
  assessment: "Assessment"
};

export function LearningFrameworkApp({ programme }: { programme: LearningProgramme }) {
  const firstCourse = programme.courses[0];
  const firstSection = programme.sections.find((s) => s.id === firstCourse?.sectionIds[0]);
  const runtime = useMemo(
    () => createLearningRuntime(
      programme,
      { completedItemIds: [], evidence: [], assessmentPasses: [] },
      {
        courseId: firstCourse?.id ?? "",
        sectionId: firstSection?.id ?? "",
        itemId: firstSection?.itemIds[0] ?? programme.items[0]?.id ?? "",
        mode: "learn",
        remediationOpen: false
      }
    ),
    [programme]
  );
  const [, refresh] = useState(0);
  const view = runtime.getView();
  const run = (action: () => void) => { action(); refresh((v) => v + 1); };

  return (
    <AppShell header={{ height: 68 }} padding="lg">
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between">
          <div>
            <Text size="xs" fw={800} c="dimmed">LEARNING FRAMEWORK</Text>
            <Text fw={800}>{programme.title}</Text>
          </div>
          <Badge variant="light">{programme.version}</Badge>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Stack maw={1050} mx="auto" gap="lg">
          <div>
            <Badge variant="light">{view.currentItem.kind}</Badge>
            <Title order={1} mt="xs">{view.currentItem.title}</Title>
            <Text c="dimmed">{view.currentItem.description}</Text>
          </div>

          <Group align="stretch">
            <Card withBorder radius="lg" style={{ flex: 1 }}>
              <Text size="xs" fw={800} c="dimmed">PROGRESS</Text>
              <Text fw={900} size="xl">{view.progress.percentage}%</Text>
              <Progress value={view.progress.percentage} mt="xs" />
              <Text size="xs" c="dimmed" mt="xs">
                {view.progress.completed} / {view.progress.total} items
              </Text>
            </Card>
            <Card withBorder radius="lg" style={{ flex: 2 }}>
              <Text fw={800}>Current item</Text>
              <Text size="sm" c="dimmed" mt="xs">
                A programme supplies curriculum meaning; the framework supplies
                state, progression, authority, controls, and reusable UI.
              </Text>
            </Card>
          </Group>

          <Tabs
            value={view.session.mode}
            onChange={(value) => value && run(() => runtime.dispatch({
              type: "SELECT_MODE",
              mode: value as LearningMode
            }))}
          >
            <Tabs.List>
              {view.currentItem.modes.map((mode) => (
                <Tabs.Tab key={mode} value={mode}>{labels[mode]}</Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          <Card withBorder radius="xl" p="xl">
            <Stack gap="md">
              <Text fw={800}>{labels[view.session.mode]}</Text>
              <Text c="dimmed">
                This is the complete framework learning surface. Provider
                implementations are injected through interfaces; no domain
                technology is required by this app.
              </Text>
              <Group>
                {view.controls
                  .filter((control) => control.id !== "remediation")
                  .map((control) => {
                    const disabled = control.state.status !== "enabled";
                    return (
                      <Button
                        key={control.id}
                        disabled={disabled}
                        variant={control.id === "complete" ? "filled" : "light"}
                        onClick={() => run(() => runtime.dispatch(control.intent))}
                      >
                        {control.label}
                        {control.state.status === "locked" ? " · " + control.state.reason : ""}
                      </Button>
                    );
                  })}
              </Group>
            </Stack>
          </Card>

          {view.session.remediationOpen ? (
            <Card withBorder radius="lg">
              <Text fw={800}>Remediation</Text>
              <Text size="sm" c="dimmed" mt="xs">
                Framework-owned state; programme-owned instructional content.
              </Text>
            </Card>
          ) : null}
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
