import "@testing-library/jest-dom";
import React from "react";
/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { LessonVoiceClockProvider } from "../../src/components/LessonVoiceClock.tsx";
import { PodcastCoach } from "../../src/components/PodcastCoach.tsx";

const lesson = { id: "B1.4", podcast: "podcasts/beginner/B1.4.txt" };

const manifest = {
  schemaVersion: 2,
  source: "test",
  episodes: { "B1.4": "base-v1" },
  explanationLevels: {
    "B1.4": { "1": "v1", "2": "v1", "3": "v1", "4": "v1" }
  }
};

const script = "EPISODE B1.4 — Test\n" +
  "@knowledge K01\nSpeaker A: A container gives a process an isolated view.\n" +
  "@knowledge K02\nSpeaker B: The host kernel is still shared.\n";

function renderCoach() {
  return render(
    React.createElement(
      LessonVoiceClockProvider,
      null,
      React.createElement(PodcastCoach, { lesson })
    )
  );
}

describe("PodcastCoach real component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    const synthesis = {
      speaking: false,
      paused: false,
      cancel: vi.fn(function() {
        this.speaking = false;
        this.paused = false;
      }),
      speak: vi.fn(function(utterance) {
        this.speaking = true;
        utterance.onstart?.({});
      }),
      pause: vi.fn(),
      resume: vi.fn()
    };

    Object.defineProperty(window, "speechSynthesis", { configurable: true, writable: true, value: synthesis });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      writable: true,
      value: class {
        text;
        rate = 1;
        pitch = 1;
        onstart = null;
        onend = null;
        onerror = null;
        constructor(text) { this.text = text; }
      }
    });

    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });

    vi.stubGlobal("fetch", vi.fn(async (input) => {
      const url = String(input);
      if (url.endsWith("/podcasts/manifest.json")) {
        return new Response(JSON.stringify(manifest), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response(script, { status: 200, headers: { "Content-Type": "text/plain" } });
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the four authored explanation levels and canonical speeds", async () => {
    renderCoach();
    await waitFor(() => expect(screen.getByText("A container gives a process an isolated view.")).toBeInTheDocument());

    expect(screen.getByRole("button", { name: /Explanation 1/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Explanation 4/i })).toBeInTheDocument();

    const options = screen.getByRole("combobox", { name: "TTS speech speed" }).querySelectorAll("option");
    expect([...options].map((option) => option.textContent)).toEqual(["1×", "1.25×", "1.5×", "2×"]);
    expect(screen.queryByText("1.75×")).not.toBeInTheDocument();
  });

  it("uses the selected speech rate on the real TTS utterance and restarts the current turn", async () => {
    renderCoach();
    await waitFor(() => expect(screen.getByText("A container gives a process an isolated view.")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Start TTS" }));

    const synthesis = window.speechSynthesis;
    const firstUtterance = synthesis.speak.mock.calls[0][0];
    expect(firstUtterance.rate).toBe(1);

    fireEvent.change(screen.getByRole("combobox", { name: "TTS speech speed" }), { target: { value: "2" } });

    await waitFor(() => expect(synthesis.cancel).toHaveBeenCalled());
    const restartedUtterance = synthesis.speak.mock.calls.at(-1)?.[0];
    expect(restartedUtterance.rate).toBe(2);
    expect(synthesis.speak).toHaveBeenCalledTimes(2);
  });
});
