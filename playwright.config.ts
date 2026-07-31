import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.pl\.tsx?$/,
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npx webpack serve --mode development --no-open',
    url: 'http://localhost:4000',
    reuseExistingServer: true,
    timeout: 120_000
  }
});
