// screens-main.jsx — Today's workout (hero, 3 variants) + Live lift screen

// ── 5/3/1 percentage schemes ────────────────────────────────
// Returns the three working sets for a given week. Top set is AMRAP except deload.
function setsForWeek(week) {
  if (week === 1) return [{ pct: 0.65, reps: 5 },  { pct: 0.75, reps: 5 },  { pct: 0.85, reps: 5,  amrap: true }];
  if (week === 2) return [{ pct: 0.70, reps: 3 },  { pct: 0.80, reps: 3 },  { pct: 0.90, reps: 3,  amrap: true }];
  if (week === 3) return [{ pct: 0.75, reps: 5 },  { pct: 0.85, reps: 3 },  { pct: 0.95, reps: 1,  amrap: true }];
  return                  [{ pct: 0.40, reps: 5 },  { pct: 0.50, reps: 5 },  { pct: 0.60, reps: 5 }];  // deload
}

const WEEK_LABEL = { 1: '5 / 5 / 5+', 2: '3 / 3 / 3+', 3: '5 / 3 / 1+', 4: 'deload' };

// Snap to nearest 5 (lbs) or 2.5 (kg)
function snapWeight(w, unit) {
  const step = unit === 'kg' ? 2.5 : 5;
  return Math.round(w / step) * step;
}

// Default warmups: 40% x 5, 50% x 5, 60% x 3
const WARMUPS = [
  { pct: 0.40, reps: 5 },
  { pct: 0.50, reps: 5 },
  { pct: 0.60, reps: 3 },
];

// Build the BBB sets (5 sets of 10 at 50% TM)
function bbbSets(pct = 0.5) {
  return Array(5).fill(null).map(() => ({ pct, reps: 10 }));
}

// ────────────────────────────────────────────────────────────
// TODAY SCREEN — 3 variants
// ────────────────────────────────────────────────────────────
function TodayScreen({ session, unit, heroVariant, plateVariant, onStartSet, onOpenWatch }) {
  if (heroVariant === 'cards')     return <TodayCards session={session} unit={unit} plateVariant={plateVariant} onStartSet={onStartSet} onOpenWatch={onOpenWatch} />;
  if (heroVariant === 'data')      return <TodayData session={session} unit={unit} plateVariant={plateVariant} onStartSet={onStartSet} onOpenWatch={onOpenWatch} />;
  return <TodayEditorial session={session} unit={unit} plateVariant={plateVariant} onStartSet={onStartSet} onOpenWatch={onOpenWatch} />;
}

// ─── Shared header bar ──────────────────────────────────────
function TodayHeader({ session, onOpenWatch, dark = false }) {
  const fg = dark ? 'rgba(250, 250, 245, 0.62)' : 'var(--ink-3)';
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '64px 24px 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          fontFamily: 'var(--display)',
          fontSize: 22,
          color: dark ? 'var(--paper)' : 'var(--ink)',
        }}>
          531<span style={{ color: 'var(--hot)' }}>.</span>
        </div>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: fg,
          letterSpacing: '0.1em',
        }}>
          c{session.cycle} · w{session.week} · d{session.day}
        </div>
      </div>
      <button onClick={onOpenWatch} style={{
        width: 36, height: 36, borderRadius: 999,
        border: 'none',
        background: dark ? 'rgba(250, 250, 245, 0.06)' : 'rgba(250, 250, 245, 0.06)',
        color: dark ? 'var(--paper)' : 'var(--ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="volume" size={16} />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT 1 — "Editorial" — magazine-cover style
// ═══════════════════════════════════════════════════════════
function TodayEditorial({ session, unit, plateVariant, onStartSet, onOpenWatch }) {
  const sets = setsForWeek(session.week);
  const tm = session.trainingMax[session.lift];
  const topWeight = snapWeight(tm * sets[2].pct, unit);
  const meta = LIFT_META[session.lift];

  return (
    <div style={{
      background: 'var(--bg-0)',
      minHeight: '100%',
      paddingBottom: 90,
    }}>
      <TodayHeader session={session} onOpenWatch={onOpenWatch} />

      {/* Date / week heading */}
      <div style={{ padding: '20px 28px 0' }}>
        <Eyebrow>{session.dateLabel} · week {session.week}, {WEEK_LABEL[session.week]}</Eyebrow>
      </div>

      {/* Hero lift name */}
      <div style={{ padding: '8px 28px 16px' }}>
        <h1 style={{
          fontFamily: 'var(--display)',
          fontWeight: 400,
          fontSize: 64,
          lineHeight: 0.95,
          letterSpacing: '-0.035em',
          margin: 0,
          color: 'var(--ink-0)',
        }}>
          {meta.label.split(' ')[0]}<br/>
          <span style={{ color: 'var(--hot)' }}>
            {meta.label.split(' ').slice(1).join(' ') || 'day'}
          </span>
        </h1>
      </div>

      {/* Plate viz for top set */}
      <div style={{
        margin: '0 28px 24px',
        padding: '20px',
        background: 'var(--bg-1)',
        borderRadius: 'var(--r-md)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <Caps>Top set</Caps>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <BigWeight weight={topWeight} unit={unit} size={48} />
              <span style={{
                fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 18,
                color: 'var(--ink-2)',
                marginLeft: 8,
              }}>×{sets[2].reps}{sets[2].amrap ? '+' : ''}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Caps>%TM</Caps>
            <div className="weight-num" style={{ fontSize: 24, color: 'var(--hot)', marginTop: 4 }}>
              {Math.round(sets[2].pct * 100)}%
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <PlateBar weight={topWeight} unit={unit} variant={plateVariant} />
        </div>
      </div>

      {/* Set list */}
      <div style={{ padding: '0 28px' }}>
        <Caps style={{ marginBottom: 12 }}>Working sets</Caps>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sets.map((s, i) => {
            const w = snapWeight(tm * s.pct, unit);
            return (
              <SetRow
                key={i}
                index={i + 1}
                weight={w}
                reps={s.reps}
                amrap={s.amrap}
                pct={s.pct}
                unit={unit}
                done={i < session.completedSets}
                next={i === session.completedSets}
                onClick={() => onStartSet(i)}
              />
            );
          })}
        </div>

        {/* BBB section */}
        <div style={{ marginTop: 32 }}>
          <Caps style={{ marginBottom: 8 }}>Boring but big · 5 × 10 @ 50%</Caps>
          <Card variant="bright" padding={16}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 18, color: 'var(--ink-0)' }}>
                  {meta.label.toLowerCase()}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>
                  5 × 10 @ {snapWeight(tm * 0.5, unit)} {unit}
                </div>
              </div>
              <PressButton size="sm" variant="ghost">Begin</PressButton>
            </div>
          </Card>
        </div>

        {/* Assistance */}
        <div style={{ marginTop: 24 }}>
          <Caps style={{ marginBottom: 8 }}>Assistance · 50–100 reps each</Caps>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {session.assistance.map((a, i) => (
              <AssistanceRow key={i} item={a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT 2 — "Card stack" — modern app, big cards per set
// ═══════════════════════════════════════════════════════════
function TodayCards({ session, unit, plateVariant, onStartSet, onOpenWatch }) {
  const sets = setsForWeek(session.week);
  const tm = session.trainingMax[session.lift];
  const meta = LIFT_META[session.lift];

  return (
    <div style={{
      background: 'var(--bg-0)',
      minHeight: '100%',
      paddingBottom: 90,
    }}>
      <TodayHeader session={session} onOpenWatch={onOpenWatch} />

      <div style={{ padding: '24px 24px 0' }}>
        <Eyebrow>{session.dateLabel}</Eyebrow>
        <h1 style={{
          fontFamily: 'var(--display)',
          fontWeight: 400,
          fontSize: 36,
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
          margin: '4px 0 6px',
          color: 'var(--ink-0)',
        }}>
          {meta.label} · <span style={{ color: 'var(--hot)' }}>week {session.week}</span>
        </h1>
        <Eyebrow style={{ fontSize: 13 }}>{WEEK_LABEL[session.week]} · top set is AMRAP</Eyebrow>
      </div>

      {/* Progress strip */}
      <div style={{ padding: '20px 24px 16px', display: 'flex', gap: 6 }}>
        {sets.map((s, i) => (
          <div key={i} style={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            background: i < session.completedSets ? 'var(--ink)' : 'rgba(250, 250, 245, 0.1)',
          }} />
        ))}
        <div style={{ marginLeft: 8, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)' }}>
          {session.completedSets}/{sets.length}
        </div>
      </div>

      {/* Set cards stack */}
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sets.map((s, i) => {
          const w = snapWeight(tm * s.pct, unit);
          const done = i < session.completedSets;
          const next = i === session.completedSets;
          return (
            <SetCard
              key={i}
              index={i + 1}
              weight={w}
              reps={s.reps}
              amrap={s.amrap}
              pct={s.pct}
              unit={unit}
              done={done}
              next={next}
              plateVariant={plateVariant}
              onClick={() => onStartSet(i)}
            />
          );
        })}
      </div>

      {/* BBB */}
      <div style={{ padding: '24px 24px 0' }}>
        <BBBCollapsedRow tm={tm} lift={session.lift} unit={unit} />
      </div>

      {/* Assistance */}
      <div style={{ padding: '16px 24px 0' }}>
        <Caps style={{ marginBottom: 8 }}>Assistance</Caps>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {session.assistance.map((a, i) => (
            <AssistanceRow key={i} item={a} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SetCard({ index, weight, reps, amrap, pct, unit, done, next, plateVariant, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: next ? 'var(--hot)' : 'var(--bg-1)',
      color: 'var(--ink-0)',
      border: next ? 'none' : '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      padding: 18,
      cursor: 'pointer',
      transition: 'all var(--dur) var(--ease)',
      opacity: done ? 0.55 : 1,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
              color: next ? 'rgba(250, 250, 245, 0.62)' : 'var(--muted)',
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>SET {index}</span>
            <span style={{
              fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11,
              color: next ? 'rgba(250, 250, 245, 0.55)' : 'var(--muted)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>{Math.round(pct * 100)}% TM</span>
            {amrap && (
              <span style={{
                marginLeft: 'auto',
                padding: '2px 10px',
                borderRadius: 999,
                background: next ? 'rgba(255, 255, 255, 0.22)' : 'var(--hot-soft)',
                color: next ? 'var(--ink-0)' : 'var(--hot)',
                fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.06em',
              }}>AMRAP</span>
            )}
            {done && !amrap && (
              <span style={{ marginLeft: 'auto', color: 'var(--lime)', display: 'flex' }}>
                <Icon name="check" size={18} stroke={2} />
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'nowrap' }}>
            <span className="weight-num" style={{
              fontSize: 40, lineHeight: 0.9,
              color: 'var(--ink-0)',
            }}>{weight}</span>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: next ? 'rgba(250, 250, 245, 0.72)' : 'var(--ink-2)',
            }}>{unit}</span>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 500,
              letterSpacing: '-0.02em',
              marginLeft: 6,
              color: next ? 'rgba(250, 250, 245, 0.85)' : 'var(--ink-1)',
              whiteSpace: 'nowrap',
            }}>× {reps}{amrap ? '+' : ''}</span>
          </div>
        </div>
      </div>

      {/* Mini plate viz on the "next" card */}
      {next && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(251,248,241,0.12)' }}>
          <div style={{ filter: 'brightness(1.4)' }}>
            <PlateBar weight={weight} unit={unit} variant={plateVariant === 'numerical' ? 'numerical' : plateVariant} mini />
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// VARIANT 3 — "Data" — dense, tabular, info-rich
// ═══════════════════════════════════════════════════════════
function TodayData({ session, unit, plateVariant, onStartSet, onOpenWatch }) {
  const sets = setsForWeek(session.week);
  const tm = session.trainingMax[session.lift];
  const meta = LIFT_META[session.lift];
  const lastPR = session.history?.[session.lift]?.bestE1RM || 0;

  return (
    <div style={{
      background: 'var(--bg-0)',
      minHeight: '100%',
      paddingBottom: 90,
    }}>
      <TodayHeader session={session} onOpenWatch={onOpenWatch} />

      <div style={{ padding: '20px 22px 16px' }}>
        <Eyebrow style={{ fontSize: 13 }}>{session.dateLabel}</Eyebrow>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginTop: 2 }}>
          <h1 style={{
            fontFamily: 'var(--display)',
            fontWeight: 400,
            fontSize: 30,
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            margin: 0,
            color: 'var(--ink-0)',
            whiteSpace: 'nowrap',
            flex: '0 1 auto',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {meta.label}
          </h1>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <Caps>Training max</Caps>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2, justifyContent: 'flex-end' }}>
              <span className="weight-num" style={{ fontSize: 24, color: 'var(--ink-0)' }}>{tm}</span>
              <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: 'var(--ink-2)' }}>{unit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{
        margin: '0 22px 16px',
        padding: '12px 16px',
        background: '#050505',
        color: 'var(--ink-0)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-md)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
      }}>
        <DataStat label="Cycle" value={session.cycle} sub={`week ${session.week}`} />
        <DataStat label="Scheme" value={WEEK_LABEL[session.week]} sub="3 sets" mono />
        <DataStat label="Est. PR" value={`${lastPR || '—'}`} sub={`1RM ${unit}`} mono />
      </div>

      {/* Working sets table */}
      <div style={{ padding: '8px 22px 0' }}>
        <Caps style={{ marginBottom: 8 }}>Working sets</Caps>
        <div style={{
          background: 'var(--bg-1)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '32px 56px 1fr 1fr 1fr',
            padding: '10px 14px',
            borderBottom: '1px solid var(--line)',
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--ink-2)',
          }}>
            <span>SET</span>
            <span>%TM</span>
            <span>WEIGHT</span>
            <span>REPS</span>
            <span style={{ textAlign: 'right' }}>STATE</span>
          </div>
          {sets.map((s, i) => {
            const w = snapWeight(tm * s.pct, unit);
            const done = i < session.completedSets;
            const next = i === session.completedSets;
            return (
              <div key={i} onClick={() => onStartSet(i)} style={{
                display: 'grid',
                gridTemplateColumns: '32px 56px 1fr 1fr 1fr',
                padding: '14px 14px',
                cursor: 'pointer',
                borderBottom: i < sets.length - 1 ? '1px solid var(--line)' : 'none',
                alignItems: 'center',
                background: next ? 'var(--hot-soft)' : 'transparent',
                opacity: done ? 0.5 : 1,
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: 'var(--ink-0)' }}>{i + 1}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-1)' }}>{Math.round(s.pct * 100)}%</span>
                <span className="weight-num" style={{ fontSize: 17, color: 'var(--ink-0)' }}>{w}</span>
                <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 16, color: 'var(--ink-0)' }}>
                  {s.reps}{s.amrap ? '+' : ''}
                </span>
                <span style={{ textAlign: 'right' }}>
                  {done ? (
                    <Icon name="check" size={16} color="var(--lime)" stroke={2.2} />
                  ) : next ? (
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--hot)' }}>NEXT →</span>
                  ) : (
                    <Icon name="dot" size={14} color="var(--line)" />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Plate viz panel under table */}
        <Card variant="bright" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Caps>Next set · plate setup</Caps>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-1)' }}>
              bar {unit === 'kg' ? BAR_KG : BAR_LBS} {unit}
            </span>
          </div>
          <PlateBar
            weight={snapWeight(tm * sets[session.completedSets]?.pct || tm * sets[0].pct, unit)}
            unit={unit}
            variant={plateVariant}
          />
        </Card>
      </div>

      {/* BBB */}
      <div style={{ padding: '20px 22px 0' }}>
        <BBBCollapsedRow tm={tm} lift={session.lift} unit={unit} />
      </div>

      {/* Assistance */}
      <div style={{ padding: '16px 22px 0' }}>
        <Caps style={{ marginBottom: 8 }}>Assistance</Caps>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {session.assistance.map((a, i) => (
            <AssistanceRow key={i} item={a} compact />
          ))}
        </div>
      </div>
    </div>
  );
}

function DataStat({ label, value, sub, mono }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'rgba(250, 250, 245, 0.5)', marginBottom: 4,
      }}>{label}</div>
      <div className={mono ? 'weight-num' : ''} style={{
        fontFamily: 'var(--display)',
        fontSize: 18, fontWeight: 600,
        color: 'var(--ink-0)',
        lineHeight: 1.1,
      }}>{value}</div>
      <div style={{
        fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11, color: 'rgba(250, 250, 245, 0.45)', marginTop: 1,
      }}>{sub}</div>
    </div>
  );
}

// ─── Shared set row + assistance row ────────────────────────
function SetRow({ index, weight, reps, amrap, pct, unit, done, next, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex',
      alignItems: 'center',
      padding: '14px 0',
      borderBottom: '1px solid var(--line)',
      cursor: 'pointer',
      opacity: done ? 0.5 : 1,
      position: 'relative',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 999,
        background: done ? 'var(--lime)' : next ? 'var(--hot)' : 'transparent',
        border: !done && !next ? '1.5px solid var(--line-strong)' : 'none',
        color: done ? 'var(--bg-0)' : next ? 'var(--ink-0)' : 'var(--ink-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
        marginRight: 14, flexShrink: 0,
      }}>
        {done ? <Icon name="check" size={14} stroke={2.4} /> : index}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="weight-num" style={{ fontSize: 22, color: 'var(--ink-0)' }}>{weight}</span>
          <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 14, color: 'var(--ink-2)' }}>{unit}</span>
          <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 18, color: 'var(--ink-1)' }}>
            × {reps}{amrap ? '+' : ''}
          </span>
          {amrap && (
            <span style={{
              padding: '1px 8px',
              borderRadius: 999,
              background: 'var(--hot-soft)',
              color: 'var(--hot)',
              fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.08em',
              marginLeft: 4,
            }}>AMRAP</span>
          )}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)', marginTop: 2 }}>
          {Math.round(pct * 100)}% · set {index}
        </div>
      </div>
      {next && <Icon name="chevron-right" size={20} color="var(--ink-3)" />}
    </div>
  );
}

function AssistanceRow({ item, compact = false }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: compact ? '8px 14px' : '12px 16px',
      background: 'var(--bg-1)',
      borderRadius: 'var(--r-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 8, height: 8, borderRadius: 2,
          background: ASSISTANCE_COLOR[item.category] || 'var(--ink-3)',
        }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-0)' }}>{item.name}</div>
          {!compact && (
            <div style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12, color: 'var(--ink-2)' }}>
              {item.category}
            </div>
          )}
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-1)',
      }}>
        {item.sets}×{item.reps}
      </div>
    </div>
  );
}

const ASSISTANCE_COLOR = {
  push: 'var(--hot)',
  pull: 'var(--slate)',
  legs: 'var(--lime)',
  core: 'var(--amber)',
};

function BBBCollapsedRow({ tm, lift, unit }) {
  const w = snapWeight(tm * 0.5, unit);
  return (
    <div>
      <Caps style={{ marginBottom: 8 }}>Boring but big</Caps>
      <Card variant="bright" padding={16}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 18, color: 'var(--ink-0)', lineHeight: 1 }}>
              5 sets of 10
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
              <span className="weight-num" style={{ fontSize: 22, color: 'var(--ink-0)' }}>{w}</span>
              <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: 'var(--ink-2)' }}>{unit} · 50% TM</span>
            </div>
          </div>
          <PressButton size="sm" variant="ghost">Begin</PressButton>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// LIVE LIFT SCREEN — active set with plate calc, AMRAP, timer
// ════════════════════════════════════════════════════════════
function LiveScreen({ session, unit, plateVariant, setIndex, onComplete, onClose, onPRDetected }) {
  const sets = setsForWeek(session.week);
  const tm = session.trainingMax[session.lift];
  const s = sets[setIndex];
  const weight = snapWeight(tm * s.pct, unit);
  const meta = LIFT_META[session.lift];

  const [phase, setPhase] = React.useState('ready');  // ready | done | rest
  const [reps, setReps] = React.useState(s.reps);
  const [restSeconds, setRestSeconds] = React.useState(0);
  const [restTarget] = React.useState(120);

  // Rest timer countdown
  React.useEffect(() => {
    if (phase !== 'rest') return;
    const t = setInterval(() => setRestSeconds((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Predicted 1RM from this AMRAP
  const predictedE1RM = s.amrap && reps > 0 ? Math.round(weight * (1 + reps / 30)) : 0;
  const prevE1RM = session.history?.[session.lift]?.bestE1RM || 0;
  const isPR = predictedE1RM > prevE1RM && s.amrap;

  const handleComplete = () => {
    if (isPR && phase === 'ready') {
      onPRDetected?.({ weight, reps, e1RM: predictedE1RM, lift: session.lift });
    }
    setPhase('rest');
  };

  const handleNext = () => {
    onComplete?.({ setIndex, reps, weight });
  };

  if (phase === 'rest') {
    return (
      <RestPhase
        unit={unit}
        weight={weight}
        reps={reps}
        amrap={s.amrap}
        elapsed={restSeconds}
        target={restTarget}
        nextSet={sets[setIndex + 1]}
        nextWeight={sets[setIndex + 1] ? snapWeight(tm * sets[setIndex + 1].pct, unit) : null}
        plateVariant={plateVariant}
        predictedE1RM={predictedE1RM}
        isPR={isPR}
        onNext={handleNext}
      />
    );
  }

  return (
    <div style={{
      background: 'var(--night)',
      color: 'var(--ink-0)',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '64px 24px 28px',
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <button onClick={onClose} style={{
          border: 'none', background: 'rgba(250, 250, 245, 0.08)',
          color: 'var(--ink-0)', width: 36, height: 36, borderRadius: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="x" size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em',
            color: 'rgba(250, 250, 245, 0.5)', textTransform: 'uppercase',
          }}>SET {setIndex + 1} OF {sets.length}</span>
          {s.amrap && (
            <span style={{
              padding: '3px 10px',
              borderRadius: 999,
              background: 'var(--hot)',
              color: 'var(--ink-0)',
              fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.1em',
            }}>AMRAP</span>
          )}
        </div>
      </div>

      {/* Lift title (small) */}
      <Eyebrow style={{ color: 'rgba(250, 250, 245, 0.62)' }}>{meta.label.toLowerCase()} · {Math.round(s.pct * 100)}% TM</Eyebrow>

      {/* Big weight */}
      <div style={{ marginTop: 8, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span className="weight-num" style={{
            fontSize: 110,
            lineHeight: 0.85,
            color: 'var(--ink-0)',
            letterSpacing: '-0.05em',
          }}>{weight}</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 26, color: 'rgba(250, 250, 245, 0.62)' }}>{unit}</span>
            <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 22, color: 'var(--hot)', marginTop: 4 }}>×{s.reps}{s.amrap ? '+' : ''}</span>
          </div>
        </div>
      </div>

      {/* Plate viz */}
      <div style={{
        padding: 20,
        background: 'rgba(250, 250, 245, 0.04)',
        borderRadius: 'var(--r-md)',
        marginBottom: 20,
      }}>
        <div style={{ filter: 'brightness(1.6) contrast(0.95)' }}>
          <PlateBar weight={weight} unit={unit} variant={plateVariant} />
        </div>
      </div>

      {/* AMRAP rep counter */}
      {s.amrap && (
        <div style={{
          padding: 18,
          background: 'rgba(193, 61, 17, 0.12)',
          borderRadius: 'var(--r-md)',
          marginBottom: 20,
          border: '1px solid rgba(193, 61, 17, 0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Caps style={{ color: 'rgba(250, 250, 245, 0.62)' }}>How many reps?</Caps>
            <span style={{
              fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13,
              color: isPR ? 'var(--hot)' : 'rgba(250, 250, 245, 0.55)',
            }}>
              est. 1RM {predictedE1RM} {unit} {isPR && '· PR!'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <DarkStepper onClick={() => setReps(Math.max(0, reps - 1))}>−</DarkStepper>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span className="weight-num" style={{
                fontSize: 56,
                color: 'var(--ink-0)',
                letterSpacing: '-0.04em',
              }}>{reps}</span>
              <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 16, color: 'rgba(250, 250, 245, 0.5)', marginLeft: 6 }}>reps</span>
            </div>
            <DarkStepper onClick={() => setReps(reps + 1)}>+</DarkStepper>
          </div>
          <div style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: 'rgba(250, 250, 245, 0.5)', marginTop: 10, textAlign: 'center' }}>
            target was {s.reps}+ · go as long as form is good
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Done button */}
      <PressButton
        onClick={handleComplete}
        size="lg"
        variant="ember"
        style={{ width: '100%' }}
      >
        Set complete <Icon name="check" size={18} stroke={2.4} />
      </PressButton>
    </div>
  );
}

function DarkStepper({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 56, height: 56, borderRadius: 999,
      border: 'none',
      background: 'rgba(250, 250, 245, 0.1)',
      color: 'var(--ink-0)',
      fontSize: 28, fontWeight: 400,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>{children}</button>
  );
}

function RestPhase({ unit, weight, reps, amrap, elapsed, target, nextSet, nextWeight, plateVariant, predictedE1RM, isPR, onNext }) {
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const pct = Math.min(100, (elapsed / target) * 100);
  const overdue = elapsed > target;

  return (
    <div style={{
      background: 'var(--night)',
      color: 'var(--ink-0)',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '64px 24px 28px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {isPR && <PRConfetti />}

      <Eyebrow style={{ color: 'rgba(250, 250, 245, 0.62)' }}>
        {isPR ? 'a new personal record' : 'logged · rest now'}
      </Eyebrow>

      <h1 style={{
        fontFamily: 'var(--display)',
        fontWeight: 400,
        fontSize: 56,
        lineHeight: 1.0,
        letterSpacing: '-0.025em',
        margin: '4px 0 28px',
        color: isPR ? 'var(--hot)' : 'var(--paper)',
      }}>
        {isPR ? 'Stronger.' : 'Breathe.'}
      </h1>

      {/* Logged stats */}
      <div style={{
        padding: 18,
        background: 'rgba(250, 250, 245, 0.04)',
        borderRadius: 'var(--r-md)',
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <Caps style={{ color: 'rgba(250, 250, 245, 0.5)' }}>Logged</Caps>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span className="weight-num" style={{ fontSize: 32, color: 'var(--ink-0)' }}>{weight}</span>
            <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 18, color: 'rgba(250, 250, 245, 0.62)' }}>× {reps}</span>
          </div>
        </div>
        {amrap && (
          <div style={{ textAlign: 'right' }}>
            <Caps style={{ color: 'rgba(250, 250, 245, 0.5)' }}>Est. 1RM</Caps>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4, justifyContent: 'flex-end' }}>
              <span className="weight-num" style={{ fontSize: 26, color: isPR ? 'var(--hot)' : 'var(--paper)' }}>{predictedE1RM}</span>
              <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 14, color: 'rgba(250, 250, 245, 0.55)' }}>{unit}</span>
            </div>
          </div>
        )}
      </div>

      {/* Big timer */}
      <div style={{
        padding: '32px 20px',
        background: 'rgba(250, 250, 245, 0.04)',
        borderRadius: 'var(--r-md)',
        marginBottom: 20,
        textAlign: 'center',
      }}>
        <Caps style={{ color: 'rgba(250, 250, 245, 0.5)' }}>Rest timer</Caps>
        <div style={{
          fontFamily: 'var(--mono)', fontWeight: 500,
          fontSize: 84,
          letterSpacing: '-0.04em',
          marginTop: 8,
          color: overdue ? 'var(--hot)' : 'var(--paper)',
          lineHeight: 1,
        }}>{fmt(elapsed)}</div>
        <div style={{
          height: 3, background: 'rgba(250, 250, 245, 0.12)', borderRadius: 999,
          marginTop: 16, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: overdue ? 'var(--hot)' : 'var(--paper)',
            transition: 'width 1s linear',
          }} />
        </div>
        <div style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: 'rgba(250, 250, 245, 0.45)', marginTop: 12 }}>
          target {fmt(target)} {overdue ? '· go when ready' : ''}
        </div>
      </div>

      {/* Next set preview */}
      {nextSet && (
        <div style={{
          padding: 18,
          background: 'rgba(250, 250, 245, 0.04)',
          borderRadius: 'var(--r-md)',
          marginBottom: 20,
        }}>
          <Caps style={{ color: 'rgba(250, 250, 245, 0.5)', marginBottom: 8 }}>Up next · set</Caps>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="weight-num" style={{ fontSize: 28, color: 'var(--ink-0)' }}>{nextWeight}</span>
              <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 18, color: 'rgba(250, 250, 245, 0.55)' }}>
                × {nextSet.reps}{nextSet.amrap ? '+' : ''}
              </span>
              {nextSet.amrap && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'var(--hot)',
                  color: 'var(--ink-0)',
                  fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.08em',
                }}>AMRAP</span>
              )}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(250, 250, 245, 0.55)' }}>
              {Math.round(nextSet.pct * 100)}%
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <PressButton onClick={onNext} size="lg" variant="ember" style={{ width: '100%' }}>
        {nextSet ? 'Next set' : 'Workout complete'} <Icon name="arrow-right" size={16} />
      </PressButton>
    </div>
  );
}

Object.assign(window, {
  TodayScreen, LiveScreen, setsForWeek, snapWeight, bbbSets, WARMUPS, WEEK_LABEL,
});
