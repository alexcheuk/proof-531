// screens-progress.jsx — Cycle overview + History

// ════════════════════════════════════════════════════════════
// CYCLE OVERVIEW — 4-week grid showing all 16 sessions
// ════════════════════════════════════════════════════════════
function CycleScreen({ session, unit, history, onSelectDay }) {
  // Only show enabled lifts in the grid
  const lifts = session.enabledLifts || LIFT_ORDER;
  const cols = lifts.length;
  const totalSessions = cols * 4;
  return (
    <div style={{
      background: 'var(--bg-0)',
      minHeight: '100%',
      paddingBottom: 90,
    }}>
      <div style={{ padding: '64px 24px 0' }}>
        <Eyebrow style={{ whiteSpace: 'nowrap' }}>cycle in progress</Eyebrow>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
          <h1 style={{
            fontFamily: 'var(--display)',
            fontWeight: 400,
            fontSize: 44,
            lineHeight: 1.0,
            letterSpacing: '-0.025em',
            margin: 0,
            color: 'var(--ink-0)',
          }}>
            Cycle <span style={{ color: 'var(--hot)' }}>{session.cycle}</span>
          </h1>
          <div style={{ textAlign: 'right' }}>
            <Caps>progress</Caps>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 22, color: 'var(--ink-0)',
              letterSpacing: '-0.02em',
            }}>
              {session.completedSessions}<span style={{ color: 'var(--ink-2)' }}>/{totalSessions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress ring */}
      <div style={{ padding: '20px 24px' }}>
        <Card variant="ink">
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <ProgressRing
              progress={Math.min(1, session.completedSessions / totalSessions)}
              size={68}
              stroke={5}
              color="var(--hot)"
              track="rgba(251,248,241,0.12)"
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 18, lineHeight: 1.2 }}>
                Week {session.week} · day {session.day}
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'rgba(250, 250, 245, 0.55)', marginTop: 2 }}>
                {WEEK_LABEL[session.week]} · {session.completedSessions} sessions done
              </div>
            </div>
            <Icon name="trending-up" size={20} color="rgba(251,248,241,0.5)" />
          </div>
        </Card>
      </div>

      {/* Grid: rows are weeks, cols are lifts */}
      <div style={{ padding: '8px 24px 0' }}>
        <Caps style={{ marginBottom: 12 }}>4 weeks · {cols} {cols === 1 ? "lift" : "lifts"}</Caps>

        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `56px repeat(${cols}, 1fr)`,
          gap: 6,
          marginBottom: 8,
          paddingLeft: 4,
        }}>
          <div></div>
          {lifts.map((l) => (
            <div key={l} style={{
              fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--ink-2)', textAlign: 'center',
            }}>
              {l.slice(0, 4)}
            </div>
          ))}
        </div>

        {/* Rows: weeks */}
        {[1, 2, 3, 4].map((w) => (
          <div key={w} style={{
            display: 'grid',
            gridTemplateColumns: `56px repeat(${cols}, 1fr)`,
            gap: 6,
            marginBottom: 6,
          }}>
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              paddingLeft: 4,
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: 'var(--ink-0)' }}>
                W{w}
              </div>
              <div style={{
                fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10, color: 'var(--ink-2)', lineHeight: 1,
              }}>
                {w === 4 ? 'deload' : WEEK_LABEL[w]}
              </div>
            </div>
            {lifts.map((l, di) => {
              const isCurrent = w === session.week && di === session.day - 1;
              const isDone = (w < session.week) || (w === session.week && di < session.day - 1);
              const isDeload = w === 4;
              return (
                <CycleCell
                  key={l}
                  week={w}
                  lift={l}
                  current={isCurrent}
                  done={isDone}
                  deload={isDeload}
                  tm={session.trainingMax[l]}
                  unit={unit}
                  onClick={() => onSelectDay?.(w, di + 1, l)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Training maxes section */}
      <div style={{ padding: '32px 24px 0' }}>
        <Caps style={{ marginBottom: 12 }}>Training maxes</Caps>
        <Card variant="bright" padding={0}>
          {lifts.map((l, i) => {
            const tm = session.trainingMax[l];
            const next = tm + (l === 'press' || l === 'bench' ? 5 : 10);
            return (
              <div key={l} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: i < lifts.length - 1 ? '1px solid var(--line)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-0)' }}>
                    {LIFT_META[l].label}
                  </div>
                  <div style={{
                    fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12, color: 'var(--ink-2)', marginTop: 1,
                  }}>
                    next cycle · {next} {unit}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span className="weight-num" style={{ fontSize: 22, color: 'var(--ink-0)' }}>{tm}</span>
                  <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: 'var(--ink-2)' }}>{unit}</span>
                </div>
              </div>
            );
          })}
        </Card>
        <div style={{
          fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: 'var(--ink-2)', marginTop: 10, textAlign: 'center',
        }}>
          +5 {unit} upper body · +10 {unit} lower body, every cycle
        </div>
      </div>
    </div>
  );
}

function CycleCell({ week, lift, current, done, deload, tm, unit, onClick }) {
  const sets = setsForWeek(week);
  const topW = snapWeight(tm * sets[2].pct, unit);
  const bg = current ? 'var(--hot)'
          : done ? 'var(--bg-2)'
          : deload ? 'var(--amber-soft)'
          : 'var(--bg-1)';
  const color = 'var(--ink-0)';
  const subColor = current ? 'rgba(255, 255, 255, 0.78)'
                : done ? 'var(--ink-2)'
                : 'var(--ink-2)';
  return (
    <button onClick={onClick} style={{
      aspectRatio: '1',
      border: 'none',
      borderRadius: 'var(--r-sm)',
      background: bg,
      color,
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      textAlign: 'left',
      position: 'relative',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600,
        letterSpacing: '0.05em',
        color: subColor,
      }}>
        {Math.round(sets[2].pct * 100)}%
      </div>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700,
        lineHeight: 1, letterSpacing: '-0.03em',
      }}>{topW}</div>
      {done && (
        <div style={{ position: 'absolute', top: 6, right: 6 }}>
          <Icon name="check" size={11} stroke={2.4} color={subColor} />
        </div>
      )}
    </button>
  );
}

function ProgressRing({ progress, size = 60, stroke = 4, color = 'var(--hot)', track = 'rgba(0,0,0,0.1)' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - progress);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
                strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={off}
                style={{ transition: 'stroke-dashoffset 0.6s var(--ease)' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--mono)', fontSize: size * 0.22, fontWeight: 600,
        color: 'var(--ink-0)',
      }}>
        {Math.round(progress * 100)}<span style={{ fontSize: size * 0.13, marginLeft: 1, color: 'rgba(250, 250, 245, 0.62)' }}>%</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// HISTORY — past sessions list
// ════════════════════════════════════════════════════════════
function HistoryScreen({ history, unit, enabledLifts }) {
  const lifts = enabledLifts || LIFT_ORDER;  return (
    <div style={{
      background: 'var(--bg-0)',
      minHeight: '100%',
      paddingBottom: 90,
    }}>
      <div style={{ padding: '64px 24px 0' }}>
        <Eyebrow>your record</Eyebrow>
        <h1 style={{
          fontFamily: 'var(--display)',
          fontWeight: 400,
          fontSize: 44,
          lineHeight: 1.0,
          letterSpacing: '-0.025em',
          margin: '4px 0 0',
          color: 'var(--ink-0)',
        }}>
          <span style={{ color: 'var(--hot)' }}>History.</span>
        </h1>
      </div>

      {/* Filter pills */}
      <div style={{ padding: '20px 24px 8px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {['All', ...lifts.map((l) => LIFT_META[l].label.split(' ')[0]), 'PRs only'].map((f, i) => (
          <button key={f} style={{
            padding: '6px 14px',
            borderRadius: 999,
            border: i === 0 ? 'none' : '1px solid var(--line)',
            background: i === 0 ? 'var(--ink-0)' : 'transparent',
            color: i === 0 ? 'var(--bg-0)' : 'var(--ink-2)',
            fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>{f}</button>
        ))}
      </div>

      {/* PR strip */}
      <div style={{ padding: '12px 24px' }}>
        <Card variant="bright" padding={16}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <Caps>Personal records</Caps>
              <div style={{
                fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: 'var(--ink-2)', marginTop: 2,
              }}>estimated from your top AMRAP sets</div>
            </div>
            <Icon name="trophy" size={18} color="var(--hot)" stroke={1.4} />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${lifts.length}, 1fr)`,
            gap: 8,
          }}>
            {lifts.map((l) => {
              const pr = history.prs?.[l] || 0;
              return (
                <div key={l} style={{
                  padding: '10px 8px',
                  background: 'var(--bg-0)',
                  borderRadius: 'var(--r-sm)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--ink-2)',
                  }}>{l.slice(0, 4)}</div>
                  <div className="weight-num" style={{
                    fontSize: 20, color: 'var(--ink-0)',
                    letterSpacing: '-0.02em', marginTop: 2,
                  }}>{pr || '—'}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Session list grouped by recency */}
      <div style={{ padding: '16px 24px 0' }}>
        {history.sessions.map((sess, i) => (
          <HistorySessionRow key={i} sess={sess} unit={unit} />
        ))}
      </div>
    </div>
  );
}

function HistorySessionRow({ sess, unit }) {
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      padding: '14px 0',
      borderBottom: '1px solid var(--line)',
      alignItems: 'flex-start',
    }}>
      {/* Date column */}
      <div style={{ width: 44, flexShrink: 0 }}>
        <div style={{
          fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1,
        }}>{sess.month}</div>
        <div className="weight-num" style={{
          fontSize: 22, color: 'var(--ink-0)',
          letterSpacing: '-0.02em', lineHeight: 1, marginTop: 2,
        }}>{sess.day}</div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-0)' }}>{sess.lift}</div>
          {sess.pr && (
            <span style={{
              padding: '1px 7px', borderRadius: 999,
              background: 'var(--hot)', color: 'var(--ink-0)',
              fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.08em',
            }}>PR</span>
          )}
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)' }}>
            c{sess.cycle}w{sess.week}
          </span>
        </div>
        <div style={{
          fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: 'var(--ink-1)', marginTop: 4,
        }}>
          {sess.summary}
        </div>
        {sess.topSet && (
          <div style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: 'var(--ink-1)',
          }}>
            <span>top: <span style={{ color: 'var(--ink-0)', fontWeight: 600 }}>{sess.topSet.weight}</span> × {sess.topSet.reps}</span>
            <span style={{ color: 'var(--line)' }}>·</span>
            <span>e1RM <span style={{ color: sess.pr ? 'var(--hot)' : 'var(--ink)', fontWeight: 600 }}>{sess.topSet.e1RM}</span></span>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  CycleScreen, HistoryScreen, ProgressRing,
});
