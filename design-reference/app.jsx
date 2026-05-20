// app.jsx — 531 Strength · main app shell

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "editorial",
  "plateVariant": "barbell",
  "screen": "today",
  "demoStage": "midCycle",
  "showWatch": true,
  "accent": "#C13D11"
}/*EDITMODE-END*/;

// Demo data ────────────────────────────────────────────────
function buildDemoSession(stage) {
  // freshStart: cycle 1, week 1, all 4 lifts enabled, no progress
  // midCycle:  cycle 3, week 2, 3 lifts enabled (no press), 8 sessions done
  // advanced:  cycle 6, week 3, all 4 lifts, strong PR streak
  // benchOnly: cycle 4, week 2, bench only — single-lift focus
  if (stage === 'freshStart') {
    return {
      cycle: 1, week: 1, day: 1, lift: 'squat',
      enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
      completedSets: 0, completedSessions: 0,
      dateLabel: 'Mon, Jan 6',
      greeting: 'good morning,',
      trainingMax: { squat: 235, bench: 175, deadlift: 305, press: 115 },
      lastSession: { squat: null, bench: null, deadlift: null, press: null },
      assistance: [
        { name: 'Chin-ups',          category: 'pull', sets: 5, reps: 10 },
        { name: 'Hanging leg raise', category: 'core', sets: 3, reps: 15 },
      ],
      history: {
        squat:    { bestE1RM: 0 },
        bench:    { bestE1RM: 0 },
        deadlift: { bestE1RM: 0 },
        press:    { bestE1RM: 0 },
      },
    };
  }
  if (stage === 'advanced') {
    return {
      cycle: 6, week: 3, day: 2, lift: 'bench',
      enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
      completedSets: 2, completedSessions: 13,
      dateLabel: 'Wed, May 14',
      greeting: 'evening, marcus.',
      trainingMax: { squat: 320, bench: 220, deadlift: 405, press: 145 },
      lastSession: {
        squat:    { daysAgo: 4, topReps: 7 },
        bench:    { daysAgo: 0, topReps: 5 },  // today
        deadlift: { daysAgo: 2, topReps: 8 },
        press:    { daysAgo: 6, topReps: 6 },
      },
      assistance: [
        { name: 'Dips',              category: 'push', sets: 5, reps: 10 },
        { name: 'DB row',            category: 'pull', sets: 5, reps: 10 },
        { name: 'Ab wheel',          category: 'core', sets: 3, reps: 10 },
      ],
      history: {
        squat:    { bestE1RM: 365 },
        bench:    { bestE1RM: 248 },
        deadlift: { bestE1RM: 462 },
        press:    { bestE1RM: 168 },
      },
    };
  }
  if (stage === 'benchOnly') {
    return {
      cycle: 4, week: 2, day: 1, lift: 'bench',
      enabledLifts: ['bench'],
      completedSets: 0, completedSessions: 1,
      dateLabel: 'Mon, Apr 14',
      greeting: 'afternoon,',
      trainingMax: { squat: 0, bench: 215, deadlift: 0, press: 0 },
      lastSession: {
        bench: { daysAgo: 3, topReps: 8 },
      },
      assistance: [
        { name: 'Dips',           category: 'push', sets: 5, reps: 10 },
        { name: 'Face pulls',     category: 'pull', sets: 5, reps: 15 },
        { name: 'Triceps pushdown', category: 'push', sets: 3, reps: 15 },
      ],
      history: {
        bench: { bestE1RM: 235 },
      },
    };
  }
  // default midCycle — 3 lifts (skip press)
  return {
    cycle: 3, week: 2, day: 1, lift: 'squat',
    enabledLifts: ['squat', 'bench', 'deadlift'],
    completedSets: 1, completedSessions: 8,
    dateLabel: 'Tue, May 19',
    greeting: 'good morning,',
    trainingMax: { squat: 275, bench: 195, deadlift: 345, press: 0 },
    lastSession: {
      squat:    { daysAgo: 0, topReps: 6 },   // today's
      bench:    { daysAgo: 2, topReps: 5 },
      deadlift: { daysAgo: 4, topReps: 7 },
    },
    assistance: [
      { name: 'Chin-ups',          category: 'pull', sets: 5, reps: 10 },
      { name: 'Lunges',            category: 'legs', sets: 5, reps: 10 },
      { name: 'Hanging leg raise', category: 'core', sets: 3, reps: 12 },
    ],
    history: {
      squat:    { bestE1RM: 310 },
      bench:    { bestE1RM: 218 },
      deadlift: { bestE1RM: 388 },
    },
  };
}

const HISTORY_DATA = {
  prs: { squat: 310, bench: 218, deadlift: 388, press: 148 },
  sessions: [
    { month: 'MAY', day: 17, lift: 'Deadlift', cycle: 3, week: 2, pr: true,
      summary: 'AMRAP set crushed — 8 reps at 90% TM, new estimated 1RM.',
      topSet: { weight: 310, reps: 8, e1RM: 393 } },
    { month: 'MAY', day: 15, lift: 'Bench press', cycle: 3, week: 2,
      summary: 'Felt heavy on the second set, kept reps conservative.',
      topSet: { weight: 175, reps: 5, e1RM: 204 } },
    { month: 'MAY', day: 13, lift: 'Overhead press', cycle: 3, week: 2,
      summary: 'Hit prescribed reps, BBB at 50% was the right call.',
      topSet: { weight: 117, reps: 6, e1RM: 140 } },
    { month: 'MAY', day: 10, lift: 'Squat', cycle: 3, week: 1, pr: true,
      summary: 'Smooth session, AMRAP top set went 9 — strong start to the cycle.',
      topSet: { weight: 235, reps: 9, e1RM: 305 } },
    { month: 'MAY', day: 8, lift: 'Deadlift', cycle: 3, week: 1,
      summary: 'Warmed up slow, top set felt easy. Bar speed was good.',
      topSet: { weight: 295, reps: 7, e1RM: 364 } },
    { month: 'MAY', day: 6, lift: 'Bench press', cycle: 3, week: 1,
      summary: 'Form felt locked in. BBB grindy on sets 4 and 5.',
      topSet: { weight: 168, reps: 8, e1RM: 213 } },
    { month: 'MAY', day: 3, lift: 'Squat', cycle: 2, week: 4,
      summary: 'Deload week — light, focused on movement quality.',
      topSet: { weight: 165, reps: 5, e1RM: 193 } },
  ],
};

// ──────────────────────────────────────────────────────────
// App component
// ──────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [unit, setUnit] = React.useState('lbs');
  const [plateSet, setPlateSet] = React.useState('standard');

  // build session from demo stage
  const baseSession = React.useMemo(() => buildDemoSession(t.demoStage), [t.demoStage]);

  // user-picked lift (overrides session.lift if set)
  const [pickedLift, setPickedLift] = React.useState(null);
  // override enabled lifts when user toggles in settings
  const [overrideEnabled, setOverrideEnabled] = React.useState(null);
  const session = React.useMemo(() => {
    let s = baseSession;
    if (overrideEnabled) s = { ...s, enabledLifts: overrideEnabled };
    if (pickedLift) s = { ...s, lift: pickedLift };
    return s;
  }, [baseSession, pickedLift, overrideEnabled]);

  // reset overrides when demo state changes
  React.useEffect(() => {
    setPickedLift(null);
    setOverrideEnabled(null);
  }, [t.demoStage]);

  // active set index (null = not in live mode)
  const [activeSet, setActiveSet] = React.useState(null);
  const [prModal, setPRModal] = React.useState(null);

  // Apply accent color override
  React.useEffect(() => {
    document.documentElement.style.setProperty('--hot', t.accent);
  }, [t.accent]);

  const handleStartSet = (i) => setActiveSet(i);
  const handleCloseLive = () => setActiveSet(null);
  const handleCompleteSet = () => setActiveSet(null);
  const handlePRDetected = (data) => setPRModal(data);
  const screen = t.screen;

  // Screen body
  let body;
  if (screen === 'onboarding') {
    body = <OnboardingScreen unit={unit} onFinish={() => setTweak('screen', 'home')} />;
  } else if (activeSet !== null) {
    body = (
      <LiveScreen
        session={session}
        unit={unit}
        plateVariant={t.plateVariant}
        setIndex={activeSet}
        onClose={handleCloseLive}
        onComplete={handleCompleteSet}
        onPRDetected={handlePRDetected}
      />
    );
  } else if (screen === 'home') {
    body = <HomeScreen
      session={session}
      unit={unit}
      onPickLift={(l) => { setPickedLift(l); setTweak('screen', 'today'); }}
      onOpenLibrary={() => setTweak('screen', 'library')}
      onOpenWatch={() => setTweak('showWatch', !t.showWatch)}
    />;
  } else if (screen === 'today') {
    body = <TodayScreen
      session={session}
      unit={unit}
      heroVariant={t.heroVariant}
      plateVariant={t.plateVariant}
      onStartSet={handleStartSet}
      onOpenWatch={() => setTweak('showWatch', !t.showWatch)}
    />;
  } else if (screen === 'cycle') {
    body = <CycleScreen session={session} unit={unit} history={HISTORY_DATA} />;
  } else if (screen === 'history') {
    body = <HistoryScreen history={HISTORY_DATA} unit={unit} enabledLifts={session.enabledLifts} />;
  } else if (screen === 'library') {
    body = <LibraryScreen />;
  } else if (screen === 'settings') {
    body = <SettingsScreen
      unit={unit}
      onUnitChange={setUnit}
      plateSet={plateSet}
      onPlateSetChange={setPlateSet}
      session={session}
      onToggleLift={(l) => {
        // Modify the local override on top of base session
        const cur = session.enabledLifts || LIFT_ORDER;
        const next = cur.includes(l)
          ? cur.filter((x) => x !== l)
          : [...cur, l];
        if (next.length === 0) return;
        setOverrideEnabled(next);
      }}
    />;
  } else {
    body = <HomeScreen session={session} unit={unit}
      onPickLift={(l) => { setPickedLift(l); setTweak('screen', 'today'); }}
      onOpenLibrary={() => setTweak('screen', 'library')}
      onOpenWatch={() => setTweak('showWatch', !t.showWatch)}
    />;
  }

  // Tab bar visibility
  const showTabBar = activeSet === null && screen !== 'onboarding';

  return (
    <div className="stage">
      {/* Phone */}
      <div className="phone-wrap">
        <div className="phone-label">531 · iPhone 15 Pro</div>
        <IOSDevice width={390} height={844} dark={false}>
          <div className="phone-scroll" style={{
            width: '100%', height: '100%',
            overflowY: 'auto', position: 'relative',
            background: 'var(--bg-0)',
          }}>
            {body}
            {showTabBar && (
              <TabBar
                screen={screen}
                onChange={(s) => setTweak('screen', s)}
              />
            )}
            {/* PR celebration overlay */}
            {prModal && (
              <PRModal data={prModal} unit={unit} onClose={() => setPRModal(null)} />
            )}
          </div>
        </IOSDevice>

        {/* Quick-screen shortcuts row (only visible when not onboarding) */}
        {screen !== 'onboarding' && (
          <ScreenShortcuts current={screen} onChange={(s) => {
            setActiveSet(null);
            setTweak('screen', s);
          }} />
        )}
      </div>

      {/* Apple Watch companion */}
      {t.showWatch && screen !== 'onboarding' && (
        <AppleWatch
          weight={snapWeight(session.trainingMax[session.lift] * 0.85, unit)}
          reps={5}
          unit={unit}
          state={prModal ? 'pr' : 'active'}
          restSeconds={47}
        />
      )}

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Hero screen (Today)">
          <TweakRadio
            label="Layout"
            value={t.heroVariant}
            options={[
              { value: 'editorial', label: 'Editorial' },
              { value: 'cards',     label: 'Cards' },
              { value: 'data',      label: 'Data' },
            ]}
            onChange={(v) => setTweak({ heroVariant: v, screen: 'today' })}
          />
        </TweakSection>

        <TweakSection label="Plate visualization">
          <TweakRadio
            label="Style"
            value={t.plateVariant}
            options={[
              { value: 'barbell',   label: 'Barbell' },
              { value: 'chips',     label: 'Chips' },
              { value: 'numerical', label: 'Numbers' },
            ]}
            onChange={(v) => setTweak('plateVariant', v)}
          />
        </TweakSection>

        <TweakSection label="Demo state">
          <TweakSelect
            label="Stage"
            value={t.demoStage}
            options={[
              { value: 'freshStart', label: 'Cycle 1, all 4 lifts' },
              { value: 'midCycle',   label: 'Cycle 3, 3 lifts (no press)' },
              { value: 'benchOnly',  label: 'Cycle 4, bench only' },
              { value: 'advanced',   label: 'Cycle 6, advanced' },
            ]}
            onChange={(v) => setTweak('demoStage', v)}
          />
        </TweakSection>

        <TweakSection label="Screen">
          <TweakSelect
            label="Show"
            value={t.screen}
            options={[
              { value: 'home',       label: 'Home dashboard' },
              { value: 'today',      label: "Today's workout" },
              { value: 'cycle',      label: 'Cycle overview' },
              { value: 'history',    label: 'History' },
              { value: 'library',    label: 'Exercise library' },
              { value: 'settings',   label: 'Settings' },
              { value: 'onboarding', label: 'Onboarding flow' },
            ]}
            onChange={(v) => setTweak('screen', v)}
          />
        </TweakSection>

        <TweakSection label="Theme">
          <TweakColor
            label="Accent"
            value={t.accent}
            options={['#C13D11', '#1F8A5B', '#3B6685', '#8A6B1E', '#15130F']}
            onChange={(v) => setTweak('accent', v)}
          />
          <TweakToggle
            label="Apple Watch"
            value={t.showWatch}
            onChange={(v) => setTweak('showWatch', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Bottom tab bar
// ──────────────────────────────────────────────────────────
function TabBar({ screen, onChange }) {
  const items = [
    { v: 'home',     label: 'Home',    icon: 'home' },
    { v: 'today',    label: 'Train',   icon: 'dumbbell' },
    { v: 'cycle',    label: 'Cycle',   icon: 'calendar' },
    { v: 'history',  label: 'History', icon: 'history' },
    { v: 'settings', label: 'You',     icon: 'settings' },
  ];

  return (
    <div style={{
      position: 'absolute',
      left: 12, right: 12, bottom: 22,
      background: 'rgba(21, 19, 15, 0.92)',
      backdropFilter: 'blur(18px) saturate(180%)',
      WebkitBackdropFilter: 'blur(18px) saturate(180%)',
      borderRadius: 999,
      padding: '6px 8px',
      display: 'flex',
      justifyContent: 'space-around',
      boxShadow: '0 6px 24px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.08) inset',
      zIndex: 30,
    }}>
      {items.map((it) => {
        const on = screen === it.v;
        return (
          <button key={it.v} onClick={() => onChange(it.v)} style={{
            border: 'none',
            background: on ? 'var(--hot)' : 'transparent',
            color: on ? '#FBF8F1' : 'rgba(250, 250, 245, 0.55)',
            padding: '8px 12px',
            borderRadius: 999,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            transition: 'all var(--dur) var(--ease)',
            minHeight: 40,
          }}>
            <Icon name={it.icon} size={17} stroke={1.7} />
            {on && (
              <span style={{
                fontFamily: 'var(--sans)',
                fontSize: 12, fontWeight: 600,
                letterSpacing: '0.005em',
              }}>{it.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// PR Modal (full-screen overlay)
// ──────────────────────────────────────────────────────────
function PRModal({ data, unit, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(15, 13, 10, 0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      zIndex: 100,
      display: 'flex', flexDirection: 'column',
      padding: '120px 28px 40px',
      color: 'var(--ink-0)',
      overflow: 'hidden',
    }}>
      <PRConfetti />

      <div style={{ zIndex: 2, textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.18em', color: 'var(--hot)',
          textTransform: 'uppercase',
        }}>Personal record</div>

        <h1 style={{
          fontFamily: 'var(--display)',
          fontWeight: 400,
          fontSize: 72,
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
          margin: '16px 0 0',
          color: 'var(--ink-0)',
        }}>
          Stronger.
        </h1>

        <div style={{
          fontFamily: 'var(--display)',
          fontSize: 16,
          color: 'rgba(250, 250, 245, 0.62)',
          marginTop: 16,
          maxWidth: 280,
          marginLeft: 'auto', marginRight: 'auto',
          lineHeight: 1.4,
        }}>
          you just set a new estimated 1RM on the {LIFT_META[data.lift]?.label.toLowerCase()}.
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{
        zIndex: 2,
        background: 'rgba(250, 250, 245, 0.06)',
        borderRadius: 'var(--r-md)',
        padding: 24,
        textAlign: 'center',
        marginBottom: 16,
      }}>
        <Caps style={{ color: 'rgba(250, 250, 245, 0.5)' }}>New estimated 1RM</Caps>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginTop: 8 }}>
          <span className="weight-num" style={{
            fontSize: 78, color: 'var(--hot)',
            letterSpacing: '-0.04em', lineHeight: 0.9,
          }}>{data.e1RM}</span>
          <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 22, color: 'rgba(250, 250, 245, 0.5)' }}>{unit}</span>
        </div>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 12,
          color: 'rgba(250, 250, 245, 0.55)', marginTop: 6,
          letterSpacing: '0.04em',
        }}>
          {data.weight} {unit} × {data.reps} reps
        </div>
      </div>

      <PressButton
        onClick={onClose}
        variant="ember"
        size="lg"
        style={{ width: '100%', zIndex: 2 }}
      >
        Keep going <Icon name="arrow-right" size={16} />
      </PressButton>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// External-to-phone screen jump pills (for design review)
// ──────────────────────────────────────────────────────────
function ScreenShortcuts({ current, onChange }) {
  const screens = [
    { v: 'onboarding', l: 'Onboarding' },
    { v: 'home',       l: 'Home' },
    { v: 'today',      l: 'Today' },
    { v: 'cycle',      l: 'Cycle' },
    { v: 'history',    l: 'History' },
    { v: 'library',    l: 'Library' },
    { v: 'settings',   l: 'Settings' },
  ];
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 6,
      maxWidth: 390, justifyContent: 'center', marginTop: 4,
    }}>
      {screens.map((s) => {
        const on = current === s.v;
        return (
          <button key={s.v} onClick={() => onChange(s.v)} style={{
            border: 'none',
            padding: '6px 12px',
            borderRadius: 999,
            background: on ? 'rgba(250, 250, 245, 0.16)' : 'rgba(250, 250, 245, 0.04)',
            color: on ? 'rgba(250, 250, 245, 0.92)' : 'rgba(250, 250, 245, 0.4)',
            fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.02em',
            transition: 'all var(--dur) var(--ease)',
          }}>{s.l}</button>
        );
      })}
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
