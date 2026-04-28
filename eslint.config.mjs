import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // JavaScript/ES6+ Rules
      "no-console": "warn",
      "no-debugger": "error",
      "no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      
      // React/Next.js Rules
      "react/prop-types": "off", // Not using PropTypes
      "react/react-in-jsx-scope": "off", // Next.js auto-imports React
      "react/jsx-uses-react": "off", // Next.js auto-imports React
      "@next/next/no-img-element": "warn", // Allow img for now, but warn
      
      // Code Quality Rules
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "brace-style": ["error", "1tbs"],
      "comma-dangle": ["error", "never"],
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "indent": ["error", 2],
      "max-len": ["warn", { 
        "code": 100, 
        "ignoreUrls": true, 
        "ignoreStrings": true 
      }],
      
      // Performance Rules
      "react-hooks/exhaustive-deps": "warn",
      
      // Security Rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error"
    },
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly"
      }
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
];

export default eslintConfig;
