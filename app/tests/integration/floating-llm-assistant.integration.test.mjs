/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { MantineProvider } from "@mantine/core";
import { FloatingLLMAssistant } from "../../src/components/FloatingLLMAssistant/FloatingLLMAssistant.tsx";

const context = {
  lessonId: "B1.4",
  lessonTitle: "Why Containers Exist",
  lessonObjective: "See the problem that containers solve.",
  domain: "beginner-application",
  projectId: "B1",
  course: "beginner"
};

function renderAssistant() {
  return render(
    <MantineProvider>
      <FloatingLLMAssistant context={context} />
    </MantineProvider>
  );
}

describe("FloatingLLMAssistant", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query.includes("47.99em") ? false : false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false
      })
    });

    Object.defineProperty(window, "speechSynthesis", {
      writable: true,
      value: {
        cancel: vi.fn(),
        speak: vi.fn()
      }
    });

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      writable: true,
      value: class {
        text: string;
        rate = 1;
        pitch = 1;

        constructor(text: string) {
          this.text = text;
        }
      }
    });
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("mounts the real assistant and opens the actual panel", () => {
    renderAssistant();

    fireEvent.click(
      screen.getByRole("button", { name: "Open DevOps tutor" })
    );

    expect(
      screen.getByRole("dialog", { name: "DevOps tutor" })
    ).toBeInTheDocument();
    expect(screen.getByText("B1.4")).toBeInTheDocument();
    expect(screen.getByText("Why Containers Exist")).toBeInTheDocument();
  });

  it("submits a real lesson-aware query and renders the returned response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            text: "A container isolates a process view while the host kernel remains shared."
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      )
    );

    renderAssistant();
    fireEvent.click(screen.getByRole("button", { name: "Open DevOps tutor" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "Question for DevOps tutor" }),
      { target: { value: "What does the container share with the host?" } }
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() =>
      expect(
        screen.getByText(/host kernel remains shared/i)
      ).toBeInTheDocument()
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    const init = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(init.body));

    expect(body.lessonId).toBe("B1.4");
    expect(body.messages.at(-1)).toEqual({
      role: "user",
      content: "What does the container share with the host?"
    });
    expect(body).not.toHaveProperty("lessonObjective");
    expect(body).not.toHaveProperty("domain");
  });

  it("keeps the question locally when the tutor is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network down")));

    renderAssistant();
    fireEvent.click(screen.getByRole("button", { name: "Open DevOps tutor" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "Question for DevOps tutor" }),
      { target: { value: "Why is the service unreachable?" } }
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() =>
      expect(
        screen.getByText(/kept locally for retry/i)
      ).toBeInTheDocument()
    );

    const pending = JSON.parse(
      window.localStorage.getItem("devops-programme:tutor-pending:v2") ?? "[]"
    );

    expect(pending).toHaveLength(1);
    expect(pending[0]).not.toHaveProperty("response");
  });
});
