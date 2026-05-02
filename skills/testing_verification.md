---
name: testing-verification
description: Comprehensive testing and verification skills for the Nexus CV Generator application. Covers unit testing, integration testing, E2E testing, visual regression testing, and QA workflows.
---

This skill enables comprehensive testing and verification for the Nexus CV Generator. It covers all testing methodologies, quality assurance processes, and verification workflows.

The agent must understand that testing is critical for maintaining quality, catching bugs early, and ensuring reliable functionality across the application.

## Testing Philosophy

### Purpose-Driven Testing
- **Catch Bugs Early**: Test before deployment
- **Verify Functionality**: Confirm features work
- **Prevent Regression**: Don't break existing features
- **Document Behavior**: Tests document expected behavior

### Testing Pyramid
- **Unit Tests**: Individual function/component testing (base)
- **Integration Tests**: Module interaction testing (middle)
- **E2E Tests**: Full user flow testing (top)
- **Visual Tests**: UI/visual regression testing (throughout)

---

## 1. Test Structure & Organization (Plural)

### 1.1 Test File Organization
```
/tests
  /unit
    /components
    /lib
    /hooks
  /integration
    /api
    /workflows
  /e2e
    /flows
  /fixtures
    /mcs
    /jd
```

### 1.2 Naming Conventions
- **Unit Tests**: [component].test.tsx
- **Integration Tests**: [feature].test.ts
- **E2E Tests**: [flow].spec.ts
- **Test Data**: [type].json

### 1.3 Test Structure
```typescript
describe('Component/Function', () => {
  beforeEach(() => { /* setup */ });
  
  describe('expected behavior', () => {
    it('should do something', () => { /* test */ });
  });
  
  afterEach(() => { /* cleanup */ });
});
```

---

## 2. Unit Testing (Plural)

### 2.1 Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 2.2 Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react';

describe('useCVStore', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useCVStore());
    expect(result.current.mcs).toBeNull();
  });
  
  it('updates MCS', async () => {
    const { result } = renderHook(() => useCVStore());
    await act(async () => {
      await result.current.setMCS(mockMCS);
    });
    expect(result.current.mcs).toEqual(mockMCS);
  });
});
```

### 2.3 Utility Function Testing
```typescript
describe('formatDate', () => {
  it('formats MM/YYYY', () => {
    expect(formatDate('2024-01')).toBe('01/2024');
  });
  
  it('handles current date', () => {
    expect(formatDate('current')).toBe('Present');
  });
  
  it('handles invalid date', () => {
    expect(formatDate('invalid')).toBe('invalid');
  });
});

describe('calculateCompleteness', () => {
  it('returns 0 for empty MCS', () => {
    expect(calculateCompleteness(null)).toBe(0);
  });
  
  it('returns 100 for complete MCS', () => {
    expect(calculateCompleteness(completeMCS)).toBe(100);
  });
});
```

---

## 3. Integration Testing (Plural)

### 3.1 API Route Testing
```typescript
import { POST } from '@/app/api/ai/extract/route';

describe('POST /api/ai/extract', () => {
  it('extracts MCS from text', async () => {
    const request = new Request('http://localhost/api/ai/extract', {
      method: 'POST',
      body: JSON.stringify({ text: 'John Doe...', file: null }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.mcs).toBeDefined();
  });
  
  it('returns error for empty text', async () => {
    const request = new Request('http://localhost/api/ai/extract', {
      method: 'POST',
      body: JSON.stringify({ text: '', file: null }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

### 3.2 Store Integration
```typescript
describe('MCS Store', () => {
  it('persists across components', async () => {
    const { getByText } = render(
      <StoreProvider>
        <Setter name="John" />
        <Reader />
      </StoreProvider>
    );
    
    expect(getByText('John')).toBeInTheDocument();
  });
});
```

### 3.3 Workflow Testing
```typescript
describe('Profile Extraction Workflow', () => {
  it('extracts, validates, and offers edit', async () => {
    // 1. Submit text
    const extractResult = await extractProfile(sampleText);
    expect(extractResult.mcs).toBeDefined();
    
    // 2. Validate
    const validation = validateMCS(extractResult.mcs);
    expect(validation.isValid).toBe(true);
    
    // 3. Allow edit
    const editor = render(<Editor mcs={extractResult.mcs} />);
    expect(editor.getByText('Edit Profile')).toBeInTheDocument();
  });
});
```

---

## 4. E2E Testing (Plural)

### 4.1 User Flow Testing
```typescript
import { test, expect } from '@playwright/test';

test.describe('Profile Creation', () => {
  test('complete profile creation flow', async ({ page }) => {
    // 1. Navigate to app
    await page.goto('/');
    
    // 2. Click extract
    await page.click('text=Extract my profile');
    
    // 3. Enter text
    await page.fill('textarea', sampleProfileText);
    await page.click('text=Send');
    
    // 4. Wait for response
    await expect(page.locator('.bub')).toContainText('I extracted');
    
    // 5. Open editor
    await page.click('text=Open Editor');
    await expect(page.url()).toContain('/editor');
    
    // 6. Verify data
    await expect(page.locator('text=John Doe')).toBeInTheDocument();
  });
});
```

### 4.2 Navigation Testing
```typescript
test('navigation between pages', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Editor');
  await expect(page.url()).toContain('/editor');
  
  await page.click('text=JD Target');
  await expect(page.url()).toContain('/jd-targeting');
  
  await page.click('text=Export');
  await expect(page.url()).toContain('/export');
});
```

### 4.3 Forms & Inputs
```typescript
test('API key modal flow', async ({ page }) => {
  await page.goto('/');
  
  // Open modal
  await page.click('text=Set API Key');
  await expect(page.locator('.akm')).toBeVisible();
  
  // Fill form
  await page.fill('input[type="password"]', 'sk-test-key');
  await page.click('text=Save & Close');
  
  // Verify saved
  await expect(page.locator('.key-indicator')).toHaveClass(/set/);
});
```

---

## 5. Visual Regression Testing (Plural)

### 5.1 Screenshot Testing
```typescript
import { toMatchScreenshot } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage matches snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toMatchScreenshot('homepage.png');
  });
  
  test('editor page matches snapshot', async ({ page }) => {
    await page.goto('/editor');
    await expect(page).toMatchScreenshot('editor.png');
  });
});
```

### 5.2 Component Screenshots
```typescript
test('CVPreview component', async ({ page }) => {
  await page.goto('/export');
  
  // Render CV preview
  await expect(page.locator('.ex-cv')).toMatchScreenshot('cv-preview.png');
});
```

### 5.3 Responsive Testing
```typescript
test('responsive layouts', async ({ page }) => {
  // Desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page).toMatchScreenshot('desktop.png');
  
  // Tablet
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  await expect(page).toMatchScreenshot('tablet.png');
  
  // Mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page).toMatchScreenshot('mobile.png');
});
```

---

## 6. Test Data & Fixtures (Plural)

### 6.1 MCS Fixtures
```typescript
export const mockMCSComplete: MCS = {
  personal: {
    name: 'John Doe',
    title: 'Senior Software Engineer',
    email: 'john@example.com',
    phone: '+1-555-123-4567',
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/johndoe',
  },
  summary: 'Experienced engineer with 8+ years...',
  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'Tech Corp',
      startDate: '2020-01',
      current: true,
      bullets: [
        'Led team of 8 engineers',
        'Delivered key features',
      ],
    },
  ],
  skills: [
    { name: 'TypeScript', category: 'technical' },
    { name: 'React', category: 'technical' },
  ],
};

export const mockMCSMinimal: MCS = {
  personal: {
    name: 'Jane Doe',
    title: 'Engineer',
    email: 'jane@example.com',
  },
};
```

### 6.2 JD Fixtures
```typescript
export const mockJDSoftwareEng = `
Senior Software Engineer
Requirements:
- 5+ years experience with TypeScript, React
- Experience with cloud platforms (AWS, GCP)
- Strong problem-solving skills
...
`;

export const mockJDTechLead = `
Tech Lead
Requirements:
- 7+ years software development
- Experience leading teams
- Strong communication skills
...
`;
```

### 6.3 Test Utilities
```typescript
export function createMockMCS(overrides: Partial<MCS> = {}): MCS {
  return { ...mockMCSComplete, ...overrides };
}

export function createMockJD(overrides: Partial<string> = {}): string {
  return mockJDSoftwareEng;
}
```

---

## 7. Testing Utilities (Plural)

### 7.1 Custom Matchers
```typescript
expect.extend({
  toBeValidEmail(received) {
    const pass = /.+@.+\..+/.test(received);
    return {
      pass,
      message: pass ? '' : 'Not a valid email',
    };
  },
  toHaveCompleteProfile(received) {
    const { mcs } = received;
    const completeness = calculateCompleteness(mcs);
    const pass = completeness >= 80;
    return {
      pass,
      message: pass ? '' : `Profile only ${completeness}% complete`,
    };
  },
});
```

### 7.2 Test Helpers
```typescript
export async function waitForLoadingToFinish(page: Page) {
  await page.waitForSelector('.loading', { state: 'hidden' });
}

export async function fillProfileForm(page: Page, mcs: MCS) {
  await page.fill('input[name="name"]', mcs.personal.name);
  await page.fill('input[name="email"]', mcs.personal.email);
  // ...
}
```

---

## 8. QA Workflows (Plural)

### 8.1 Pre-Release QA
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] E2E flows work
- [ ] Visual regression checks pass
- [ ] Cross-browser testing passes
- [ ] Mobile responsive works

### 8.2 Feature QA
- [ ] Happy path works
- [ ] Error states handled
- [ ] Edge cases handled
- [ ] Loading states work
- [ ] Accessibility works
- [ ] Works offline

### 8.3 Regression QA
- [ ] Old features still work
- [ ] No performance regression
- [ ] No visual regression
- [ ] No accessibility regression

### 8.4 Browser Testing
```typescript
const browsers = ['chromium', 'firefox', 'webkit'];
browsers.forEach(browser => {
  test(`works in ${browser}`, async ({ page }) => {
    // test implementation
  });
});
```

---

## 9. Performance Testing (Plural)

### 9.1 Bundle Size
```typescript
import { build } from 'next build';
import { analyze } from 'source-map-explorer';

test('bundle size under limit', async () => {
  await build();
  const analysis = analyze('.next/static/**/*.js');
  
  Object.entries(analysis).forEach(([chunk, size]) => {
    if (size > 200 * 1024) {
      throw new Error(`Chunk ${chunk} exceeds 200KB limit`);
    }
  });
});
```

### 9.2 Page Load
```typescript
test('page loads under 3 seconds', async ({ page, performance }) => {
  const start = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - start;
  
  expect(loadTime).toBeLessThan(3000);
});
```

### 9.3 API Response
```typescript
test('API responds under 500ms', async () => {
  const start = Date.now();
  await fetch('/api/ai/extract', { ... });
  const responseTime = Date.now() - start;
  
  expect(responseTime).toBeLessThan(500);
});
```

---

## 10. Accessibility Testing (Plural)

### 10.1 Automated A11y Testing
```typescript
import { testA11y } from 'axe-core';

test('homepage has no accessibility violations', async ({ page }) => {
  const violations = await testA11y(page);
  expect(violations).toHaveLength(0);
});
```

### 10.2 Keyboard Navigation
```typescript
test.navigate with keyboard', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  // verify focus moves through elements
});
```

### 10.3 Screen Reader Testing
```typescript
test('screen reader works', async ({ page }) => {
  const announcement = await page.evaluate(() => {
    // Check ARIA live regions
  });
  expect(announcement).toBeTruthy();
});
```

---

## 11. Error Handling & Debugging (Plural)

### 11.1 Error Boundaries
```typescript
test('error boundary catches errors', () => {
  const consoleError = jest.spyOn(console, 'error');
  
  render(<ErrorBoundary><ComponentThatErrors /></ErrorBoundary>);
  
  expect(consoleError).toHaveBeenCalled();
  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
```

### 11.2 Network Error Handling
```typescript
test('handles API errors gracefully', async ({ page }) => {
  // Mock API failure
  await page.route('**/api/ai/**', route => route.abort('failed'));
  
  await page.click('text=Extract');
  await expect(page.locator('.toast')).toContainText('Error');
});
```

### 11.3 Console Errors
```typescript
test('no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  expect(errors).toHaveLength(0);
});
```

---

## 12. CI/CD Testing (Plural)

### 12.1 Test Commands
```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:visual": "playwright test --config=visual.config.ts",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

### 12.2 GitHub Actions
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run test:e2e
```

### 12.3 Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run test"
    }
  }
}
```

---

## 13. Quality Standards (Plural Checklists)

### 13.1 Unit Test Checklist
- [ ] Test all exports
- [ ] Test all branches
- [ ] Test error paths
- [ ] Mock external dependencies
- [ ] Keep tests fast (<100ms each)

### 13.2 E2E Test Checklist
- [ ] Cover critical paths
- [ ] Clean up test data
- [ ] Handle timeouts
- [ ] Run in parallel
- [ ] Retry flaky tests

### 13.3 Visual Test Checklist
- [ ] Test all breakpoints
- [ ] Test all themes
- [ ] Test all states
- [ ] Update baselines
- [ ] Review failures

### 13.4 Release Test Checklist
- [ ] All tests pass
- [ ] Performance acceptable
- [ ] Accessibility passes
- [ ] No console errors
- [ ] Works in all browsers

---

*This skill represents comprehensive testing and verification mastery. It ensures quality through unit, integration, E2E, visual, and accessibility testing across the application.*

*Test early, test often, ship with confidence.*