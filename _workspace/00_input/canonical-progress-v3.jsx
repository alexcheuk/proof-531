// screens-progress-v3.jsx — V3 e-ink progress matrix
//
// A single-lift projection ledger.
//
//   rows    = cycles (C01..C(current+6))
//   cols    = days 1..4 in the cycle (= weeks 1..4 for that lift)
//   right   = expected training max for that cycle
//
// Past + completed cells are filled ink (weight × amreps).
// The most-recent completed cell is wrapped in a 2px ink outline.
// The current week's cell shows "NOW" with the prescribed weight.
// Future cells are dimmed mono — projected weight only.
// A horizontal goal rule lands in the grid at the cycle where the
// projected TM crosses the user's goal (TM or 1RM mode).

function ProgressScreenV3({ session, unit }) {
  const enabled = session.enabledLifts || LIFT_ORDER;
  const initialLift = enabled.includes(session.lift) ? session.lift : enabled[0];
  const [lift, setLift] = React.useState(initialLift);

  // Reset lift if the active set changes (e.g. demo stage swap).
  React.useEffect(() => {
    if (!enabled.includes(lift)) setLift(enabled[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled.join(',')]);

  const isLower      = lift === 'squat' || lift === 'deadlift';
  const tmStep       = isLower ? 10 : 5;
  const currentTM    = session.trainingMax[lift] || 0;
  const bestE1RM     = session.history?.[lift]?.bestE1RM || 0;
  const currentCycle = session.cycle;
  const currentWeek  = session.week;

  // ── Goal panel state ─────────────────────────────────────
  const [goalKind, setGoalKind] = React.useState('tm'); // 'tm' | '1rm'
  const goalDefault = React.useMemo(() => {
    const base = goalKind === 'tm' ? currentTM : Math.round(currentTM / 0.9);
    // Land the default goal roughly 4 cycles out so the goal rule
    // appears in the chart (which spans current..+6).
    const bump = isLower ? 40 : 20;
    return Math.ceil((base + bump) / 25) * 25;
  }, [goalKind, currentTM, isLower]);
  const [goal, setGoal] = React.useState(goalDefault);
  React.useEffect(() => { setGoal(goalDefault); }, [goalDefault]);

  // What TM does the goal correspond to?
  const targetTM = goalKind === 'tm' ? goal : Math.round((goal * 0.9) / 5) * 5;
  const cyclesToGoal = targetTM > currentTM ? Math.ceil((targetTM - currentTM) / tmStep) : 0;
  const goalCycle = cyclesToGoal > 0 ? currentCycle + cyclesToGoal : null;

  // ── Grid bounds & helpers ────────────────────────────────
  const startCycle = 1;
  const endCycle   = currentCycle + 6;

  const tmAt = (c) => Math.max(0, currentTM + (c - currentCycle) * tmStep);

  const SCHEME = [
    { pct: 0.85, reps: 5, amrap: true },
    { pct: 0.90, reps: 3, amrap: true },
    { pct: 0.95, reps: 1, amrap: true },
    { pct: 0.60, reps: 5, amrap: false },
  ];
  const DAY_LABEL = ['5+', '3+', '1+', 'del'];

  // Last completed (cycle, day) — outlined cell.
  const lastCompleted = currentWeek === 1
    ? (currentCycle > 1 ? { c: currentCycle - 1, d: 4 } : null)
    : { c: currentCycle, d: currentWeek - 1 };

  function cellFor(c, d) {
    const sch = SCHEME[d - 1];
    const tm = tmAt(c);
    const weight = snapWeight(tm * sch.pct, unit);
    let state;
    if (c < currentCycle)                                state = 'done';
    else if (c === currentCycle && d < currentWeek)      state = 'done';
    else if (c === currentCycle && d === currentWeek)    state = 'now';
    else                                                  state = 'future';

    let reps = sch.reps;
    if (sch.amrap && state === 'done') {
      const seed = (c * 13 + d * 7 + (isLower ? 1 : 0)) % 5;
      reps = sch.reps + Math.max(0, seed - 1);
    }

    const isLast = !!lastCompleted && c === lastCompleted.c && d === lastCompleted.d;
    return { state, weight, reps, amrap: sch.amrap, isLast };
  }

  const rows = [];
  for (let c = startCycle; c <= endCycle; c++) rows.push(c);

  // ── Render ──────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100%', paddingBottom: 60, position: 'relative', zIndex: 1 }}>
      {/* Masthead */}
      <div style={{
        padding: '54px 24px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline',
          fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--ink-0)', lineHeight: 1,
        }}>
          531<span style={{ color: 'var(--ink-3)' }}>.</span>
          <span style={{ marginLeft: 10, fontSize: 10, fontWeight: 500,
            letterSpacing: '0.22em', color: 'var(--ink-3)' }}>ledger</span>
        </div>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--ink-2)',
        }}>projection</div>
      </div>

      {/* Title block */}
      <div style={{ padding: '14px 24px 22px', borderBottom: '1px solid var(--line-strong)' }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--ink-2)', marginBottom: 8,
        }}>On the {longLiftName(lift)}</div>
        <h1 style={{
          fontFamily: 'var(--display)', fontWeight: 700,
          fontSize: 56, lineHeight: 0.92, letterSpacing: '-0.04em',
          margin: 0, color: 'var(--ink-0)',
        }}>Progress.</h1>
      </div>

      {/* Lift switcher */}
      <LiftTabsV3 enabled={enabled} value={lift} onChange={setLift} />

      {/* Stats triplet */}
      <StatsTripletV3
        currentTM={currentTM}
        bestE1RM={bestE1RM}
        cycle={currentCycle}
        unit={unit}
      />

      {/* Goal panel */}
      <GoalPanelV3
        goal={goal}
        goalKind={goalKind}
        onGoalKindChange={setGoalKind}
        onGoalChange={setGoal}
        cyclesToGoal={cyclesToGoal}
        currentTM={currentTM}
        tmStep={tmStep}
        unit={unit}
      />

      {/* The grid */}
      <ProgressGridV3
        rows={rows}
        currentCycle={currentCycle}
        endCycle={endCycle}
        tmAt={tmAt}
        cellFor={cellFor}
        unit={unit}
        dayLabels={DAY_LABEL}
        goalCycle={goalCycle}
        goal={goal}
        goalKind={goalKind}
        targetTM={targetTM}
      />

      {/* Footnote */}
      <div style={{
        padding: '28px 24px 0', textAlign: 'center',
        fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 500,
        letterSpacing: '0.32em', textTransform: 'uppercase',
        color: 'var(--ink-3)',
      }}>
        +{tmStep} per cycle · {isLower ? 'lower body' : 'upper body'}
      </div>
    </div>
  );
}


// ── Lift switcher ──────────────────────────────────────────
function LiftTabsV3({ enabled, value, onChange }) {
  if (enabled.length <= 1) return null;
  return (
    <div style={{ padding: '22px 24px 0' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${enabled.length}, 1fr)`,
        borderTop: '1px solid var(--line-strong)',
        borderBottom: '1px solid var(--line)',
      }}>
        {enabled.map((l, i) => {
          const on = l === value;
          return (
            <button key={l} onClick={() => onChange(l)} style={{
              border: 'none',
              borderLeft: i > 0 ? '1px solid var(--line)' : 'none',
              background: on ? 'var(--ink-0)' : 'transparent',
              color:      on ? 'var(--bg-0)'  : 'var(--ink-2)',
              padding: '12px 4px',
              fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: 'pointer',
              minHeight: 44,
            }}>{shortLiftName(l)}</button>
          );
        })}
      </div>
    </div>
  );
}


// ── Stats triplet (TM · best e1RM · cycle) ─────────────────
function StatsTripletV3({ currentTM, bestE1RM, cycle, unit }) {
  return (
    <div style={{
      padding: '0 24px',
      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
      borderBottom: '1px solid var(--line)',
    }}>
      {[
        { label: 'Training max', value: currentTM,                       suffix: unit },
        { label: 'Best e1rm',    value: bestE1RM > 0 ? bestE1RM : '—',   suffix: bestE1RM > 0 ? unit : null },
        { label: 'Cycle',        value: `C${String(cycle).padStart(2, '0')}`, suffix: null },
      ].map((c, i) => (
        <div key={c.label} style={{
          padding: '16px 0',
          borderLeft: i > 0 ? '1px solid var(--line)' : 'none',
          paddingLeft: i > 0 ? 14 : 0,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--ink-2)',
          }}>{c.label}</span>
          <span style={{
            fontFamily: 'var(--display)', fontWeight: 700,
            fontSize: 26, color: 'var(--ink-0)',
            letterSpacing: '-0.03em', lineHeight: 1,
          }}>
            {c.value}
            {c.suffix && (
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.18em', color: 'var(--ink-3)', marginLeft: 6,
              }}>{c.suffix}</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}


// ── Goal panel ─────────────────────────────────────────────
function GoalPanelV3({ goal, goalKind, onGoalKindChange, onGoalChange, cyclesToGoal, currentTM, tmStep, unit }) {
  const min = currentTM + tmStep;
  const dec = () => onGoalChange(Math.max(min, goal - 5));
  const inc = () => onGoalChange(goal + 5);

  const weeksApprox = cyclesToGoal * 4;
  // Quick guess at a calendar month estimate.
  const monthsApprox = Math.max(1, Math.round(weeksApprox / 4.3));

  return (
    <div style={{
      margin: '22px 16px 0',
      border: '1px solid var(--ink-0)',
    }}>
      {/* Toggle: TM goal | 1RM goal */}
      <div style={{ display: 'flex' }}>
        {[
          { v: 'tm',  l: 'Training max' },
          { v: '1rm', l: 'One-rep max' },
        ].map((it, i) => {
          const on = goalKind === it.v;
          return (
            <button key={it.v} onClick={() => onGoalKindChange(it.v)} style={{
              flex: 1,
              border: 'none',
              borderLeft:   i > 0 ? '1px solid var(--ink-0)' : 'none',
              borderBottom: '1px solid var(--ink-0)',
              background: on ? 'var(--ink-0)' : 'transparent',
              color:      on ? 'var(--bg-0)'  : 'var(--ink-2)',
              padding: '10px 8px',
              fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}>Goal · {it.l}</button>
          );
        })}
      </div>

      {/* Stepper */}
      <div style={{
        padding: '18px 16px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={dec} style={stepBtnStyle}>−</button>
        <div style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
          <span style={{
            fontFamily: 'var(--display)', fontWeight: 700,
            fontSize: 56, color: 'var(--ink-0)',
            letterSpacing: '-0.045em', lineHeight: 1,
          }}>{goal}</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--ink-2)', marginLeft: 10,
          }}>{unit}</span>
        </div>
        <button onClick={inc} style={stepBtnStyle}>+</button>
      </div>

      {/* Outcome strip */}
      <div style={{
        padding: '11px 16px',
        borderTop: '1px solid var(--line-strong)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--ink-0)',
        }}>
          {cyclesToGoal > 0
            ? `~${cyclesToGoal} cycle${cyclesToGoal === 1 ? '' : 's'} away`
            : 'already past goal'}
        </span>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--ink-3)',
        }}>
          {cyclesToGoal > 0 ? `≈ ${weeksApprox} weeks · ${monthsApprox}mo` : ''}
        </span>
      </div>
    </div>
  );
}

const stepBtnStyle = {
  width: 44, height: 44,
  border: '1px solid var(--ink-0)',
  background: 'var(--bg-0)',
  color: 'var(--ink-0)',
  fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700,
  cursor: 'pointer',
  lineHeight: 1,
};


// ── The grid ───────────────────────────────────────────────
function ProgressGridV3({ rows, currentCycle, endCycle, tmAt, cellFor, unit, dayLabels, goalCycle, goal, goalKind, targetTM }) {
  const COLS = 'minmax(34px, auto) 1fr 1fr 1fr 1fr minmax(54px, auto)';

  return (
    <div style={{ padding: '24px 16px 0' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 10,
      }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--ink-2)',
        }}>Cycle matrix</span>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 500,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--ink-3)',
        }}>weight · amreps · {unit}</span>
      </div>

      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: COLS,
        borderTop: '1px solid var(--ink-0)',
        borderBottom: '1px solid var(--ink-0)',
      }}>
        <div style={headerCellStyle} />
        {dayLabels.map((d, i) => (
          <div key={i} style={{
            ...headerCellStyle,
            borderLeft: '1px solid var(--line)',
          }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--ink-0)',
            }}>D{i + 1}</span>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 500,
              letterSpacing: '0.18em', color: 'var(--ink-3)', textTransform: 'uppercase',
            }}>{d}</span>
          </div>
        ))}
        <div style={{
          ...headerCellStyle,
          borderLeft: '1px solid var(--ink-0)',
        }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--ink-0)',
          }}>→ TM</span>
        </div>
      </div>

      {/* Body */}
      {rows.map((c) => {
        const isCurrent = c === currentCycle;
        const placeGoalBefore = goalCycle != null && c === goalCycle;
        return (
          <React.Fragment key={c}>
            {placeGoalBefore && <GoalRuleV3 goal={goal} goalKind={goalKind} targetTM={targetTM} unit={unit} cols={COLS} />}
            <div style={{
              display: 'grid', gridTemplateColumns: COLS,
              borderBottom: '1px solid var(--line)',
              background: isCurrent ? 'rgba(26, 24, 18, 0.04)' : 'transparent',
            }}>
              {/* Cycle label */}
              <div style={{
                padding: '0 8px',
                minHeight: 64,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRight: '1px solid var(--ink-0)',
                background: isCurrent ? 'var(--ink-0)' : 'transparent',
              }}>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: isCurrent ? 'var(--bg-0)'
                       : c < currentCycle ? 'var(--ink-0)'
                       : 'var(--ink-3)',
                }}>C{String(c).padStart(2, '0')}</span>
              </div>

              {/* Day cells */}
              {[1, 2, 3, 4].map((d) => (
                <DayCellV3 key={d} cell={cellFor(c, d)} />
              ))}

              {/* TM right cell */}
              <TMCellV3 c={c} currentCycle={currentCycle} tm={tmAt(c)} unit={unit} />
            </div>
          </React.Fragment>
        );
      })}

      {/* Beyond-chart marker — if the goal lies past the last rendered cycle. */}
      {goalCycle != null && goalCycle > endCycle && (
        <div style={{
          display: 'grid', gridTemplateColumns: COLS,
          borderTop: '1px dashed var(--ink-0)',
        }}>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px' }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'var(--ink-2)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ↓ Goal · {goalCycle - currentCycle} cycles beyond chart
            </span>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--ink-3)',
            }}>{goal}{unit}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const headerCellStyle = {
  padding: '8px 6px',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  gap: 2, minHeight: 36,
};


// ── Day cell ───────────────────────────────────────────────
function DayCellV3({ cell }) {
  const { state, weight, reps, isLast } = cell;
  const done   = state === 'done';
  const now    = state === 'now';
  const future = state === 'future';

  const bg = done ? 'var(--ink-0)' : 'transparent';
  const fg = done ? 'var(--bg-0)'  : 'var(--ink-0)';

  return (
    <div style={{
      position: 'relative',
      borderLeft: '1px solid var(--line)',
      background: bg,
      minHeight: 64,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 3, padding: '6px 2px',
      ...(isLast ? {
        outline: '2px solid var(--ink-0)',
        outlineOffset: '-2px',
        zIndex: 2,
      } : {}),
    }}>
      {done && (
        <>
          <span style={{
            fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17,
            color: fg, letterSpacing: '-0.03em', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>{weight}</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600,
            color: fg, letterSpacing: '0.04em', opacity: 0.78,
          }}>× {reps}</span>
        </>
      )}
      {now && (
        <>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700,
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: 'var(--ink-2)',
          }}>now</span>
          <span style={{
            fontFamily: 'var(--display)', fontWeight: 600, fontSize: 15,
            color: 'var(--ink-0)', letterSpacing: '-0.025em', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>{weight}</span>
        </>
      )}
      {future && (
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500,
          color: 'var(--ink-3)', letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}>{weight}</span>
      )}
    </div>
  );
}


// ── TM right cell ──────────────────────────────────────────
function TMCellV3({ c, currentCycle, tm, unit }) {
  const isCurrent = c === currentCycle;
  const isPast    = c < currentCycle;
  const weight = isCurrent ? 700 : 600;
  const color  = isCurrent ? 'var(--ink-0)'
               : isPast    ? 'var(--ink-1)'
               :             'var(--ink-3)';

  return (
    <div style={{
      minHeight: 64,
      borderLeft: '1px solid var(--ink-0)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 2, padding: '6px 4px',
      background: isCurrent ? 'var(--bg-2)' : 'transparent',
    }}>
      <span style={{
        fontFamily: 'var(--display)', fontWeight: weight, fontSize: 18,
        color, letterSpacing: '-0.03em', lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>{tm}</span>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 600,
        color: 'var(--ink-3)', letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>{unit}</span>
    </div>
  );
}


// ── Goal rule (horizontal line dropped into the grid) ──────
function GoalRuleV3({ goal, goalKind, targetTM, unit, cols }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: cols,
      borderTop:    '2px solid var(--ink-0)',
      borderBottom: '1px solid var(--ink-0)',
      background: 'var(--bg-2)',
    }}>
      {/* Spans across all columns visually but we keep grid structure for alignment. */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px' }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--ink-0)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ display: 'inline-block', width: 14, height: 1, background: 'var(--ink-0)' }} />
          Goal · {goalKind === 'tm' ? 'training max' : '1rm'} {goal}{unit}
        </span>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 500,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--ink-2)',
        }}>
          {goalKind === '1rm' ? `tm ≈ ${targetTM}${unit}` : ''}
        </span>
      </div>
    </div>
  );
}


// ── Helpers ────────────────────────────────────────────────
function longLiftName(l) {
  return l === 'deadlift' ? 'deadlift'
       : l === 'press'    ? 'overhead press'
       : l === 'bench'    ? 'bench press'
       :                    'back squat';
}

Object.assign(window, { ProgressScreenV3 });
