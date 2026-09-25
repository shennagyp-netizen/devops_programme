import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimationPlayground } from "../../../components/AnimationPlayground";
import { animationLibrary, getAnimation } from "../../../animations";
import { getAnimationPreviewCues } from "../../../animations/previewCues";

type AnimationPageProps = {
  params: Promise<{ animationId: string }>;
};

export async function generateStaticParams() {
  return animationLibrary.map((animation) => ({ animationId: animation.id }));
}

export async function generateMetadata({ params }: AnimationPageProps): Promise<Metadata> {
  const { animationId } = await params;
  const animation = getAnimation(animationId);

  if (!animation) {
    return {
      title: "Animation not found | DevOps Programme"
    };
  }

  return {
    title: animation.title + " | DevOps Programme",
    description: animation.accessibility.description
  };
}

export default async function AnimationPage({ params }: AnimationPageProps) {
  const { animationId } = await params;
  const animationDefinition = getAnimation(animationId);

  if (!animationDefinition) {
    notFound();
  }

  const cues = getAnimationPreviewCues(animationId);

  return (
    <main className="app-shell">
      <div className="animation-route-toolbar">
        <a className="secondary" href="/animations">
          All animations
        </a>
      </div>
      <AnimationPlayground definition={animationDefinition} cues={cues} />
    </main>
  );
}
