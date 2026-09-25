type Node = {
  id: string;
  label: string;
  x: number;
  y: number;
};

const nodes: Node[] = [
  { id: "01", label: "Understand", x: 112, y: 86 },
  { id: "02", label: "Predict", x: 320, y: 54 },
  { id: "03", label: "Operate", x: 530, y: 86 },
  { id: "04", label: "Break", x: 592, y: 270 },
  { id: "05", label: "Diagnose", x: 380, y: 348 },
  { id: "06", label: "Repair", x: 150, y: 270 }
];

const loopPath =
  "M 112 86 L 320 54 L 530 86 L 592 270 L 380 348 L 150 270 Z";

export function MarketingHeroIllustration() {
  return (
    <div
      className="marketing-hero-illustration"
      role="img"
      aria-label="DevOps learning system illustration"
    >
      <svg
        viewBox="0 0 704 420"
        className="marketing-hero-svg"
        focusable="false"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="marketing-grid-glow" x1="0" x2="1">
            <stop offset="0%" stopColor="#24335b" />
            <stop offset="50%" stopColor="#40558d" />
            <stop offset="100%" stopColor="#24335b" />
          </linearGradient>
          <filter id="marketing-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="704" height="420" rx="24" fill="#0a1022" />
        <g opacity=".35">
          {Array.from({ length: 13 }).map((_, index) => (
            <line
              key={"v" + index}
              x1={32 + index * 52}
              x2={32 + index * 52}
              y1="28"
              y2="392"
              stroke="#1c2947"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: 8 }).map((_, index) => (
            <line
              key={"h" + index}
              x1="28"
              x2="676"
              y1={36 + index * 48}
              y2={36 + index * 48}
              stroke="#1c2947"
              strokeWidth="1"
            />
          ))}
        </g>

        <path
          d={loopPath}
          fill="none"
          stroke="url(#marketing-grid-glow)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="9 11"
        />

        <circle cx="352" cy="207" r="76" fill="#101a34" stroke="#40558d" strokeWidth="2" />
        <circle cx="352" cy="207" r="59" fill="#111f3c" stroke="#273b69" strokeWidth="1" />
        <text x="352" y="195" textAnchor="middle" fill="#91a7ff" fontSize="11" fontWeight="800" letterSpacing="2.2">
          SYSTEM
        </text>
        <text x="352" y="218" textAnchor="middle" fill="#eef2ff" fontSize="20" fontWeight="800">
          Observe → Explain
        </text>
        <text x="352" y="242" textAnchor="middle" fill="#aeb9d6" fontSize="12">
          Change → Prove
        </text>

        {nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r="36" fill="#101a34" stroke="#40558d" strokeWidth="2" />
            <circle cx={node.x} cy={node.y} r="5" fill="#91a7ff" filter="url(#marketing-soft-glow)" />
            <text
              x={node.x}
              y={node.y + 56}
              textAnchor="middle"
              fill="#eef2ff"
              fontSize="13"
              fontWeight="700"
            >
              {node.label}
            </text>
            <text
              x={node.x}
              y={node.y - 5}
              textAnchor="middle"
              fill="#91a7ff"
              fontSize="10"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              {node.id}
            </text>
          </g>
        ))}

        <g className="marketing-packet" filter="url(#marketing-soft-glow)">
          <circle r="7" fill="#dce3ff" stroke="#91a7ff" strokeWidth="3">
            <animateMotion dur="6.5s" repeatCount="indefinite" path={loopPath} />
          </circle>
        </g>
        <g className="marketing-packet-static">
          <circle cx="112" cy="86" r="7" fill="#dce3ff" stroke="#91a7ff" strokeWidth="3" />
        </g>

        <text x="32" y="389" fill="#7281a8" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
          CONTROLLED FAILURE → EVIDENCE → RECOVERY
        </text>
      </svg>
    </div>
  );
}
