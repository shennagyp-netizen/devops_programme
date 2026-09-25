"use client";

import type { CSSProperties } from "react";
import type { AnimationDefinitionV1, AnimationPrimitiveV1 } from "./contracts";
import { resolveAnimationCustomization } from "./contracts";
import { animationTimelineAt, type AnimationTimedCueV1 } from "./runtime";

type AnimationStageProps = {
  definition: AnimationDefinitionV1;
  cues: AnimationTimedCueV1[];
  currentTimeMs: number;
  prefersReducedMotion?: boolean;
  className?: string;
};

function centerOf(primitive: Extract<AnimationPrimitiveV1, { kind: "node" }>) {
  return {
    x: primitive.x + primitive.width / 2,
    y: primitive.y + primitive.height / 2
  };
}

function nodeById(definition: AnimationDefinitionV1, id: string) {
  return definition.primitives.find(
    (primitive): primitive is Extract<AnimationPrimitiveV1, { kind: "node" }> =>
      primitive.kind === "node" && primitive.id === id
  );
}

function statusOf(
  snapshot: ReturnType<typeof animationTimelineAt>,
  id: string
) {
  return snapshot.targets[id]?.status ?? "neutral";
}

export function AnimationStage({
  definition,
  cues,
  currentTimeMs,
  prefersReducedMotion = false,
  className = ""
}: AnimationStageProps) {
  const snapshot = animationTimelineAt(definition, cues, currentTimeMs);
  const customization = resolveAnimationCustomization(definition.visual.customization);

  const style = {
    "--animation-accent": customization.accent,
    "--animation-density": customization.density,
    "--animation-emphasis": customization.emphasis
  } as CSSProperties;

  return (
    <div
      className={[
        "animation-stage-shell",
        `animation-density-${customization.density}`,
        `animation-emphasis-${customization.emphasis}`,
        `animation-accent-${customization.accent}`,
        className
      ].filter(Boolean).join(" ")}
      style={style}
    >
      <svg
        className="animation-stage"
        viewBox="0 0 1200 675"
        role="img"
        aria-label={definition.accessibility.title}
        preserveAspectRatio="xMidYMid meet"
      >
        <desc>{definition.accessibility.description}</desc>

        <g className="animation-connections">
          {definition.primitives
            .filter(
              (primitive): primitive is Extract<AnimationPrimitiveV1, { kind: "connection" }> =>
                primitive.kind === "connection"
            )
            .map((connection) => {
              const from = nodeById(definition, connection.from);
              const to = nodeById(definition, connection.to);
              if (!from || !to) return null;

              const start = centerOf(from);
              const end = centerOf(to);

              return (
                <line
                  key={connection.id}
                  className="animation-connection"
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  aria-hidden="true"
                />
              );
            })}
        </g>

        <g className="animation-nodes">
          {definition.primitives
            .filter(
              (primitive): primitive is Extract<AnimationPrimitiveV1, { kind: "node" }> =>
                primitive.kind === "node"
            )
            .map((node) => {
              const status = statusOf(snapshot, node.id);

              return (
                <g
                  key={node.id}
                  className={[
                    "animation-node",
                    `animation-status-${status}`,
                    `animation-node-${node.variant ?? customization.nodeVariant}`
                  ].join(" ")}
                >
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={(node.variant ?? customization.nodeVariant) === "technical" ? 10 : 20}
                  />
                  <text
                    className="animation-node-label"
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
        </g>

        <g className="animation-labels">
          {definition.primitives
            .filter(
              (primitive): primitive is Extract<AnimationPrimitiveV1, { kind: "label" }> =>
                primitive.kind === "label"
            )
            .map((label) => (
              <text
                key={label.id}
                className="animation-label"
                x={label.x}
                y={label.y + label.height / 2}
                dominantBaseline="middle"
              >
                {label.text}
              </text>
            ))}
        </g>

        <g className="animation-packets">
          {definition.primitives
            .filter(
              (primitive): primitive is Extract<AnimationPrimitiveV1, { kind: "packet" }> =>
                primitive.kind === "packet"
            )
            .map((packet) => {
              const snapshotPacket = snapshot.packets[packet.id];
              const from = nodeById(definition, packet.from);
              const to = nodeById(definition, packet.to);
              if (!from || !to || !snapshotPacket) return null;

              const start = centerOf(from);
              const end = centerOf(to);
              const progress = prefersReducedMotion
                ? snapshotPacket.phase === "idle" ? 0 : 1
                : snapshotPacket.progress;

              const x = start.x + (end.x - start.x) * progress;
              const y = start.y + (end.y - start.y) * progress;

              return (
                <g
                  key={packet.id}
                  className={[
                    "animation-packet",
                    `animation-packet-${snapshotPacket.phase}`
                  ].join(" ")}
                  transform={"translate(" + x + " " + y + ")"}
                  aria-hidden="true"
                >
                  <circle r="13" />
                  {packet.label ? (
                    <text
                      className="animation-packet-label"
                      x="0"
                      y="-22"
                      textAnchor="middle"
                    >
                      {packet.label}
                    </text>
                  ) : null}
                </g>
              );
            })}
        </g>
      </svg>
    </div>
  );
}
