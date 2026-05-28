import type { ConfigContext, ExpoConfig } from 'expo/config';

// Dynamic config layered over app.json. The only thing it does is give the
// development build a distinct application id + display name so it installs
// alongside (not over) the preview/production app.
//
// Driven by APP_VARIANT:
//   - "development" -> id `.dev`, name "… (Dev)"
//   - anything else (preview, production, unset) -> the base app.json values
//
// APP_VARIANT is set per-profile in eas.json and by the `start` script for
// local dev. The local value MUST match the installed dev build: with
// `runtimeVersion: { policy: "fingerprint" }` a mismatched id changes the
// fingerprint and the dev client refuses to load the bundle.
const IS_DEV = process.env.APP_VARIANT === 'development';

const ID_SUFFIX = IS_DEV ? '.dev' : '';
const NAME_SUFFIX = IS_DEV ? ' (Dev)' : '';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: `${config.name ?? '531 Strength'}${NAME_SUFFIX}`,
  slug: config.slug ?? '531',
  ios: {
    ...config.ios,
    bundleIdentifier: `${config.ios?.bundleIdentifier ?? 'com.alexcheuk.fivethreeone'}${ID_SUFFIX}`,
  },
  android: {
    ...config.android,
    package: `${config.android?.package ?? 'com.alexcheuk.fivethreeone'}${ID_SUFFIX}`,
  },
});
