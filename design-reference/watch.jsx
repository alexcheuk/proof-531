// watch.jsx — Apple Watch companion mockup

function AppleWatch({ weight, reps, unit, restSeconds, state = 'active' }) {
  const W = 198;  // 45mm Watch S10 frame width
  const H = 240;
  return (
    <div style={{
      width: W + 40,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Crown + side button suggestion */}
      <div style={{
        width: W, height: H,
        background: '#0E0D0B',
        borderRadius: 52,
        position: 'relative',
        boxShadow:
          '0 0 0 1px #1F1B16,' +
          '0 0 0 6px #1A1714,' +
          '0 0 0 7px #2A2520,' +
          '0 30px 60px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        {/* Digital crown */}
        <div style={{
          position: 'absolute', right: -7, top: 60,
          width: 8, height: 24, borderRadius: '2px 4px 4px 2px',
          background: 'linear-gradient(180deg, #3A332B, #1F1B16)',
        }} />
        {/* Side button */}
        <div style={{
          position: 'absolute', right: -5, top: 130,
          width: 6, height: 30, borderRadius: '2px 3px 3px 2px',
          background: '#1F1B16',
        }} />

        {/* Watch face content */}
        <WatchFace weight={weight} reps={reps} unit={unit} restSeconds={restSeconds} state={state} />
      </div>

      <div style={{
        fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13,
        color: 'rgba(250, 250, 245, 0.4)',
        marginTop: 16,
      }}>
        Watch companion
      </div>
    </div>
  );
}

function WatchFace({ weight, reps, unit, restSeconds = 47, state }) {
  if (state === 'rest') {
    return <WatchRest restSeconds={restSeconds} weight={weight} reps={reps} unit={unit} />;
  }
  if (state === 'pr') {
    return <WatchPR weight={weight} reps={reps} unit={unit} />;
  }
  return <WatchActive weight={weight} reps={reps} unit={unit} />;
}

// State 1: active set — showing weight + plate hint + rep target
function WatchActive({ weight, reps, unit }) {
  return (
    <div style={{
      padding: '22px 16px 18px',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      fontFamily: '-apple-system, system-ui, sans-serif',
    }}>
      {/* Status row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.45)',
      }}>
        <span style={{ color: 'var(--hot)' }}>● SET 3 · AMRAP</span>
        <span>9:41</span>
      </div>

      {/* Big weight */}
      <div style={{
        textAlign: 'center', marginTop: 12,
      }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontWeight: 600,
          fontSize: 56,
          letterSpacing: '-0.04em',
          lineHeight: 0.9,
          color: '#fff',
        }}>{weight}</div>
        <div style={{
          fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 14,
          color: 'rgba(255,255,255,0.6)',
          marginTop: 4,
        }}>{unit} · ×{reps}+</div>
      </div>

      {/* Plate hint — chips style */}
      <div style={{
        display: 'flex', gap: 3, justifyContent: 'center',
        marginTop: 12, flexWrap: 'wrap',
      }}>
        {[45, 45, 25, 10].map((p, i) => {
          const c = PLATE_PALETTE[p];
          return (
            <div key={i} style={{
              minWidth: 20, height: 20, padding: '0 5px',
              borderRadius: 10,
              background: c.fill, color: c.label,
              fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              letterSpacing: '-0.02em',
            }}>{p}</div>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Action button */}
      <div style={{
        height: 38, borderRadius: 19,
        background: 'var(--hot)',
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 600,
        letterSpacing: '0.01em',
      }}>
        Done
      </div>
    </div>
  );
}

// State 2: rest timer with circular progress
function WatchRest({ restSeconds, weight, reps, unit }) {
  const target = 120;
  const pct = Math.min(1, restSeconds / target);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{
      padding: '22px 16px 18px',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      fontFamily: '-apple-system, system-ui, sans-serif',
      alignItems: 'center',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%',
        fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.45)',
      }}>
        <span>RESTING</span>
        <span>9:41</span>
      </div>

      {/* Ring */}
      <div style={{ position: 'relative', marginTop: 6 }}>
        <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={65} cy={65} r={58} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={7} />
          <circle cx={65} cy={65} r={58} fill="none" stroke="var(--hot)" strokeWidth={7}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 58}
                  strokeDashoffset={2 * Math.PI * 58 * (1 - pct)} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--mono)', fontWeight: 600,
            fontSize: 36, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1,
          }}>{fmt(restSeconds)}</div>
          <div style={{
            fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4,
          }}>{weight} × {reps}</div>
        </div>
      </div>
    </div>
  );
}

// State 3: PR celebration
function WatchPR({ weight, reps, unit }) {
  return (
    <div style={{
      padding: '22px 16px',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <PRConfetti />
      <div style={{ zIndex: 2 }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em',
          color: 'var(--hot)', fontWeight: 700,
        }}>PERSONAL RECORD</div>
        <div style={{
          fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 32, lineHeight: 1, marginTop: 8,
          color: '#fff',
        }}>Stronger.</div>
        <div style={{
          fontFamily: 'var(--mono)', fontWeight: 600,
          fontSize: 24, marginTop: 10, color: 'var(--hot)',
          letterSpacing: '-0.02em',
        }}>{weight} × {reps}</div>
        <div style={{
          fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 6,
        }}>new e1RM</div>
      </div>
    </div>
  );
}

Object.assign(window, { AppleWatch, WatchFace, WatchActive, WatchRest, WatchPR });
