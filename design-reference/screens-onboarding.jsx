// screens-onboarding.jsx — 1RM entry + Epley calculator

// Epley formula: 1RM = weight × (1 + reps/30)
function epley1RM(weight, reps) {
  if (!weight || !reps || reps < 1) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

const LIFT_ORDER = ['squat', 'bench', 'deadlift', 'press'];
const LIFT_META = {
  squat:    { label: 'Back squat', italic: 'the foundation' },
  bench:    { label: 'Bench press', italic: 'press from your chest' },
  deadlift: { label: 'Deadlift', italic: 'pick it up' },
  press:    { label: 'Overhead press', italic: 'press over your head' },
};

function OnboardingScreen({ unit, onFinish }) {
  const [step, setStep] = React.useState(0);  // 0:intro, 1:select, 2..N+1:lift entry, N+2:review
  const [enabled, setEnabled] = React.useState(['squat', 'bench', 'deadlift', 'press']);
  const [lifts, setLifts] = React.useState({
    squat:    { mode: 'calc', weight: 225, reps: 5, oneRM: 0 },
    bench:    { mode: 'calc', weight: 185, reps: 5, oneRM: 0 },
    deadlift: { mode: 'calc', weight: 275, reps: 5, oneRM: 0 },
    press:    { mode: 'calc', weight: 115, reps: 5, oneRM: 0 },
  });

  // calculate 1RMs for enabled lifts only
  const computed = React.useMemo(() => {
    const out = {};
    for (const k of enabled) {
      const l = lifts[k];
      out[k] = l.mode === 'direct' ? Number(l.weight) || 0 : epley1RM(Number(l.weight), Number(l.reps));
    }
    return out;
  }, [lifts, enabled]);

  const total = enabled.length;
  const reviewStep = 2 + total;  // intro(0) + select(1) + N lifts + review

  if (step === 0) return <OnboardingIntro onNext={() => setStep(1)} />;
  if (step === 1) return (
    <OnboardingLiftSelect
      enabled={enabled}
      onToggle={(k) => {
        if (enabled.includes(k) && enabled.length === 1) return;  // require at least 1
        setEnabled(enabled.includes(k) ? enabled.filter((x) => x !== k) : [...enabled, k]);
      }}
      onBack={() => setStep(0)}
      onNext={() => setStep(2)}
    />
  );
  if (step === reviewStep) return (
    <OnboardingReview
      lifts={lifts} computed={computed} unit={unit} enabled={enabled}
      onBack={() => setStep(reviewStep - 1)}
      onFinish={() => onFinish({ trainingMax: computed, enabledLifts: enabled })}
    />
  );

  // Lift entry step (step = 2..reviewStep-1)
  const liftIdx = step - 2;
  const lift = enabled[liftIdx];
  return (
    <LiftEntryStep
      step={liftIdx + 1}
      total={total}
      lift={lift}
      data={lifts[lift]}
      computed={computed[lift]}
      unit={unit}
      onChange={(d) => setLifts({ ...lifts, [lift]: d })}
      onBack={() => setStep(step - 1)}
      onNext={() => setStep(step + 1)}
    />
  );
}

// ── Lift selection step ─────────────────────────────────────
function OnboardingLiftSelect({ enabled, onToggle, onBack, onNext }) {
  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-0)',
      padding: '64px 0 24px',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        padding: '0 28px 24px',
      }}>
        <button onClick={onBack} style={{
          border: 'none', background: 'transparent', padding: 0,
          color: 'var(--ink-2)', display: 'flex', alignItems: 'center',
        }}>
          <Icon name="arrow-left" size={20} />
        </button>
        <Caps>setup · step 1</Caps>
      </div>

      {/* Title */}
      <div style={{ padding: '0 28px', marginBottom: 24 }}>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontWeight: 600,
          fontSize: 38,
          lineHeight: 1.0,
          letterSpacing: '-0.025em',
          margin: 0,
          color: 'var(--ink-0)',
        }}>
          Which lifts<br/>
          <span style={{ color: 'var(--hot)' }}>are you training?</span>
        </h2>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 12,
          color: 'var(--ink-2)', marginTop: 12,
          letterSpacing: '0.02em', lineHeight: 1.5,
        }}>
          Pick one, two, or all four. You can run 5/3/1 on a single lift if that's
          all you care about. Add or remove later in settings.
        </div>
      </div>

      {/* Lift toggles */}
      <div style={{ padding: '0 28px', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LIFT_ORDER.map((k) => {
            const on = enabled.includes(k);
            const meta = LIFT_META[k];
            return (
              <button key={k} onClick={() => onToggle(k)} style={{
                background: on ? 'var(--bg-2)' : 'transparent',
                border: `1px solid ${on ? 'var(--line-strong)' : 'var(--line)'}`,
                borderRadius: 'var(--r-md)',
                padding: '16px 18px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'all var(--dur) var(--ease)',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: on ? 'none' : '1.5px solid var(--line-strong)',
                  background: on ? 'var(--hot)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {on && <Icon name="check" size={14} color="var(--ink-0)" stroke={2.5} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--display)',
                    fontWeight: 600,
                    fontSize: 17,
                    color: 'var(--ink-0)',
                    letterSpacing: '-0.01em',
                  }}>{meta.label}</div>
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--ink-2)',
                    marginTop: 2,
                    letterSpacing: '0.04em',
                  }}>
                    {k === 'squat' || k === 'deadlift' ? '+10 lbs / cycle · lower body' : '+5 lbs / cycle · upper body'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {enabled.length < 4 && (
          <div style={{
            marginTop: 16,
            padding: 14,
            background: 'var(--bg-1)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}>
            <Icon name="sparkle" size={14} color="var(--hot)" stroke={1.6} />
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 11,
              color: 'var(--ink-1)', lineHeight: 1.5,
              letterSpacing: '0.02em',
            }}>
              {enabled.length === 1
                ? "Single-lift focus. You'll do 4 sessions per cycle."
                : `${enabled.length} lifts · ${enabled.length * 4} sessions per cycle.`}
            </div>
          </div>
        )}
      </div>

      {/* Next */}
      <div style={{ padding: '0 28px', marginTop: 16 }}>
        <PressButton
          onClick={onNext}
          size="lg"
          disabled={enabled.length === 0}
          style={{ width: '100%' }}
        >
          Continue · {enabled.length} {enabled.length === 1 ? 'lift' : 'lifts'} <Icon name="arrow-right" size={16} />
        </PressButton>
      </div>
    </div>
  );
}

// ── Intro panel ─────────────────────────────────────────────
function OnboardingIntro({ onNext }) {
  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '88px 28px 32px',
      background: 'var(--bg-0)',
      position: 'relative',
    }}>
      {/* Wordmark */}
      <div style={{
        fontFamily: 'var(--display)',
        fontSize: 22,
        letterSpacing: '-0.01em',
        color: 'var(--ink-0)',
        position: 'absolute',
        top: 60,
        left: 28,
      }}>
        531<span style={{ color: 'var(--hot)' }}>.</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Eyebrow style={{ marginBottom: 16 }}>A program by Jim Wendler</Eyebrow>
        <h1 style={{
          fontFamily: 'var(--display)',
          fontWeight: 400,
          fontSize: 48,
          lineHeight: 1.0,
          letterSpacing: '-0.025em',
          margin: 0,
          color: 'var(--ink-0)',
        }}>
          Get strong<br/>
          <span style={{ color: 'var(--hot)' }}>slowly.</span>
        </h1>
        <p style={{
          fontFamily: 'var(--sans)',
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--ink-1)',
          marginTop: 24,
          maxWidth: 320,
        }}>
          Four lifts. Four weeks. Small jumps every cycle. We'll calculate
          your training max so the program does the math — you just lift.
        </p>

        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <BulletPoint n="1" label="Enter your four 1‑rep maxes" sub="or use the calculator below" />
          <BulletPoint n="2" label="We'll set your training max to 90%" sub="that's your working number" />
          <BulletPoint n="3" label="Lift for 4 weeks, repeat" sub="add weight, every time" />
        </div>
      </div>

      <PressButton onClick={onNext} size="lg" style={{ width: '100%', marginTop: 24 }}>
        Begin <Icon name="arrow-right" size={16} />
      </PressButton>
    </div>
  );
}

function BulletPoint({ n, label, sub }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{
        width: 26, height: 26, borderRadius: 999,
        background: 'var(--ink)',
        color: 'var(--ink-0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
        flexShrink: 0,
      }}>{n}</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-0)', lineHeight: 1.3 }}>{label}</div>
        <div style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 14, color: 'var(--ink-2)', marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}

// ── Per-lift entry ──────────────────────────────────────────
function LiftEntryStep({ step, total, lift, data, computed, unit, onChange, onBack, onNext }) {
  const meta = LIFT_META[lift];
  const tm = Math.round(computed * 0.9 / 5) * 5;

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-0)',
      padding: '64px 0 24px',
    }}>
      {/* Progress dots */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '0 28px 28px',
        alignItems: 'center',
      }}>
        <button onClick={onBack} style={{
          border: 'none', background: 'transparent', padding: 0, marginRight: 8,
          color: 'var(--ink-1)', display: 'flex', alignItems: 'center',
        }}>
          <Icon name="arrow-left" size={20} />
        </button>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            width: i === step ? 24 : 6,
            height: 6,
            borderRadius: 999,
            background: i <= step ? 'var(--ink)' : 'var(--line)',
            transition: 'all var(--dur) var(--ease)',
          }} />
        ))}
        <div style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)' }}>
          {step}/{total}
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: '0 28px', marginBottom: 28 }}>
        <Caps style={{ marginBottom: 8 }}>Lift {step} of {total}</Caps>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontWeight: 400,
          fontSize: 38,
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
          margin: 0,
          color: 'var(--ink-0)',
        }}>{meta.label}</h2>
        <Eyebrow style={{ marginTop: 8 }}>{meta.italic}</Eyebrow>
      </div>

      {/* Mode toggle */}
      <div style={{ padding: '0 28px', marginBottom: 24 }}>
        <SegRail
          options={[
            { value: 'direct', label: 'I know my 1RM' },
            { value: 'calc',   label: 'Calculate it' },
          ]}
          value={data.mode}
          onChange={(v) => onChange({ ...data, mode: v })}
        />
      </div>

      {/* Input fields */}
      <div style={{ padding: '0 28px', flex: 1 }}>
        {data.mode === 'direct' ? (
          <div>
            <Caps style={{ marginBottom: 12 }}>One-rep max</Caps>
            <NumberStepper
              value={data.weight}
              onChange={(v) => onChange({ ...data, weight: v })}
              step={5}
              unit={unit}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <Caps style={{ marginBottom: 12 }}>Weight you lifted</Caps>
              <NumberStepper
                value={data.weight}
                onChange={(v) => onChange({ ...data, weight: v })}
                step={5}
                unit={unit}
              />
            </div>
            <div>
              <Caps style={{ marginBottom: 12 }}>For how many reps</Caps>
              <NumberStepper
                value={data.reps}
                onChange={(v) => onChange({ ...data, reps: Math.max(1, Math.min(15, v)) })}
                step={1}
                unit="reps"
                small
              />
            </div>
          </div>
        )}

        {/* Computed 1RM + TM display */}
        <Card style={{ marginTop: 32 }} variant="bright">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <Eyebrow style={{ fontSize: 13 }}>Estimated 1RM</Eyebrow>
              <BigWeight weight={computed || 0} unit={unit} size={42} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <Eyebrow style={{ fontSize: 13 }}>Training max</Eyebrow>
              <BigWeight weight={tm} unit={unit} size={28} color="var(--hot)" />
              <div style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>
                90% of 1RM
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Next */}
      <div style={{ padding: '0 28px', marginTop: 16 }}>
        <PressButton
          onClick={onNext}
          size="lg"
          disabled={!computed}
          style={{ width: '100%' }}
        >
          {step === total ? 'Review' : 'Next lift'}
          <Icon name="arrow-right" size={16} />
        </PressButton>
      </div>
    </div>
  );
}

// ── Number stepper with - / + buttons ───────────────────────
function NumberStepper({ value, onChange, step = 5, unit = 'lbs', small = false }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--bg-1)',
      borderRadius: 'var(--r-pill)',
      padding: small ? 6 : 8,
      gap: 4,
    }}>
      <StepperBtn onClick={() => onChange(Math.max(0, value - step))}>
        <Icon name="minus" size={20} />
      </StepperBtn>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flex: 1, justifyContent: 'center' }}>
        <span className="weight-num" style={{
          fontSize: small ? 32 : 44,
          color: 'var(--ink-0)',
          letterSpacing: '-0.03em',
        }}>{value}</span>
        <span style={{
          fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: small ? 16 : 20,
          color: 'var(--ink-2)',
        }}>{unit}</span>
      </div>
      <StepperBtn onClick={() => onChange(value + step)}>
        <Icon name="plus" size={20} />
      </StepperBtn>
    </div>
  );
}

function StepperBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 52, height: 52,
      borderRadius: 999,
      border: 'none',
      background: 'var(--bg-2)',
      color: 'var(--ink-0)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      flexShrink: 0,
    }}>
      {children}
    </button>
  );
}

// ── Review summary ─────────────────────────────────────────
function OnboardingReview({ lifts, computed, unit, enabled, onBack, onFinish }) {
  const list = enabled || LIFT_ORDER;
  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-0)',
      padding: '64px 0 24px',
    }}>
      <div style={{ padding: '0 28px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{
          border: 'none', background: 'transparent', padding: 0,
          color: 'var(--ink-1)', display: 'flex', alignItems: 'center',
        }}>
          <Icon name="arrow-left" size={20} />
        </button>
        <Caps>Final review</Caps>
      </div>

      <div style={{ padding: '0 28px', marginBottom: 24 }}>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontWeight: 400,
          fontSize: 36,
          lineHeight: 1.05,
          margin: 0,
          color: 'var(--ink-0)',
          letterSpacing: '-0.02em',
        }}>
          Your starting<br/>
          <span style={{ color: 'var(--hot)' }}>training maxes.</span>
        </h2>
        <Eyebrow style={{ marginTop: 8 }}>these are the numbers we'll program from</Eyebrow>
      </div>

      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 24 }}>
        {list.map((k, i) => {
          const meta = LIFT_META[k];
          const tm = Math.round(computed[k] * 0.9 / 5) * 5;
          return (
            <div key={k} style={{
              background: 'var(--bg-1)',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopLeftRadius: i === 0 ? 'var(--r-md)' : 0,
              borderTopRightRadius: i === 0 ? 'var(--r-md)' : 0,
              borderBottomLeftRadius: i === list.length - 1 ? 'var(--r-md)' : 0,
              borderBottomRightRadius: i === list.length - 1 ? 'var(--r-md)' : 0,
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-0)' }}>{meta.label}</div>
                <div style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: 'var(--ink-2)', marginTop: 1 }}>
                  1RM · {computed[k]} {unit}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="weight-num" style={{ fontSize: 26, color: 'var(--hot)', letterSpacing: '-0.02em' }}>{tm}</span>
                <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 13, color: 'var(--ink-2)' }}>{unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0 28px', flex: 1 }}>
        <Card variant="ink">
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Icon name="sparkle" size={18} color="var(--hot)" stroke={1.6} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Conservative is good</div>
              <div style={{
                fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 14,
                color: 'rgba(250, 250, 245, 0.72)',
                lineHeight: 1.45,
              }}>
                Better to start lighter and progress for years than to burn out
                in six weeks. You can always edit these later.
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: '0 28px', marginTop: 16 }}>
        <PressButton onClick={onFinish} size="lg" style={{ width: '100%' }}>
          Start cycle 1 <Icon name="arrow-right" size={16} />
        </PressButton>
      </div>
    </div>
  );
}

Object.assign(window, {
  OnboardingScreen, epley1RM, LIFT_ORDER, LIFT_META, NumberStepper,
});
