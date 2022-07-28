const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-ts");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "insomnia",
    projectName: "kayak-strava-utility",
    webpackConfigEnv,
    argv,
  });

  return merge(defaultConfig, {});
};
