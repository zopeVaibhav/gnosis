import { config } from "@gnosis/eslint-config/base";

export default [
    ...config,
    {
        ignores: ["dist/**", "node_modules/**"],
    },
];
