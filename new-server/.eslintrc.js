module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser for TypeScript
  extends: [
    "eslint:recommended", // Use the recommended rules from eslint
    "plugin:@typescript-eslint/recommended", // Use the recommended rules from @typescript-eslint/eslint-plugin
  ],
  parserOptions: {
    ecmaVersion: "latest", // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  rules: {
    // Place any custom rules here
    semi: ["error", "always"],
  },
};
