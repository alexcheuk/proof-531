import { restNotifEffectForAppState } from '../restNotificationActions';

describe('restNotifEffectForAppState', () => {
  it('does nothing when not resting, regardless of app state', () => {
    expect(restNotifEffectForAppState('background', false)).toBe('none');
    expect(restNotifEffectForAppState('active', false)).toBe('none');
    expect(restNotifEffectForAppState('inactive', false)).toBe('none');
  });

  it('posts the chronometer when backgrounded mid-rest', () => {
    expect(restNotifEffectForAppState('background', true)).toBe('post');
  });

  it('reconciles when foregrounded mid-rest', () => {
    expect(restNotifEffectForAppState('active', true)).toBe('reconcile');
  });

  it('ignores transient inactive/unknown states', () => {
    expect(restNotifEffectForAppState('inactive', true)).toBe('none');
    expect(restNotifEffectForAppState('unknown', true)).toBe('none');
    expect(restNotifEffectForAppState('extension', true)).toBe('none');
  });
});
