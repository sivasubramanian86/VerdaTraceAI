import '@testing-library/jest-dom';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

expect.extend(toHaveNoViolations);

// Configure axe to suppress known false positives in jsdom environment
export const axe = configureAxe({
  rules: {
    // jsdom does not render CSS so color-contrast is always a false positive
    'color-contrast': { enabled: false },
  },
});
