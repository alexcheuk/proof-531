// components.jsx — shared UI primitives for 531 Strength

// ────────────────────────────────────────────────────────────
// Plate math — given target weight, bar weight, available plates,
// return the per-side plate stack (largest to smallest) and
// any unmatched remainder.
// ────────────────────────────────────────────────────────────
function calcPlates(target, bar, plates) {
  const perSide = (target - bar) / 2;
  if (perSide <= 0) return { stack: [], remainder: 0, perSide: 0 };
  let remaining = perSide;
  const stack = [];
  // plates assumed sorted descending
  for (const p of plates) {
    while (remaining + 1e-6 >= p) {
      stack.push(p);
      remaining -= p;
    }
  }
  return { stack, remainder: +remaining.toFixed(2), perSide };
}

// Default plate sets
const PLATES_LBS = [45, 35, 25, 10, 5, 2.5];
const PLATES_KG  = [25, 20, 15, 10, 5, 2.5, 1.25];

// Olympic bar weight
const BAR_LBS = 45;
const BAR_KG  = 20;

// Plate colors — IPF-ish standard, muted to match the editorial palette
const PLATE_PALETTE = {
  45:  { fill: '#1E1B17', label: '#FBF8F1' },  // black
  35:  { fill: '#7A5E2A', label: '#FBF8F1' },  // bronze
  25:  { fill: '#3E5B7A', label: '#FBF8F1' },  // muted blue
  20:  { fill: '#3E5B7A', label: '#FBF8F1' },
  15:  { fill: '#7A5E2A', label: '#FBF8F1' },
  10:  { fill: '#C13D11', label: '#FBF8F1' },  // ember
  5:   { fill: '#5E7044', label: '#FBF8F1' },  // sage
  2.5: { fill: '#948D7E', label: '#FBF8F1' },
  1.25:{ fill: '#DDD6C5', label: '#15130F' },
};

// ────────────────────────────────────────────────────────────
// PlateBar — three visualization variants.
// ────────────────────────────────────────────────────────────
function PlateBar({ weight, unit = 'lbs', variant = 'barbell', mini = false }) {
  const bar = unit === 'kg' ? BAR_KG : BAR_LBS;
  const plates = unit === 'kg' ? PLATES_KG : PLATES_LBS;
  const { stack, perSide } = calcPlates(weight, bar, plates);

  if (variant === 'numerical') {
    return (
      <PlateNumerical stack={stack} unit={unit} perSide={perSide} mini={mini} />
    );
  }
  if (variant === 'chips') {
    return <PlateChips stack={stack} unit={unit} mini={mini} />;
  }
  return <PlateBarbell stack={stack} unit={unit} mini={mini} />;
}

// ── Variant 1: Side-view barbell ───────────────────────────────
function PlateBarbell({ stack, unit, mini }) {
  // Plate sizes — diameter scales with weight, like a real plate
  // Heaviest plate = 100% height, lightest ~40%.
  const max = unit === 'kg' ? 25 : 45;
  const min = unit === 'kg' ? 1.25 : 2.5;
  const sizeFor = (p) => {
    const t = (p - min) / (max - min);
    return 0.42 + t * 0.58;  // 0.42 → 1.0
  };

  const barH = mini ? 80 : 132;
  const collarH = barH * 0.16;
  const sleeveH = barH * 0.10;
  const plateW = mini ? 11 : 16;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: barH,
      position: 'relative',
    }}>
      {/* Left side plates (reversed: largest closest to center) */}
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row-reverse' }}>
        {stack.slice().reverse().map((p, i) => (
          <PlateRect key={`l${i}`} weight={p} height={barH * sizeFor(p)} width={plateW} />
        ))}
      </div>

      {/* Collar */}
      <div style={{
        width: plateW * 0.6,
        height: collarH,
        background: '#7A6D55',
        borderRadius: 2,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2)',
      }} />

      {/* Sleeve (silver bar segment) */}
      <div style={{
        width: 26,
        height: sleeveH,
        background: 'linear-gradient(to bottom, #C9C2B0 0%, #A8A293 50%, #C9C2B0 100%)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: 1, background: 'rgba(0,0,0,0.25)',
        }} />
      </div>

      {/* Collar */}
      <div style={{
        width: plateW * 0.6,
        height: collarH,
        background: '#7A6D55',
        borderRadius: 2,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2)',
      }} />

      {/* Right side plates */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {stack.map((p, i) => (
          <PlateRect key={`r${i}`} weight={p} height={barH * sizeFor(p)} width={plateW} />
        ))}
      </div>

      {/* End cap of sleeve (right) */}
      <div style={{
        width: 6,
        height: sleeveH * 0.7,
        background: 'linear-gradient(to bottom, #C9C2B0, #8A8479)',
        borderRadius: '0 2px 2px 0',
        marginLeft: 1,
      }} />
    </div>
  );
}

function PlateRect({ weight, height, width }) {
  const c = PLATE_PALETTE[weight] || PLATE_PALETTE[10];
  return (
    <div style={{
      width,
      height,
      background: c.fill,
      borderRadius: 2,
      margin: '0 0.5px',
      position: 'relative',
      boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.12), inset -1px 0 0 rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15)',
    }}>
      {height > 60 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-90deg)',
          fontFamily: 'var(--mono)',
          fontSize: 9,
          fontWeight: 700,
          color: c.label,
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}>
          {weight}
        </div>
      )}
    </div>
  );
}

// ── Variant 2: Chips in a row ──────────────────────────────────
function PlateChips({ stack, unit, mini }) {
  if (stack.length === 0) {
    return (
      <div style={{
        fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-2)',
        fontSize: 16,
        padding: '12px 0',
      }}>
        bar only
      </div>
    );
  }
  const sz = mini ? 28 : 36;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
      <div style={{
        fontFamily: 'var(--sans)',
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--ink-2)',
        marginBottom: 2,
      }}>
        per side
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {stack.map((p, i) => {
          const c = PLATE_PALETTE[p] || PLATE_PALETTE[10];
          return (
            <div key={i} style={{
              minWidth: sz,
              height: sz,
              padding: '0 8px',
              borderRadius: sz / 2,
              background: c.fill,
              color: c.label,
              fontFamily: 'var(--mono)',
              fontWeight: 700,
              fontSize: mini ? 12 : 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 2px rgba(0,0,0,0.15)',
              letterSpacing: '-0.02em',
            }}>
              {p}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Variant 3: Numerical only ──────────────────────────────────
function PlateNumerical({ stack, unit, perSide, mini }) {
  // Group consecutive same weights
  const grouped = [];
  for (const p of stack) {
    const last = grouped[grouped.length - 1];
    if (last && last.weight === p) last.count++;
    else grouped.push({ weight: p, count: 1 });
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{
        fontFamily: 'var(--sans)',
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--ink-2)',
      }}>
        per side · {perSide} {unit}
      </div>
      {grouped.length === 0 ? (
        <div style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-2)', fontSize: 18 }}>
          bar only
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          {grouped.map((g, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <span style={{
                  fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-2)',
                  fontSize: 18,
                }}>+</span>
              )}
              <span className="weight-num" style={{ fontSize: 22, color: 'var(--ink-0)' }}>
                {g.count > 1 && (
                  <span style={{ fontSize: 14, color: 'var(--ink-2)', marginRight: 3 }}>
                    {g.count}×
                  </span>
                )}
                {g.weight}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Big number display — for weight + reps targets
// ────────────────────────────────────────────────────────────
function BigWeight({ weight, unit, size = 64, color = 'var(--ink)' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
      <span className="weight-num" style={{
        fontSize: size,
        lineHeight: 0.9,
        color,
        letterSpacing: '-0.04em',
      }}>{weight}</span>
      <span style={{
        fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: size * 0.32,
        color: 'var(--ink-2)',
        marginBottom: 4,
      }}>{unit}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Eyebrow — small uppercase mono label, technical voice
// ────────────────────────────────────────────────────────────
function Eyebrow({ children, style = {} }) {
  return (
    <div style={{
      fontFamily: 'var(--mono)',
      fontSize: 11,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.16em',
      color: 'var(--ink-2)',
      ...style,
    }}>{children}</div>
  );
}

function Caps({ children, style = {} }) {
  return (
    <div style={{
      fontFamily: 'var(--mono)',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'var(--ink-2)',
      ...style,
    }}>{children}</div>
  );
}

// ────────────────────────────────────────────────────────────
// PressButton — primary action button, pill shape, ink fill
// ────────────────────────────────────────────────────────────
function PressButton({ children, onClick, variant = 'primary', size = 'md', disabled = false, style = {} }) {
  const sizes = {
    sm: { h: 36, px: 16, fs: 14 },
    md: { h: 52, px: 24, fs: 15 },
    lg: { h: 60, px: 28, fs: 16 },
  };
  const s = sizes[size];
  const variants = {
    primary: {
      background: disabled ? 'rgba(250, 250, 245, 0.18)' : 'var(--ink-0)',
      color: 'var(--bg-0)',
    },
    ember: {
      background: disabled ? 'rgba(255, 85, 48, 0.4)' : 'var(--hot)',
      color: 'var(--ink-0)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink-0)',
      border: '1px solid var(--line-strong)',
    },
    chip: {
      background: 'var(--bg-1)',
      color: 'var(--ink-0)',
      border: '1px solid var(--line)',
    },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        height: s.h,
        padding: `0 ${s.px}px`,
        borderRadius: 999,
        border: 'none',
        fontFamily: 'var(--sans)',
        fontSize: s.fs,
        fontWeight: 500,
        letterSpacing: '0.005em',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: disabled ? 0.6 : 1,
        transition: 'all var(--dur) var(--ease)',
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// Icon — thin svg glyphs (instead of pulling lucide-react UMD)
// ────────────────────────────────────────────────────────────
function Icon({ name, size = 18, color = 'currentColor', stroke = 1.6 }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  switch (name) {
    case 'check':       return <svg {...props}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'x':           return <svg {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'arrow-right': return <svg {...props}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case 'arrow-left':  return <svg {...props}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
    case 'arrow-up':    return <svg {...props}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
    case 'plus':        return <svg {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'minus':       return <svg {...props}><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'play':        return <svg {...props} fill={color} stroke="none"><polygon points="6 4 20 12 6 20"/></svg>;
    case 'pause':       return <svg {...props}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
    case 'flame':       return <svg {...props}><path d="M8.5 14.5A2.5 2.5 0 0011 17c1.4 0 2.5-1.1 2.5-2.5 0-1.8-1.5-3-2.5-5 0 0-2 2.5-2 5z"/><path d="M14 12c-.6-2-2-3-2-6 0-1.5 1-3 1-3-3 1-7 4-7 9 0 3.3 2.7 6 6 6s6-2.7 6-6c0-2-1-3.5-2-5"/></svg>;
    case 'chevron-down': return <svg {...props}><polyline points="6 9 12 15 18 9"/></svg>;
    case 'chevron-right': return <svg {...props}><polyline points="9 6 15 12 9 18"/></svg>;
    case 'circle':      return <svg {...props}><circle cx="12" cy="12" r="9"/></svg>;
    case 'dot':         return <svg {...props} fill={color} stroke="none"><circle cx="12" cy="12" r="3"/></svg>;
    case 'home':        return <svg {...props}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z"/></svg>;
    case 'dumbbell':    return <svg {...props}><path d="M6 5v14M3 8v8M21 8v8M18 5v14"/><line x1="6" y1="12" x2="18" y2="12"/></svg>;
    case 'calendar':    return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>;
    case 'history':     return <svg {...props}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>;
    case 'settings':    return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h.1a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5h.1a1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v.1a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>;
    case 'trending-up': return <svg {...props}><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>;
    case 'menu':        return <svg {...props}><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>;
    case 'note':        return <svg {...props}><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="14 3 14 9 20 9"/></svg>;
    case 'timer':       return <svg {...props}><circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 14 15"/><line x1="9" y1="3" x2="15" y2="3"/></svg>;
    case 'sparkle':     return <svg {...props}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 16l.7 2 2 .7-2 .7L19 22l-.7-1.6-2-.7 2-.7z"/></svg>;
    case 'edit':        return <svg {...props}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 113 3L12 15l-4 1 1-4z"/></svg>;
    case 'list':        return <svg {...props}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>;
    case 'trophy':      return <svg {...props}><path d="M8 21h8M12 17v4M17 4H7v6a5 5 0 0010 0z"/><path d="M17 4h3v3a3 3 0 01-3 3M7 4H4v3a3 3 0 003 3"/></svg>;
    case 'volume':      return <svg {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"/><path d="M15.5 8.5a5 5 0 010 7M19 5a9 9 0 010 14"/></svg>;
    case 'lightning':   return <svg {...props}><polygon points="13 2 4 14 11 14 10 22 19 10 12 10"/></svg>;
    default: return null;
  }
}

// ────────────────────────────────────────────────────────────
// Card — borderless paper card
// ────────────────────────────────────────────────────────────
function Card({ children, padding = 20, style = {}, onClick, variant = 'soft' }) {
  const variants = {
    soft:  { background: 'var(--bg-1)' },
    bright:{ background: 'var(--bg-2)' },
    ink:   { background: '#050505', color: 'var(--ink-0)', border: '1px solid var(--line)' },
    ember: { background: 'var(--hot)', color: 'var(--ink-0)' },
    outline: { background: 'transparent', border: '1px solid var(--line-strong)' },
  };
  return (
    <div onClick={onClick} style={{
      borderRadius: 'var(--r-md)',
      padding,
      transition: 'transform 0.18s var(--ease)',
      cursor: onClick ? 'pointer' : 'default',
      ...variants[variant],
      ...style,
    }}>
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SegRail — horizontal segmented control
// ────────────────────────────────────────────────────────────
function SegRail({ options, value, onChange, style = {} }) {
  return (
    <div style={{
      display: 'inline-flex',
      padding: 3,
      background: 'rgba(250, 250, 245, 0.06)',
      borderRadius: 999,
      ...style,
    }}>
      {options.map((o) => {
        const v = typeof o === 'object' ? o.value : o;
        const l = typeof o === 'object' ? o.label : o;
        const on = v === value;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            border: 'none',
            background: on ? 'var(--ink-0)' : 'transparent',
            color: on ? 'var(--bg-0)' : 'var(--ink-2)',
            padding: '8px 14px',
            borderRadius: 999,
            fontFamily: 'var(--sans)',
            fontSize: 13,
            fontWeight: 500,
            transition: 'all var(--dur) var(--ease)',
          }}>{l}</button>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PRConfetti — minimal celebration animation (no emoji, no faces)
// ────────────────────────────────────────────────────────────
function PRConfetti() {
  const pieces = React.useMemo(() => Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 280,
    y: 80 + Math.random() * 200,
    rot: Math.random() * 720 - 360,
    delay: Math.random() * 0.4,
    color: ['var(--hot)', 'var(--ink)', 'var(--lime)', 'var(--amber)'][i % 4],
    shape: i % 3,
  })), []);

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
    }}>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: 'absolute',
          left: '50%',
          top: '30%',
          width: p.shape === 0 ? 4 : 8,
          height: p.shape === 0 ? 12 : 4,
          background: p.color,
          borderRadius: p.shape === 2 ? '50%' : 1,
          animation: `pr-burst 1.4s ${p.delay}s var(--ease) forwards`,
          '--tx': `${p.x}px`,
          '--ty': `${p.y}px`,
          '--tr': `${p.rot}deg`,
        }} />
      ))}
      <style>{`
        @keyframes pr-burst {
          0%   { transform: translate(-50%, -50%) rotate(0); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--tr)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Expose
Object.assign(window, {
  calcPlates, PLATES_LBS, PLATES_KG, BAR_LBS, BAR_KG, PLATE_PALETTE,
  PlateBar, PlateBarbell, PlateChips, PlateNumerical,
  BigWeight, Eyebrow, Caps, PressButton, Icon, Card, SegRail, PRConfetti,
});
