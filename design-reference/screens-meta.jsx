// screens-meta.jsx — Exercise Library + Settings + Home dashboard

// ════════════════════════════════════════════════════════════
// HOME DASHBOARD — free-pick lift selector
// ════════════════════════════════════════════════════════════
function HomeScreen({ session, unit, onPickLift, onOpenLibrary, onOpenWatch }) {
  const enabled = session.enabledLifts || LIFT_ORDER;
  const sets = setsForWeek(session.week);
  const topPct = sets[2].pct;
  const single = enabled.length === 1;

  return (
    <div style={{
      background: 'var(--bg-0)',
      minHeight: '100%',
      paddingBottom: 90,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '64px 24px 0',
      }}>
        <div style={{
          fontFamily: 'var(--display)', fontWeight: 600, fontSize: 22,
          letterSpacing: '-0.02em',
        }}>
          531<span style={{ color: 'var(--hot)' }}>.</span>
        </div>
        <button onClick={onOpenWatch} style={{
          width: 36, height: 36, borderRadius: 999,
          border: 'none', background: 'rgba(250, 250, 245, 0.06)',
          color: 'var(--ink-0)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="volume" size={16} />
        </button>
      </div>

      {/* Greeting + cycle status row */}
      <div style={{ padding: '24px 24px 0' }}>
        <Eyebrow>{session.greeting}</Eyebrow>
        <h1 style={{
          fontFamily: 'var(--display)',
          fontWeight: 600,
          fontSize: 40,
          lineHeight: 0.98,
          letterSpacing: '-0.03em',
          margin: '4px 0 0',
          color: 'var(--ink-0)',
        }}>
          Pick a lift.<br/>
          <span style={{ color: 'var(--hot)' }}>Press start.</span>
        </h1>

        {/* Cycle status pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          marginTop: 18,
          padding: '6px 12px 6px 8px',
          background: 'var(--bg-1)',
          border: '1px solid var(--line)',
          borderRadius: 999,
        }}>
          <span style={{
            padding: '3px 8px',
            background: 'var(--hot)',
            color: 'var(--ink-0)',
            borderRadius: 999,
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.1em',
          }}>C{session.cycle} · W{session.week}</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 11,
            color: 'var(--ink-1)', letterSpacing: '0.05em',
          }}>
            week {session.week} scheme · {WEEK_LABEL[session.week]}
          </span>
        </div>
      </div>

      {/* Lift picker grid */}
      <div style={{ padding: '20px 24px 0' }}>
        <Caps style={{ marginBottom: 10 }}>Your lifts · tap to start</Caps>
        <div style={{
          display: 'grid',
          gridTemplateColumns: single ? '1fr' : 'repeat(2, 1fr)',
          gap: 10,
        }}>
          {enabled.map((l) => {
            const tm = session.trainingMax[l] || 0;
            const topW = snapWeight(tm * topPct, unit);
            const last = session.lastSession?.[l];
            return (
              <LiftPickerCard
                key={l}
                lift={l}
                topWeight={topW}
                topReps={sets[2].reps}
                amrap={sets[2].amrap}
                pct={topPct}
                unit={unit}
                last={last}
                bestE1RM={session.history?.[l]?.bestE1RM}
                large={single}
                onClick={() => onPickLift?.(l)}
              />
            );
          })}
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Card variant="bright" padding={16}>
            <Caps>This cycle</Caps>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
              <span className="weight-num" style={{ fontSize: 28, color: 'var(--ink-0)', letterSpacing: '-0.02em' }}>{session.completedSessions}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: 2 }}>/ {enabled.length * 4}</span>
            </div>
            <div style={{
              height: 3, background: 'var(--line)', borderRadius: 999,
              marginTop: 8, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, session.completedSessions / (enabled.length * 4) * 100)}%`,
                background: 'var(--hot)',
              }} />
            </div>
          </Card>
          <Card variant="bright" padding={16}>
            <Caps>Active lifts</Caps>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
              <span className="weight-num" style={{ fontSize: 28, color: 'var(--ink-0)', letterSpacing: '-0.02em' }}>{enabled.length}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: 2 }}>/ 4</span>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
              {LIFT_ORDER.map((l) => (
                <div key={l} style={{
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600,
                  letterSpacing: '0.08em',
                  background: enabled.includes(l) ? 'var(--bg-3)' : 'transparent',
                  border: enabled.includes(l) ? 'none' : '1px solid var(--line)',
                  color: enabled.includes(l) ? 'var(--ink-0)' : 'var(--ink-3)',
                  textTransform: 'uppercase',
                }}>{l.slice(0, 3)}</div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent notice — only if there's last cycle progression */}
      {session.cycle > 1 && (
        <div style={{ padding: '12px 24px 0' }}>
          <Card variant="ember" padding={16}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 999,
                background: 'rgba(250, 250, 245, 0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name="sparkle" size={16} color="var(--ink-0)" stroke={1.6} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-0)' }}>+10 deadlift training max</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'rgba(250, 250, 245, 0.75)', marginTop: 2, letterSpacing: '0.02em' }}>
                  cycle {session.cycle - 1} cleared — keep going.
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Single lift card on home picker ────────────────────────
function LiftPickerCard({ lift, topWeight, topReps, amrap, pct, unit, last, bestE1RM, large, onClick }) {
  const meta = LIFT_META[lift];
  return (
    <button onClick={onClick} style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      padding: large ? 22 : 16,
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all var(--dur) var(--ease)',
      display: 'flex',
      flexDirection: 'column',
      gap: large ? 14 : 10,
      minHeight: large ? 0 : 140,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Lift name */}
      <div>
        <div style={{
          fontFamily: 'var(--display)',
          fontWeight: 600,
          fontSize: large ? 30 : 18,
          letterSpacing: '-0.02em',
          color: 'var(--ink-0)',
          lineHeight: 1.0,
          textTransform: 'uppercase',
        }}>
          {lift === 'deadlift' ? 'Dead' : lift === 'press' ? 'Press' : lift === 'bench' ? 'Bench' : 'Squat'}
        </div>
        {large && (
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 11,
            color: 'var(--ink-2)', marginTop: 4,
            letterSpacing: '0.05em',
          }}>
            {meta.label.toLowerCase()}
          </div>
        )}
      </div>

      {/* Top set */}
      <div>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600,
          letterSpacing: '0.12em', color: 'var(--ink-3)',
          textTransform: 'uppercase', marginBottom: 4,
        }}>
          Top set · {Math.round(pct * 100)}%
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'nowrap' }}>
          <span className="weight-num" style={{
            fontSize: large ? 36 : 26,
            color: 'var(--ink-0)',
            lineHeight: 0.9,
          }}>{topWeight}</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--ink-2)',
          }}>{unit}</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: large ? 18 : 14, fontWeight: 500,
            color: 'var(--ink-1)',
            marginLeft: 4,
          }}>× {topReps}{amrap ? '+' : ''}</span>
        </div>
      </div>

      {/* Last session strip */}
      {last && (
        <div style={{
          marginTop: 'auto',
          paddingTop: 10,
          borderTop: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10,
            color: 'var(--ink-2)', letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            {last.daysAgo === 0 ? 'today' : `${last.daysAgo}d ago`}
            {last.topReps != null && ` · ${last.topReps} reps`}
          </span>
          <Icon name="arrow-right" size={14} color="var(--ink-2)" stroke={2} />
        </div>
      )}
      {!last && (
        <div style={{
          marginTop: 'auto',
          paddingTop: 10,
          borderTop: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10,
            color: 'var(--ink-3)', letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>not started</span>
          <Icon name="arrow-right" size={14} color="var(--ink-2)" stroke={2} />
        </div>
      )}
    </button>
  );
}

// ════════════════════════════════════════════════════════════
// EXERCISE LIBRARY — assistance picker
// ════════════════════════════════════════════════════════════
const LIBRARY = [
  { cat: 'push', name: 'Dips',                  reps: '50',  fav: true },
  { cat: 'push', name: 'Push-ups',              reps: '75',  fav: false },
  { cat: 'push', name: 'DB bench press',        reps: '50',  fav: false },
  { cat: 'push', name: 'Triceps pushdown',      reps: '50',  fav: false },
  { cat: 'pull', name: 'Chin-ups',              reps: '50',  fav: true },
  { cat: 'pull', name: 'Pull-ups',              reps: '50',  fav: false },
  { cat: 'pull', name: 'DB row',                reps: '50',  fav: false },
  { cat: 'pull', name: 'Face pulls',            reps: '75',  fav: false },
  { cat: 'legs', name: 'Lunges',                reps: '50',  fav: true },
  { cat: 'legs', name: 'Bulgarian split squat', reps: '50',  fav: false },
  { cat: 'legs', name: 'Leg press',             reps: '50',  fav: false },
  { cat: 'legs', name: 'Glute ham raise',       reps: '50',  fav: false },
  { cat: 'core', name: 'Hanging leg raise',     reps: '50',  fav: true },
  { cat: 'core', name: 'Ab wheel',              reps: '30',  fav: false },
  { cat: 'core', name: 'Plank',                 reps: '3 min', fav: false },
];

function LibraryScreen() {
  const [cat, setCat] = React.useState('all');
  const filtered = cat === 'all' ? LIBRARY : LIBRARY.filter((x) => x.cat === cat);

  return (
    <div style={{
      background: 'var(--bg-0)',
      minHeight: '100%',
      paddingBottom: 90,
    }}>
      <div style={{ padding: '64px 24px 0' }}>
        <Eyebrow>50–100 reps each</Eyebrow>
        <h1 style={{
          fontFamily: 'var(--display)',
          fontWeight: 400,
          fontSize: 44,
          lineHeight: 0.98,
          letterSpacing: '-0.025em',
          margin: '4px 0 0',
          color: 'var(--ink-0)',
        }}>
          Assistance<br/>
          <span style={{ color: 'var(--hot)' }}>library.</span>
        </h1>
      </div>

      {/* Category pills */}
      <div style={{ padding: '20px 24px 12px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[
          { v: 'all', l: 'All' },
          { v: 'push', l: 'Push' },
          { v: 'pull', l: 'Pull' },
          { v: 'legs', l: 'Legs' },
          { v: 'core', l: 'Core' },
        ].map((c) => (
          <button key={c.v} onClick={() => setCat(c.v)} style={{
            padding: '6px 14px',
            borderRadius: 999,
            border: cat === c.v ? 'none' : '1px solid var(--line)',
            background: cat === c.v ? 'var(--ink-0)' : 'transparent',
            color: cat === c.v ? 'var(--bg-0)' : 'var(--ink-2)',
            fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500,
            whiteSpace: 'nowrap', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {c.v !== 'all' && (
              <span style={{
                width: 6, height: 6, borderRadius: 2,
                background: ASSISTANCE_COLOR[c.v],
                display: 'inline-block',
              }} />
            )}
            {c.l}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 24px' }}>
        {filtered.map((x, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 0',
            borderBottom: '1px solid var(--line)',
          }}>
            <div style={{
              width: 8, height: 28, borderRadius: 2,
              background: ASSISTANCE_COLOR[x.cat],
              flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-0)' }}>{x.name}</div>
                {x.fav && (
                  <span style={{
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: 'var(--hot-soft)',
                    color: 'var(--hot)',
                    fontFamily: 'var(--mono)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>★ fave</span>
                )}
              </div>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 11,
                color: 'var(--ink-2)', letterSpacing: '0.04em',
                textTransform: 'uppercase', marginTop: 2,
              }}>
                {x.cat} · target {x.reps} reps
              </div>
            </div>
            <button style={{
              width: 36, height: 36, borderRadius: 999,
              border: 'none', background: 'var(--bg-1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="plus" size={18} color="var(--ink-3)" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════════════════
function SettingsScreen({ unit, onUnitChange, percentages, onPercentChange, plateSet, onPlateSetChange, session, onToggleLift }) {
  const enabled = session?.enabledLifts || LIFT_ORDER;
  return (
    <div style={{
      background: 'var(--bg-0)',
      minHeight: '100%',
      paddingBottom: 90,
    }}>
      <div style={{ padding: '64px 24px 0' }}>
        <Eyebrow>the dials</Eyebrow>
        <h1 style={{
          fontFamily: 'var(--display)',
          fontWeight: 400,
          fontSize: 44,
          lineHeight: 0.98,
          letterSpacing: '-0.025em',
          margin: '4px 0 0',
          color: 'var(--ink-0)',
        }}>
          <span style={{ color: 'var(--hot)' }}>Settings.</span>
        </h1>
      </div>

      <div style={{ padding: '28px 24px 0' }}>
        <SettingsSection title="Units">
          <SegRail
            options={[
              { value: 'lbs', label: 'Pounds (lbs)' },
              { value: 'kg',  label: 'Kilograms (kg)' },
            ]}
            value={unit}
            onChange={onUnitChange}
            style={{ width: '100%', display: 'flex' }}
          />
        </SettingsSection>

        <SettingsSection title="Plate set">
          <SegRail
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'metric',   label: 'Metric' },
              { value: 'custom',   label: 'Custom' },
            ]}
            value={plateSet}
            onChange={onPlateSetChange}
            style={{ display: 'flex' }}
          />
          <div style={{ marginTop: 10, padding: 12, background: 'var(--bg-1)', borderRadius: 'var(--r-sm)' }}>
            <Caps style={{ marginBottom: 6 }}>Available plates · {unit}</Caps>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(unit === 'kg' ? PLATES_KG : PLATES_LBS).map((p) => (
                <div key={p} style={{
                  padding: '4px 10px', borderRadius: 999,
                  background: 'var(--bg-2)',
                  fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600,
                  color: 'var(--ink-0)',
                }}>{p}</div>
              ))}
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Percentage split">
          <Card variant="bright" padding={0}>
            {[
              { label: 'Week 1', pct: '65 / 75 / 85', reps: '5 / 5 / 5+' },
              { label: 'Week 2', pct: '70 / 80 / 90', reps: '3 / 3 / 3+' },
              { label: 'Week 3', pct: '75 / 85 / 95', reps: '5 / 3 / 1+' },
              { label: 'Week 4', pct: '40 / 50 / 60', reps: 'deload' },
            ].map((w, i) => (
              <div key={w.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px',
                borderBottom: i < 3 ? '1px solid var(--line)' : 'none',
              }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-0)' }}>{w.label}</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-0)' }}>{w.pct}<span style={{ color: 'var(--ink-2)' }}>%</span></div>
                  <div style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12, color: 'var(--ink-2)' }}>{w.reps}</div>
                </div>
              </div>
            ))}
          </Card>
          <div style={{
            fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: 'var(--ink-2)', marginTop: 8,
          }}>
            tap any row to customize · default is the original 5/3/1 prescription
          </div>
        </SettingsSection>

        <SettingsSection title="Progression">
          <Card variant="bright" padding={0}>
            <SettingRow label="Upper body increment" value={`+5 ${unit}`} hint="bench, overhead press" />
            <SettingRow label="Lower body increment" value={`+10 ${unit}`} hint="squat, deadlift" />
            <SettingRow label="BBB percentage" value="50% TM" hint="5 sets × 10 reps" last />
          </Card>
        </SettingsSection>

        <SettingsSection title="Training max">
          <Card variant="bright" padding={0}>
            {enabled.map((l, i) => (
              <div key={l} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px',
                borderBottom: i < enabled.length - 1 ? '1px solid var(--line)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-0)' }}>{LIFT_META[l].label}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="weight-num" style={{ fontSize: 18, color: 'var(--ink-0)' }}>
                    {session?.trainingMax?.[l] || 0}
                  </span>
                  <Icon name="edit" size={14} color="var(--ink-2)" />
                </div>
              </div>
            ))}
          </Card>
        </SettingsSection>

        <SettingsSection title="Active lifts">
          <Card variant="bright" padding={0}>
            {LIFT_ORDER.map((l, i) => {
              const on = enabled.includes(l);
              return (
                <div key={l} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px',
                  borderBottom: i < LIFT_ORDER.length - 1 ? '1px solid var(--line)' : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-0)' }}>{LIFT_META[l].label}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)', marginTop: 1, letterSpacing: '0.04em' }}>
                      {on ? 'in rotation' : 'skipping'}
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleLift?.(l)}
                    disabled={on && enabled.length === 1}
                    style={{
                      width: 44, height: 26, borderRadius: 999,
                      border: 'none', padding: 0, position: 'relative',
                      background: on ? 'var(--hot)' : 'rgba(250, 250, 245, 0.14)',
                      transition: 'background 0.2s var(--ease)',
                      opacity: on && enabled.length === 1 ? 0.5 : 1,
                      cursor: on && enabled.length === 1 ? 'not-allowed' : 'pointer',
                    }}>
                    <span style={{
                      position: 'absolute',
                      top: 3, left: on ? 21 : 3,
                      width: 20, height: 20, borderRadius: 999,
                      background: 'var(--ink-0)',
                      transition: 'left 0.2s var(--ease)',
                    }} />
                  </button>
                </div>
              );
            })}
          </Card>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 11,
            color: 'var(--ink-2)', marginTop: 8, letterSpacing: '0.02em',
            lineHeight: 1.5,
          }}>
            you'll cycle through {enabled.length} {enabled.length === 1 ? 'lift' : 'lifts'} per week · {enabled.length * 4} sessions / cycle
          </div>
        </SettingsSection>

        <SettingsSection title="Rest timer">
          <Card variant="bright" padding={0}>
            <SettingRow label="Working sets" value="2:00" hint="default rest between 5/3/1 sets" />
            <SettingRow label="BBB sets" value="1:30" hint="boring but big" />
            <SettingRow label="Auto-start" value="On" hint="start timer after logging" last toggle />
          </Card>
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <Caps style={{ marginBottom: 10 }}>{title}</Caps>
      {children}
    </div>
  );
}

function SettingRow({ label, value, hint, last, toggle }) {
  const [on, setOn] = React.useState(true);
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 16px',
      borderBottom: last ? 'none' : '1px solid var(--line)',
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-0)' }}>{label}</div>
        <div style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>{hint}</div>
      </div>
      {toggle ? (
        <button onClick={() => setOn(!on)} style={{
          width: 44, height: 26, borderRadius: 999,
          border: 'none', padding: 0, position: 'relative',
          background: on ? 'var(--ink)' : 'rgba(250, 250, 245, 0.18)',
          transition: 'background 0.2s var(--ease)',
        }}>
          <span style={{
            position: 'absolute',
            top: 3, left: on ? 21 : 3,
            width: 20, height: 20, borderRadius: 999,
            background: 'var(--bg-0)',
            transition: 'left 0.2s var(--ease)',
          }} />
        </button>
      ) : (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: 'var(--ink-0)' }}>
          {value}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  HomeScreen, LibraryScreen, SettingsScreen,
});
