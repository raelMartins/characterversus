import type { Look } from "@/lib/schemas";

// Faceless mannequin fighter. Recognisable from colors, silhouette, hair, prop and aura alone,
// with no faces and no logos. The shading gradients live once in <FigureDefs/> in the root layout.

type Props = {
  look: Look;
  flip?: boolean;
  noAura?: boolean;
  label: string;
  className?: string;
};

const BUILD_X: Record<Look["build"], number> = { slim: 0.9, average: 1, muscular: 1.12, huge: 1.28, small: 0.92 };

export function FigureDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="fig-head" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity=".6" />
          <stop offset=".42" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".38" />
        </radialGradient>
        <linearGradient id="fig-body" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".2" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Aura({ kind, accent }: { kind: Look["aura"]; accent: string }) {
  switch (kind) {
    case "water":
      return (
        <g>
          <path d="M14 282 Q56 252 100 274 Q144 296 186 266" stroke="#38a6d8" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".9" />
          <path d="M26 256 Q48 222 36 186 Q70 210 60 252Z" fill="#5cc3ea" opacity=".65" />
          <path d="M166 236 Q184 204 170 172 Q198 198 186 238Z" fill="#5cc3ea" opacity=".65" />
        </g>
      );
    case "fire":
      return (
        <g>
          <path d="M30 272 Q18 230 40 198 Q40 226 54 232 Q48 204 68 182 Q68 222 82 240 Q88 264 68 276Z" fill="#ff6a1a" opacity=".9" />
          <path d="M44 272 Q40 248 52 234 Q58 252 68 258 Q70 270 60 276Z" fill="#ffd23f" />
          <path d="M150 276 Q140 244 158 220 Q160 240 170 244 Q168 222 184 206 Q194 240 186 264 Q182 278 168 280Z" fill="#ff6a1a" opacity=".9" />
          <path d="M160 276 Q158 258 168 248 Q172 262 180 266 Q178 278 170 280Z" fill="#ffd23f" />
        </g>
      );
    case "lightning":
      return (
        <g fill="none" stroke="#ffe14a" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
          <path d="M30 150 L46 180 L32 186 L52 226" />
          <path d="M172 130 L156 166 L172 170 L152 214" />
          <path d="M40 250 L60 262 L48 272 L70 284" opacity=".8" />
        </g>
      );
    case "energy":
    case "magic":
    case "light":
      return (
        <g fill={kind === "light" ? "#fff6c4" : accent} opacity=".75">
          <circle cx="34" cy="200" r="7" />
          <circle cx="170" cy="180" r="9" />
          <circle cx="48" cy="140" r="4" />
          <circle cx="160" cy="250" r="5" />
          <circle cx="24" cy="252" r="5" />
          <path d="M176 120 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z" />
          <path d="M28 104 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z" />
        </g>
      );
    case "shadow":
      return (
        <g fill="#2a1f3a" opacity=".65">
          <path d="M20 280 Q30 220 60 200 Q46 240 70 280Z" />
          <path d="M180 280 Q172 230 146 206 Q160 246 134 280Z" />
        </g>
      );
    case "ice":
      return (
        <g fill="#bfe9ff" stroke="#7cc8ef" strokeWidth="2" opacity=".85">
          <path d="M24 280 L36 220 L48 280Z" />
          <path d="M44 280 L52 246 L60 280Z" />
          <path d="M150 280 L162 214 L174 280Z" />
          <path d="M170 280 L178 244 L186 280Z" />
        </g>
      );
    case "wind":
      return (
        <g fill="none" stroke="#b8c4cc" strokeWidth="4" strokeLinecap="round" opacity=".8">
          <path d="M18 170 Q50 160 60 176 Q66 190 50 190" />
          <path d="M150 210 Q186 200 188 222 Q186 236 170 232" />
          <path d="M20 240 Q60 230 90 246" />
        </g>
      );
    case "earth":
      return (
        <g fill="#8a6a44" stroke="#5e4529" strokeWidth="2">
          <path d="M18 284 L28 256 L48 252 L56 284Z" />
          <path d="M146 284 L156 248 L180 244 L188 284Z" />
          <path d="M36 220 L46 210 L56 218 L50 230Z" />
        </g>
      );
    default:
      return null;
  }
}

function Prop({ kind, accent }: { kind: Look["prop"]; accent: string }) {
  const metal = "#c9ced6";
  switch (kind) {
    case "sword":
      return (
        <g strokeLinecap="round">
          <path d="M150 140 L184 56" stroke={metal} strokeWidth="6" />
          <path d="M139 131 L162 147" stroke={accent} strokeWidth="6" />
        </g>
      );
    case "dagger":
      return (
        <g strokeLinecap="round">
          <path d="M152 138 L170 104" stroke={metal} strokeWidth="5" />
          <path d="M144 132 L160 142" stroke={accent} strokeWidth="5" />
        </g>
      );
    case "spear":
      return (
        <g>
          <path d="M136 176 L186 40" stroke="#7a5a34" strokeWidth="5" strokeLinecap="round" />
          <path d="M186 40 L178 62 L192 60Z" fill={metal} />
        </g>
      );
    case "trident":
      return (
        <g stroke={accent} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M136 176 L184 48" />
          <path d="M170 44 L184 48 L196 40 M184 48 L186 30 M170 44 L168 30 M196 40 L202 28" />
        </g>
      );
    case "hammer":
      return (
        <g>
          <path d="M150 142 L176 82" stroke="#6b4a22" strokeWidth="6" strokeLinecap="round" />
          <rect x="158" y="58" width="40" height="26" rx="3" transform="rotate(24 178 71)" fill={metal} stroke="#8a929c" strokeWidth="2" />
        </g>
      );
    case "axe":
      return (
        <g>
          <path d="M150 142 L178 70" stroke="#6b4a22" strokeWidth="6" strokeLinecap="round" />
          <path d="M172 70 Q196 66 196 92 Q184 84 168 90Z" fill={metal} />
        </g>
      );
    case "staff":
      return (
        <g>
          <path d="M146 200 L170 40" stroke="#7a5a34" strokeWidth="6" strokeLinecap="round" />
          <circle cx="171" cy="36" r="9" fill={accent} />
        </g>
      );
    case "wand":
      return <path d="M150 140 L176 106" stroke="#5a3d22" strokeWidth="4" strokeLinecap="round" />;
    case "bow":
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M166 70 Q196 140 166 210" stroke="#7a5a34" strokeWidth="5" />
          <path d="M166 70 L166 210" stroke="#ddd" strokeWidth="1.5" />
        </g>
      );
    case "gun":
      return (
        <g fill="#2c2f36">
          <rect x="148" y="124" width="34" height="10" rx="2" />
          <rect x="148" y="130" width="10" height="18" rx="2" />
        </g>
      );
    case "shield":
      return (
        <g>
          <circle cx="60" cy="146" r="26" fill={accent} stroke="#000" strokeOpacity=".25" strokeWidth="3" />
          <circle cx="60" cy="146" r="14" fill="#fff" fillOpacity=".25" />
        </g>
      );
    case "claws":
      return (
        <g stroke={metal} strokeWidth="3" strokeLinecap="round">
          <path d="M156 136 L184 112 M158 142 L188 124 M156 148 L186 138" />
        </g>
      );
    case "whip":
      return <path d="M152 140 Q190 120 176 170 Q166 210 196 230" stroke="#4a3320" strokeWidth="4" fill="none" strokeLinecap="round" />;
    case "book":
      return <rect x="142" y="126" width="26" height="32" rx="2" fill={accent} stroke="#000" strokeOpacity=".3" strokeWidth="2" />;
    case "microphone":
      return (
        <g>
          <path d="M152 140 L164 118" stroke="#2c2f36" strokeWidth="5" strokeLinecap="round" />
          <circle cx="167" cy="112" r="8" fill="#8a929c" />
        </g>
      );
    default:
      return null;
  }
}

function HairBack({ style, color }: { style: Look["hairStyle"]; color: string }) {
  if (style === "long") return <path d="M73 56 Q72 26 100 27 Q128 26 127 56 Q134 96 140 130 Q122 122 118 100 L82 100 Q78 122 60 130 Q66 96 73 56Z" fill={color} />;
  if (style === "mane") return <path d="M68 60 Q62 20 100 20 Q138 20 132 60 Q146 90 130 110 Q110 100 100 100 Q90 100 70 110 Q54 90 68 60Z" fill={color} />;
  if (style === "ponytail") return <path d="M120 44 Q148 52 144 96 Q136 80 124 70Z" fill={color} />;
  return null;
}

function HairTop({ style, color }: { style: Look["hairStyle"]; color: string }) {
  switch (style) {
    case "none":
      return null;
    case "spiky":
      return <path d="M74 56 L70 30 L86 38 L90 18 L102 34 L112 16 L116 36 L132 28 L126 56 Q114 42 100 42 Q86 42 74 56Z" fill={color} />;
    case "short":
      return <path d="M75 56 Q73 28 100 29 Q128 28 126 54 Q120 42 114 46 Q110 35 102 42 Q94 33 88 44 Q82 40 75 56Z" fill={color} />;
    default:
      return <path d="M75 54 Q76 28 100 28 Q124 28 125 54 Q112 40 100 42 Q88 40 75 54Z" fill={color} />;
  }
}

export function Figure({ look, flip, noAura, label, className }: Props) {
  const bx = BUILD_X[look.build] ?? 1;
  const small = look.build === "small";
  // Widen the torso and arms around the body's centre line for bigger builds.
  const bodyTransform = `translate(100 0) scale(${bx} 1) translate(-100 0)`;
  return (
    <svg className={className ?? "fig"} viewBox="0 0 200 300" role="img" aria-label={`${label}, drawn as a faceless figure`}>
      <g transform={`${flip ? "translate(200 0) scale(-1 1) " : ""}${small ? "translate(10 30) scale(0.9)" : ""}`}>
        {!noAura && <Aura kind={look.aura} accent={look.accent} />}
        {look.cape && <path d="M70 98 Q100 92 130 98 L150 250 Q100 270 50 250Z" fill={look.accent} opacity=".95" />}
        <HairBack style={look.hairStyle} color={look.hair} />
        <g transform={bodyTransform}>
          <path d="M76 102 Q56 122 58 150 Q60 157 68 154 Q70 132 86 116Z" fill={look.skin} />
          <path d="M76 102 Q62 112 60 124 L72 128 Q76 116 86 112Z" fill={look.top} />
          <circle cx="63" cy="153" r="7" fill={look.skin} />
        </g>
        <path d="M84 170 L70 262 L88 264 L100 200 L112 264 L130 262 L116 170Z" fill={look.bottom} />
        <path d="M66 258 h26 v12 h-30z" fill="#24221f" />
        <path d="M108 258 h26 l4 12 h-30z" fill="#24221f" />
        <g transform={bodyTransform}>
          <path d="M68 100 Q100 88 132 100 L126 146 Q120 168 116 174 L84 174 Q80 168 74 146Z" fill={look.top} />
          <path d="M68 100 Q100 88 132 100 L126 146 Q120 168 116 174 L84 174 Q80 168 74 146Z" fill="url(#fig-body)" />
          <path d="M84 124 Q100 133 116 124 M100 110 V160" stroke="#000" strokeOpacity=".2" strokeWidth="2" fill="none" />
          <rect x="82" y="165" width="36" height="8" fill="#000" fillOpacity=".35" />
        </g>
        <Prop kind={look.prop} accent={look.accent} />
        <g transform={bodyTransform}>
          <path d="M124 100 Q146 112 156 134 Q154 143 146 142 Q138 124 120 116Z" fill={look.skin} />
          <path d="M124 100 Q138 106 146 118 L134 124 Q128 114 120 112Z" fill={look.top} />
        </g>
        <circle cx="151" cy="140" r="8" fill={look.skin} />
        <rect x="93" y="76" width="14" height="16" rx="4" fill={look.skin} />
        <circle cx="100" cy="58" r="24" fill={look.skin} />
        <circle cx="100" cy="58" r="24" fill="url(#fig-head)" />
        <HairTop style={look.hairStyle} color={look.hair} />
      </g>
    </svg>
  );
}
