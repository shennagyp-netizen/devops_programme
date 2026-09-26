import { NextResponse } from "next/server";
import { startAssessment } from "../../../../lib/server/assessment";
import type { AssessmentFamily, CourseLevel } from "../../../../data/assessment";

const families = new Set<AssessmentFamily>(["conceptual", "diagnostic", "hands-on"]);
const courses = new Set<CourseLevel>(["beginner", "intermediate", "advanced"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const courseId = body.courseId;
    const sectionId = body.sectionId;
    const family = body.family;

    if (
      typeof courseId !== "string" ||
      !courses.has(courseId as CourseLevel) ||
      typeof sectionId !== "string" ||
      sectionId.length > 64 ||
      typeof family !== "string" ||
      !families.has(family as AssessmentFamily)
    ) {
      return NextResponse.json({ error: "Invalid assessment selection." }, { status: 400 });
    }

    return NextResponse.json(
      await startAssessment(courseId as CourseLevel, sectionId, family as AssessmentFamily),
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required.") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assessment could not start." },
      { status: 400 }
    );
  }
}
