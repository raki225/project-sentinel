import nextConfig from "eslint-config-next"

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // Flags standard mount-flag / fetch-on-mount / reset-on-prop-change effects
      // (e.g. next-themes hydration guard, polling live data) as errors even though
      // they're correct outside a React Compiler codebase. Not adopting the compiler here.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]

export default eslintConfig
