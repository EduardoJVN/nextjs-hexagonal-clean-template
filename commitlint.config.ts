import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // new feature
        "fix", // bug fix
        "docs", // documentation only
        "style", // formatting, no logic change
        "refactor", // neither fix nor feature
        "test", // adding or updating tests
        "chore", // build process, tooling, deps
        "perf", // performance improvement
        "ci", // CI/CD configuration
        "revert", // revert a previous commit
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 100],
  },
};

export default config;
