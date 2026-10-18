import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";

// eslint-config-next 15 ships CommonJS `.eslintrc`-shaped objects with no
// `exports` map, so two things are true here: Node's ESM resolver will not add
// the file extension for us, and the result needs FlatCompat to become a flat
// config array. Importing them directly throws "nextVitals is not iterable".
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        // Type-aware rules below (`strict-boolean-expressions`,
        // `no-floating-promises`) need a Program from the type checker, not
        // just a parse tree. Without this, ESLint throws "You have used a rule
        // which requires type information" on the first file it touches.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Type-aware rules. `recommended-type-checked` is not flat-config friendly,
      // so the load-bearing rules are enabled explicitly.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        { allowString: false, allowNumber: false },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      // `require-await` is deliberately OFF. Next.js types `next.config.ts`
      // hooks such as `headers()` as async, so an implementation with nothing
      // to await is correct and required by the type contract. The rule
      // cannot tell that apart from a genuinely pointless `async`.
      "@typescript-eslint/require-await": "off",

      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportNamedDeclaration:not([declaration])",
          message:
            "Re-exporting without a local binding breaks Next's module analysis for route-level code splitting. Import, then re-export by name.",
        },
      ],
    },
  },

  {
    // No React hooks in server components.
    files: ["src/app/**/*.tsx", "src/components/**/*.tsx"],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Tests get more permissive typing.
  {
    files: ["src/**/__tests__/**/*.{ts,tsx}", "**/*.{test,spec}.{ts,tsx}"],
    rules: {
      "@typescript-eslint/strict-boolean-expressions": "off",
      "no-console": "off",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "pnpm-lock.yaml",
    "src/generated/**",
  ]),
]);
