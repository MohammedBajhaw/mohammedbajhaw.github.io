import type { ReactElement } from "react";

type ArtKind = "hero" | "projects" | "publications" | "experiences" | "skills";

const dots = (cols: number, rows: number, x0: number, y0: number, dx: number, dy: number, skew = 0) =>
  Array.from({ length: cols * rows }, (_, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    return <circle key={i} cx={x0 + c * dx + r * skew} cy={y0 + r * dy} r={1.6} className="art-fill" />;
  });

/** Drone scanning a tunnel wall: LiDAR fan, point-cloud wall and a planned waypoint path. */
function DroneScan() {
  return (
    <>
      <g className="art-line">
        <rect x="150" y="150" width="72" height="22" rx="8" />
        <line x1="150" y1="156" x2="96" y2="130" />
        <line x1="222" y1="156" x2="276" y2="130" />
        <line x1="150" y1="168" x2="104" y2="196" />
        <line x1="222" y1="168" x2="268" y2="196" />
        <ellipse cx="86" cy="124" rx="34" ry="7" />
        <ellipse cx="286" cy="124" rx="34" ry="7" />
        <ellipse cx="94" cy="202" rx="30" ry="6" />
        <ellipse cx="276" cy="202" rx="30" ry="6" />
        <circle cx="186" cy="184" r="11" />
        <path d="M176 184 h20" />
      </g>
      <g className="art-fill">
        <circle cx="86" cy="124" r="3" />
        <circle cx="286" cy="124" r="3" />
        <circle cx="94" cy="202" r="3" />
        <circle cx="276" cy="202" r="3" />
      </g>
      <g className="art-line art-dash">
        <line x1="186" y1="195" x2="330" y2="232" />
        <line x1="186" y1="195" x2="338" y2="282" />
        <line x1="186" y1="195" x2="320" y2="330" />
        <path d="M262 214 Q278 244 258 276" />
        <path d="M232 207 Q252 252 226 300" />
      </g>
      {dots(5, 9, 318, 196, 14, 18, 6)}
      <path className="art-line art-dash" d="M30 330 C90 300 120 350 190 322 S260 250 300 250" />
      <g className="art-line">
        <circle cx="30" cy="330" r="6" />
        <circle cx="116" cy="326" r="4" />
        <circle cx="206" cy="316" r="4" />
        <circle cx="300" cy="250" r="6" />
      </g>
    </>
  );
}

/** Industrial arm with joint angle arcs and its reachable workspace. */
function ArmArt() {
  return (
    <>
      <g className="art-line">
        <ellipse cx="120" cy="336" rx="74" ry="14" />
        <path d="M82 336 v-26 h76 v26" />
        <path d="M92 310 l8 -30 h40 l8 30" />
        <circle cx="120" cy="272" r="14" />
        <path d="M112 262 L196 156 L214 170 L130 282" />
        <circle cx="205" cy="163" r="13" />
        <path d="M212 152 L298 126 L304 146 L214 174" />
        <circle cx="301" cy="136" r="9" />
        <path d="M308 132 l36 -10 M308 142 l36 8 M344 122 v-12 M344 150 v12" />
      </g>
      <g className="art-line art-dash">
        <path d="M120 272 m-110 0 a110 110 0 0 1 110 -110" />
        <path d="M120 272 m-170 0 a170 170 0 0 1 170 -170" opacity="0.6" />
        <path d="M150 272 a30 30 0 0 0 -16 -22" />
        <path d="M222 163 a20 20 0 0 1 -6 22" />
        <line x1="120" y1="272" x2="120" y2="120" />
      </g>
      <g className="art-fill">
        <circle cx="120" cy="272" r="3.5" />
        <circle cx="205" cy="163" r="3.5" />
        <circle cx="301" cy="136" r="3.5" />
        <circle cx="352" cy="124" r="4" />
      </g>
      <g className="art-line">
        <path d="M352 124 m-9 0 h18 M352 115 v18" />
      </g>
    </>
  );
}

/** Trajectory plot: a drifting estimate corrected onto the true path, with an uncertainty ellipse. */
function TrajectoryArt() {
  return (
    <>
      <g className="art-line">
        <path d="M44 340 V54 M44 340 H360" />
        <path d="M44 54 l-5 12 m5 -12 l5 12 M360 340 l-12 -5 m12 5 l-12 5" />
      </g>
      <g className="art-line art-faint">
        {[100, 160, 220, 280].map((v) => <line key={`h${v}`} x1="44" y1={v} x2="360" y2={v} />)}
        {[110, 180, 250, 320].map((v) => <line key={`v${v}`} x1={v} y1="54" x2={v} y2="340" />)}
      </g>
      <path className="art-line art-dash" d="M60 320 C110 300 140 250 190 236 S280 150 336 70" opacity="0.7" />
      <path className="art-line art-strong" d="M60 320 C100 296 150 270 196 232 S270 170 330 118 S352 96 356 84" />
      <g className="art-line">
        <ellipse cx="196" cy="232" rx="30" ry="16" transform="rotate(-38 196 232)" />
        <ellipse cx="290" cy="160" rx="22" ry="10" transform="rotate(-38 290 160)" />
      </g>
      <g className="art-fill">
        {[[60, 320], [110, 289], [150, 266], [196, 232], [244, 193], [290, 160], [330, 118]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="4" />)}
      </g>
      <g className="art-line">
        <circle cx="356" cy="84" r="8" />
        <circle cx="60" cy="320" r="8" />
      </g>
    </>
  );
}

/** Circuit board with a central processor, routed traces and vias. */
function CircuitArt() {
  const pins = Array.from({ length: 5 }, (_, i) => 160 + i * 20);
  return (
    <>
      <g className="art-line">
        <rect x="150" y="150" width="120" height="120" rx="8" />
        <rect x="174" y="174" width="72" height="72" rx="4" />
        {pins.map((p) => (
          <g key={p}>
            <line x1={p + 10} y1="150" x2={p + 10} y2="132" />
            <line x1={p + 10} y1="270" x2={p + 10} y2="288" />
            <line x1="150" y1={p + 10} x2="132" y2={p + 10} />
            <line x1="270" y1={p + 10} x2="288" y2={p + 10} />
          </g>
        ))}
      </g>
      <g className="art-line art-strong">
        <path d="M170 132 V90 H90 V60" />
        <path d="M210 132 V110 H260 V70 H330" />
        <path d="M250 132 V100" />
        <path d="M288 190 H340 V250 H372" />
        <path d="M288 230 H320 V320 H250" />
        <path d="M170 288 V330 H100" />
        <path d="M210 288 V350" />
        <path d="M132 190 H70 V250 H30" />
        <path d="M132 230 H100 V290 H60" />
      </g>
      <g className="art-line">
        {[[90, 60], [330, 70], [250, 100], [372, 250], [250, 320], [100, 330], [210, 350], [30, 250], [60, 290]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="7" />)}
      </g>
      <g className="art-fill">
        {[[90, 60], [330, 70], [372, 250], [100, 330], [30, 250]].map(([x, y]) => <circle key={`f${x}${y}`} cx={x} cy={y} r="2.6" />)}
        <circle cx="210" cy="210" r="5" />
      </g>
    </>
  );
}

/** Stacked layers (sensing, perception, planning, control) joined by data links. */
function LayersArt() {
  const layers = [300, 232, 164, 96];
  return (
    <>
      {layers.map((y, i) => (
        <g key={y} className="art-line" opacity={1 - i * 0.12}>
          <path d={`M200 ${y} L340 ${y + 36} L200 ${y + 72} L60 ${y + 36} Z`} />
          <path d={`M60 ${y + 36} v10 L200 ${y + 82} L340 ${y + 46} v-10`} />
        </g>
      ))}
      <g className="art-line art-dash">
        <line x1="200" y1="132" x2="200" y2="372" />
        <line x1="120" y1="150" x2="120" y2="318" />
        <line x1="280" y1="150" x2="280" y2="318" />
      </g>
      <g className="art-fill">
        {layers.map((y) => <circle key={y} cx="200" cy={y + 36} r="5" />)}
        {layers.map((y) => <circle key={`a${y}`} cx="120" cy={y + 36 - 10 + 0} r="3" />)}
        {layers.map((y) => <circle key={`b${y}`} cx="280" cy={y + 36 - 10 + 0} r="3" />)}
      </g>
    </>
  );
}

const ART: Record<ArtKind, () => ReactElement> = {
  hero: DroneScan,
  projects: ArmArt,
  publications: TrajectoryArt,
  experiences: CircuitArt,
  skills: LayersArt,
};

export function SectionArt({ kind }: { kind: ArtKind }) {
  const Art = ART[kind];
  return (
    <svg className={`section-art section-art-${kind}`} viewBox="0 0 400 400" role="presentation" aria-hidden="true" focusable="false">
      <Art />
    </svg>
  );
}
