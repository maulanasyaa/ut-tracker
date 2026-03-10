import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/test/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/main/logic.js'],
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines:      80,
        functions:  80,
        branches:   75,
        statements: 80
      }
    }
  }
})
