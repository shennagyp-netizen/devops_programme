"use client";

import { ActionIcon, Affix, Badge, Tooltip } from "@mantine/core";

export function AssistantTrigger({ opened, mobile, onClick }: {
  opened: boolean;
  mobile: boolean;
  onClick: () => void;
}) {
  return (
    <Affix position={mobile ? { bottom: 16, right: 16 } : { top: "50%", right: 16 }} zIndex={120}>
      <Tooltip label={opened ? "Close tutor" : "Open DevOps tutor"}>
        <ActionIcon
          size={mobile ? 52 : 56}
          radius="xl"
          variant="filled"
          color="blue"
          aria-label={opened ? "Close DevOps tutor" : "Open DevOps tutor"}
          aria-expanded={opened}
          onClick={onClick}
        >
          {opened ? "×" : "AI"}
          {!opened ? <Badge size="xs" circle color="cyan" pos="absolute" top={2} right={2} aria-hidden="true" /> : null}
        </ActionIcon>
      </Tooltip>
    </Affix>
  );
}
