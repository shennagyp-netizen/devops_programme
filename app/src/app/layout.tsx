import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@mantine/core/styles.css";
import "../styles.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DevOps Programme",
  description: "Structured DevOps training with verified hands-on work."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
