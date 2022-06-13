module.exports = {
  extends: ["plugin:react/recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended", "plugin:css-modules/recommended", "plugin:storybook/recommended", "plugin:storybook/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true // Allows for the parsing of JSX

    }
  },
  plugins: ["@typescript-eslint", "css-modules"],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      }
    },
    react: {
      version: "detect" // Tells eslint-plugin-react to automatically detect the version of React to use

    }
  },
  // Fine tune rules
  rules: {
    "@typescript-eslint/no-var-requires": 0
  }
};