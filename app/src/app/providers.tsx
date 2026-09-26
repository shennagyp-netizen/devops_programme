"use client";

import { createTheme, MantineProvider } from "@mantine/core";
import type { ReactNode } from "react";

const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  breakpoints: {
    sm: "48em",
    md: "64em",
    lg: "75em",
    xl: "90em"
  }
});

export function Providers({ children }: { children: ReactNode }) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
