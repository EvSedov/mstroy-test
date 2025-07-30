module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json", "ts"],
  roots: ["<rootDir>/src"],
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
  collectCoverageFrom: ["src/**/*.{ts,js}", "!src/**/*.d.ts"],
};
