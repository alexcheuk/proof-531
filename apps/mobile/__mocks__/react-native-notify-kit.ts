// Jest manual mock for the native notify-kit module. Auto-applied for the
// node_modules package so suites that import the chronometer wrapper (or the
// orchestrator) don't try to load the real TurboModule under jest.

export enum AndroidImportance {
  NONE = 0,
  MIN = 1,
  LOW = 2,
  DEFAULT = 3,
  HIGH = 4,
}

export enum EventType {
  UNKNOWN = -1,
  DISMISSED = 0,
  PRESS = 1,
  ACTION_PRESS = 2,
  DELIVERED = 3,
}

export enum TriggerType {
  TIMESTAMP = 0,
  INTERVAL = 1,
}

export enum AndroidColor {
  RED = 'red',
}

const notifee = {
  createChannel: jest.fn(async () => 'channel-id'),
  deleteChannel: jest.fn(async () => undefined),
  requestPermission: jest.fn(async () => ({ authorizationStatus: 1 })),
  displayNotification: jest.fn(async () => 'notif-id'),
  createTriggerNotification: jest.fn(async () => 'trigger-id'),
  cancelNotification: jest.fn(async () => undefined),
  cancelTriggerNotification: jest.fn(async () => undefined),
  cancelDisplayedNotification: jest.fn(async () => undefined),
  getDisplayedNotifications: jest.fn(async () => [] as unknown[]),
  getInitialNotification: jest.fn(async () => null),
  onBackgroundEvent: jest.fn(),
  onForegroundEvent: jest.fn(() => () => undefined),
};

export default notifee;
