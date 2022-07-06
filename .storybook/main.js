module.exports = {
  stories: [
    "../src/client/stories/*.stories.mdx",
    "../src/client/stories/*.stories.@(js|jsx|ts|tsx)",
  ],
  staticDirs: [
    "../src/client/stories/assets"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/preset-scss",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: "@storybook/react",
  core: {
    builder: "webpack5",
  },
};
