module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "../../node_modules/@ordzaar/standard-web-linter",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { project: ["./tsconfig.json"] },
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": "warn",
    "import/prefer-default-export": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "jsx-a11y/control-has-associated-label": "warn",
  },
};
