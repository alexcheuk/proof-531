const { withAppBuildGradle } = require('expo/config-plugins');

// Android lint runs only on release builds (`lintVitalAnalyzeRelease`), and it
// crashes with a Metaspace OOM while analyzing third-party Kotlin (e.g.
// react-native-screens). Our real quality gates are typecheck + biome + jest;
// Android lint over dependency code is pure overhead here, so turn it off for
// release builds rather than feeding the lint daemon more memory.
const LINT_BLOCK = `    lint {
        checkReleaseBuilds false
        abortOnError false
    }`;

module.exports = function withDisableReleaseLint(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error(
        `withDisableReleaseLint: expected a groovy build.gradle, got ${cfg.modResults.language}`,
      );
    }
    if (cfg.modResults.contents.includes('checkReleaseBuilds false')) {
      return cfg;
    }
    cfg.modResults.contents = cfg.modResults.contents.replace(
      /^android \{/m,
      (match) => `${match}\n${LINT_BLOCK}`,
    );
    return cfg;
  });
};
