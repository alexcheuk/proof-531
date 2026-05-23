# Plan for P1-05-press-button — PressButton (ember/inverse/ghost × sm/md/lg)

(See implementer prompt for the full TSX bodies — the planner output is reproduced verbatim there.)

Key decisions:
- expo-haptics installed via `expo install`
- Pressable (not TouchableOpacity)
- useTheme so ember/ghost respect accent override
- Haptics.impactAsync(Medium) fire-and-forget before onPress
- disabled gates onPress + haptic; sets accessibilityState.disabled + opacity 0.5
- size paddings: sm 8/14 fs13, md 12/20 fs15, lg 16/28 fs17
- composes the design Text primitive for the label
