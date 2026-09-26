import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const currentUserMock = vi.fn();
const appendTutorMessageMock = vi.fn();
const buildTutorContextMock = vi.fn();
const createTutorSessionMock = vi.fn();
const listTutorMessagesMock = vi.fn();
const verifyTutorSessionMock = vi.fn();

vi.mock("../../src/lib/server/auth.ts", () => ({
  getCurrentUser: currentUserMock
}));

const assertTutorRateLimitMock = vi.fn();

vi.mock("../../src/lib/server/tutor.ts", () => ({
  appendTutorMessage: appendTutorMessageMock,
  assertTutorRateLimit: assertTutorRateLimitMock,
  buildTutorContext: buildTutorContextMock,
  createTutorSessionForUser: createTutorSessionMock,
  listTutorMessagesForUser: listTutorMessagesMock,
  verifyTutorSessionForUser: verifyTutorSessionMock
}));

const { GET, POST } = await import("../../src/app/api/tutor/route.ts");

const contextFixture = {
  lesson: {
    id: "B1.4",
    title: "Why Containers Exist",
    objective: "Explain the container boundary.",
    course: "beginner",
    projectId: "B1",
    sectionId: "B-F2",
    humanExample: "A service boundary can be isolated and repeated."
  },
  project: {
    id: "B1",
    title: "Containerized Application",
    objective: "Operate a repeatable local service.",
    environment: "Local container runtime",
    estimatedHours: 18,
    phases: [],
    failureScenarios: ["wrong port"],
    competencyGates: ["B-F2.core"],
    evidenceRequirements: ["request evidence"],
    completionCriteria: ["recovery is verified"],
    reviewGates: ["baseline approved"]
  },
  learner: {
    completionCount: 2,
    recentCompletedItems: ["lesson:B1.1"],
    masteryAttemptsForLesson: []
  }
};

function request(body) {
  return new Request("http://localhost/api/tutor", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

describe("tutor route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    currentUserMock.mockReset();
    appendTutorMessageMock.mockReset();
    assertTutorRateLimitMock.mockReset();
    buildTutorContextMock.mockReset();
    createTutorSessionMock.mockReset();
    listTutorMessagesMock.mockReset();
    verifyTutorSessionMock.mockReset();

    buildTutorContextMock.mockResolvedValue(contextFixture);
    createTutorSessionMock.mockResolvedValue("00000000-0000-0000-0000-000000000001");
    listTutorMessagesMock.mockResolvedValue([]);
    appendTutorMessageMock.mockResolvedValue("message-id");
    assertTutorRateLimitMock.mockResolvedValue({ allowed: true, remaining: 20 });
    verifyTutorSessionMock.mockResolvedValue({
      id: "00000000-0000-0000-0000-000000000001"
    });
  });

  afterEach(() => {
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.TUTOR_MODEL;
  });

  it("fails closed for unauthenticated learners", async () => {
    currentUserMock.mockResolvedValue(null);

    const response = await POST(
      request({
        lessonId: "B1.4",
        mode: "teaching",
        message: "Explain the boundary."
      })
    );

    expect(response.status).toBe(401);
    expect(createTutorSessionMock).not.toHaveBeenCalled();
  });

  it("fails closed when the learner exceeds the tutor request rate limit", async () => {
    currentUserMock.mockResolvedValue({
      id: "user-1",
      email: "learner@example.com"
    });
    assertTutorRateLimitMock.mockRejectedValue(
      new Error("Tutor rate limit reached. Please continue shortly.")
    );

    const response = await POST(
      request({
        lessonId: "B1.4",
        mode: "teaching",
        message: "Again."
      })
    );

    expect(response.status).toBe(429);
    expect(buildTutorContextMock).not.toHaveBeenCalled();
    expect(createTutorSessionMock).not.toHaveBeenCalled();
  });

  it("does not call a provider when the server key is missing", async () => {
    currentUserMock.mockResolvedValue({
      id: "user-1",
      email: "learner@example.com"
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const response = await POST(
      request({
        lessonId: "B1.4",
        mode: "teaching",
        message: "Explain the boundary."
      })
    );

    expect(response.status).toBe(503);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(createTutorSessionMock).not.toHaveBeenCalled();
  });

  it("stores the conversation but returns a non-authoritative tutor result", async () => {
    currentUserMock.mockResolvedValue({
      id: "user-1",
      email: "learner@example.com"
    });
    process.env.AI_GATEWAY_API_KEY = "test-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            message: "Check which port the process listens on.",
            mode: "failure-investigation",
            pedagogicalIntent: "question",
            nextQuestion: "What does the process listen on?",
            requestedEvidence: ["listener evidence"],
            suggestedAction: "Inspect the listening socket."
          })
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    const response = await POST(
      request({
        lessonId: "B1.4",
        mode: "failure-investigation",
        message: "The container is running but the browser cannot reach it."
      })
    );

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.response.authoritativeDecision).toBe("not-authoritative");
    expect(body.response.canUnlockRetry).toBe(false);
    expect(body.response.canCertify).toBe(false);
    expect(body.response.nextQuestion).toContain("What does");
    expect(appendTutorMessageMock).toHaveBeenCalledTimes(2);
  });

  it("executes only published read-only tools and then asks the model for the final answer", async () => {
    currentUserMock.mockResolvedValue({
      id: "user-1",
      email: "learner@example.com"
    });
    process.env.AI_GATEWAY_API_KEY = "test-key";

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            output: [
              {
                type: "function_call",
                name: "get_hands_on_contract",
                arguments: JSON.stringify({ lessonId: "B1.4" }),
                call_id: "call_001"
              }
            ]
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            output_text: JSON.stringify({
              message: "Use the published task contract to plan the next observation.",
              mode: "assignment-coach",
              pedagogicalIntent: "question",
              requestedEvidence: ["observation evidence"]
            }),
            output: []
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      );

    const response = await POST(
      request({
        lessonId: "B1.4",
        mode: "assignment-coach",
        platform: "macos",
        message: "What exactly is this assignment asking me to prove?"
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const secondBody = JSON.parse(String(fetchSpy.mock.calls[1]?.[1]?.body));
    expect(
      secondBody.input.some((item) => item.type === "function_call_output")
    ).toBe(true);
    expect(body.toolCallsUsed).toBe(1);
    expect(body.response.canCertify).toBe(false);
  });


  it("restores the authenticated session transcript on GET", async () => {
    currentUserMock.mockResolvedValue({
      id: "user-1",
      email: "learner@example.com"
    });

    listTutorMessagesMock.mockResolvedValue([
      {
        role: "user",
        content: "Why is the service unreachable?",
        createdAt: "2026-09-26T01:00:00.000Z"
      },
      {
        role: "assistant",
        content: JSON.stringify({
          message: "Separate process health from network reachability.",
          mode: "failure-investigation",
          pedagogicalIntent: "reframe",
          requestedEvidence: ["listener evidence"]
        }),
        createdAt: "2026-09-26T01:00:01.000Z"
      }
    ]);

    const response = await GET(
      new Request(
        "http://localhost/api/tutor?sessionId=00000000-0000-0000-0000-000000000001&lessonId=B1.4"
      )
    );

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe("learner");
    expect(body.messages[1].role).toBe("tutor");
    expect(body.messages[1].response.canCertify).toBe(false);
  });
  it("does not allow a session from another lesson to be reused", async () => {
    currentUserMock.mockResolvedValue({
      id: "user-1",
      email: "learner@example.com"
    });
    process.env.AI_GATEWAY_API_KEY = "test-key";
    verifyTutorSessionMock.mockResolvedValue(null);

    const response = await POST(
      request({
        sessionId: "00000000-0000-0000-0000-000000000001",
        lessonId: "B1.4",
        mode: "teaching",
        message: "Continue."
      })
    );

    expect(response.status).toBe(404);
  });
});
