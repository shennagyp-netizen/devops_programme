import { describe, expect, it } from "vitest";
import {
  getEpisodeText,
  parseTurns,
  podcastUrl
} from "../../src/data/podcastsRaw.ts";

describe("podcast raw-script parsing contract", () => {
  it("normalizes root-relative and bare podcast paths", () => {
    expect(podcastUrl("/podcasts/B1.1.txt")).toBe("/podcasts/B1.1.txt");
    expect(podcastUrl("podcasts/B1.1.txt")).toBe("/podcasts/B1.1.txt");
  });

  it("extracts exactly the requested episode and stops before the next episode", () => {
    const source =
      "EPISODE B1.1 — First\n" +
      "Speaker A: first episode\n" +
      "EPISODE B1.2 — Second\n" +
      "Speaker B: second episode";

    expect(getEpisodeText(source, "B1.1")).toBe(
      "Speaker A: first episode"
    );
    expect(getEpisodeText(source, "B1.2")).toBe(
      "Speaker B: second episode"
    );
  });

  it("fails closed when the requested episode marker is absent", () => {
    expect(
      getEpisodeText("EPISODE B1.1 — First\nSpeaker A: hello", "B1.9")
    ).toBe("");
  });

  it("parses speaker turns with stable deterministic ids", () => {
    const turns = parseTurns(
      "Speaker A: Explain the request.\n" +
      "Speaker B: Predict what happens.\n" +
      "Speaker A: Then run the command.",
      "B1.2"
    );

    expect(turns).toEqual([
      {
        id: "B1.2.T001",
        speaker: "A",
        text: "Explain the request.",
        kind: "dialogue"
      },
      {
        id: "B1.2.T002",
        speaker: "B",
        text: "Predict what happens.",
        kind: "prediction"
      },
      {
        id: "B1.2.T003",
        speaker: "A",
        text: "Then run the command.",
        kind: "lab"
      }
    ]);
  });

  it("does not turn incidental mentions of prediction into learner pauses", () => {
    const turns = parseTurns(
      "Speaker A: Now we have a concrete prediction.\n" +
      "Speaker B: Make a prediction before you run it. What do you expect?",
      "B1.4"
    );

    expect(turns.map((turn) => turn.kind)).toEqual([
      "dialogue",
      "prediction"
    ]);
  });

  it("classifies recall turns as retrieval moments", () => {
    const turns = parseTurns(
      "Speaker A: Now use retrieval without notes.\n" +
      "Speaker B: Question one: what failed?",
      "B1.3"
    );

    expect(turns.map((turn) => turn.kind)).toEqual(["recall", "recall"]);
  });

  it("keeps malformed unlabelled text usable without losing determinism", () => {
    const turns = parseTurns(
      "A paragraph without a speaker label.\n" +
      "Speaker B: A labelled turn.",
      "B1.4"
    );

    expect(turns[0]).toMatchObject({
      id: "B1.4.T001",
      speaker: "A",
      text: "A paragraph without a speaker label."
    });
    expect(turns[1]).toMatchObject({
      id: "B1.4.T002",
      speaker: "B",
      text: "A labelled turn."
    });
  });

  it("does not merge adjacent turns when whitespace varies", () => {
    const turns = parseTurns(
      "Speaker A: first.\n\n   Speaker B: second.\nSpeaker A: third.",
      "B1.5"
    );

    expect(turns).toHaveLength(3);
    expect(turns.map((turn) => turn.text)).toEqual([
      "first.",
      "second.",
      "third."
    ]);
  });
});
