# Jest Testing Style Guide

Comprehensive guidelines for writing unit tests using Jest with TypeScript, including React-specific practices. These standards focus on clarity, determinism, maintainability, and type safety to ensure reliable tests. Following these rules helps create robust test suites that catch regressions early and support code evolution.

 1. [General Testing Principles](#1-general-testing-principles)
 2. [Test Organization and Execution](#2-test-organization-and-execution)
 3. [Type Safety and Fixtures](#3-type-safety-and-fixtures)
 4. [React-Specific Guidelines](#4-react-specific-guidelines)
 5. [Common Issues and Solutions](#5-common-issues-and-solutions)

## 1. General Testing Principles

These rules establish the core philosophy for effective testing.

### 1.1. Behavior Focus

Tests **MUST** focus on public behavior.

**Requirements:**

 - **MUST** test observable outputs and side-effects.
 - **MUST NOT** test private implementation details.
 - **SHOULD** ensure each test fails for one clear reason.

### 1.2. Test Characteristics

Tests **MUST** be independent and deterministic.

**Requirements:**

 - **MUST** mirror source file paths for test files.
 - **MUST** run in parallel without order dependence.
 - **MUST** keep tests fast and isolated.
 - **SHOULD** fix type errors and remove unused variables before running.

## 2. Test Organization and Execution

Tests **MUST** be well-structured for readability and maintenance.

### 2.1. Naming and Descriptions

Test names **MUST** be descriptive.

**Requirements:**

 - **MUST** use clear, specific descriptions for 'it' and 'describe'.
 - **SHOULD** avoid vague names like "test getUser".

**Examples:**

```typescript
// ✅ Good
it("returns null when user is not found", () => { ... });

// ❌ Bad
it("test getUser", () => { ... });
```

### 2.2. Isolation and Cleanup

State **MUST** be reset between tests.

**Requirements:**

 - **MUST** use beforeEach/afterEach for setup/teardown.
 - **MUST** avoid leaking state across tests.

**Examples:**
```typescript
beforeEach(() => jest.resetModules());
afterEach(() => jest.clearAllMocks());
```

### 2.3. Asynchrony Handling

Async operations **MUST** be handled properly.

**Requirements:**

 - **MUST** always await async code.
 - **SHOULD** prefer findBy queries or waitFor over timeouts.

**Examples:**
```typescript
// ✅ Good
await expect(service.doWork()).resolves.toEqual("done");

// ❌ Bad
setTimeout(() => expect(result).toBe("done"), 1000);
```

## 3. Type Safety and Fixtures

Tests **MUST** maintain strict type safety.

### 3.1. Type Usage

Types **MUST** be explicit and safe.

**Requirements:**

 - **MUST** use 'unknown' instead of 'any'; narrow types appropriately.
 - **MUST** respect strict TS rules.

**Examples:**
```typescript
// ✅ Good
function parse(input: unknown): number | null {
  if (typeof input === "string") return parseInt(input);
  return null;
}

// ❌ Bad
function parse(input: any): number | null {
  return parseInt(input);
}
```

### 3.2. Fixtures and Data

Fixtures **MUST** be created dynamically.

**Requirements:**

 - **MUST** use builders/factories for test data to avoid repetition.
 - **SHOULD** keep data minimal and relevant.

**Examples:**
```typescript
// ✅ Good
const makeUser = (overrides: Partial<User> = {}): User => ({
  id: "u1",
  name: "Test User",
  email: "test@example.com",
  ...overrides,
});
```

## 4. React-Specific Guidelines

React tests **MUST** simulate user interactions.

### 4.1. Testing Approach

Tests **MUST** use React Testing Library.

**Requirements:**

 - **MUST** test observable DOM and interactions.
 - **MUST NOT** use shallow rendering.
 - **SHOULD** assert like a user would.

**Examples:**
```tsx
// ✅ Good
render(<LoginForm />);
expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();

// ❌ Bad
const wrapper = shallow(<LoginForm />);
expect(wrapper.find("button").prop("disabled")).toBe(true);
```

### 4.2. Interactions and Effects

Interactions **MUST** be realistic.

**Requirements:**

 - **MUST** use @testing-library/user-event for events.
 - **MUST** test effects via observable behavior, not internals.

**Examples:**
```tsx
// ✅ Good
await userEvent.type(screen.getByRole("textbox"), "hello");
await userEvent.click(screen.getByRole("button", { name: /go/i }));
```

## 5. Common Issues and Solutions

Address frequent problems to maintain test integrity.

### 5.1. Bad Practices Avoidance

Certain practices **MUST** be avoided.

**Requirements:**

 - **MUST NOT** over-mock or use brittle selectors.
 - **MUST NOT** rely on unseeded randomness or large snapshots.
 - **SHOULD** assert explicit expectations over snapshots.

### 5.2. Configuration and CI

Setup **MUST** support coverage and fast feedback.

**Requirements:**

 - **MUST** track coverage with meaningful thresholds.
 - **MUST** ensure tests pass in isolation across Node versions.
 - **SHOULD** keep tests under 100ms each.
