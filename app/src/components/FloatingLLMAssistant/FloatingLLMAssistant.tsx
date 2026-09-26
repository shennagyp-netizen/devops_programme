"use client";

import { Drawer } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { AssistantPanel } from "./AssistantPanel";
import { AssistantTrigger } from "./AssistantTrigger";
import type { FloatingLLMAssistantProps } from "./types";

export function FloatingLLMAssistant({ context }: FloatingLLMAssistantProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const mobile = useMediaQuery("(max-width: 47.99em)", false);

  return (
    <>
      <AssistantTrigger opened={opened} mobile={mobile} onClick={opened ? close : open} />
      <Drawer
        opened={opened}
        onClose={close}
        position={mobile ? "bottom" : "right"}
        size={mobile ? "92%" : 440}
        title="DevOps tutor"
        overlayProps={{ backgroundOpacity: 0.45, blur: 2 }}
      >
        <AssistantPanel context={context} onClose={close} mobile={mobile} />
      </Drawer>
    </>
  );
}
