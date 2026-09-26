import { NextResponse } from "next/server";
import { submitAssessment } from "../../../../lib/server/assessment";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const attemptId = body.attemptId;
    const answers = body.answers;

    if (typeof attemptId !== "string" || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid assessment submission." }, { status: 400 });
    }

    if (JSON.stringify(answers).length > 200_000) {
      return NextResponse.json({ error: "Assessment submission is too large." }, { status: 413 });
    }

    return NextResponse.json(
      await submitAssessment(
        attemptId,
        answers as Array<{ itemId: string; value: number | string }>
      ),
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required.") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assessment could not be submitted." },
      { status: 400 }
    );
  }
}
