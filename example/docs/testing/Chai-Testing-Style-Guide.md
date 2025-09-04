# Mocha Chai Testing Style Guide

Comprehensive guidelines for writing unit tests using Mocha, Chai, and TypeScript. These standards emphasize clarity, determinism, type safety, and best practices to ensure reliable and maintainable tests. Adhering to these rules helps prevent flaky tests and promotes robust code verification.

 1. [General Testing Principles](#1-general-testing-principles)
 2. [Test Structure and Execution](#2-test-structure-and-execution)
 3. [Isolation and Determinism](#3-isolation-and-determinism)
 4. [Type Safety and Fixtures](#4-type-safety-and-fixtures)
 5. [Common Pitfalls and Solutions](#5-common-pitfalls-and-solutions)

## 1. General Testing Principles

These foundational rules ensure tests focus on behavior and maintain consistency.

### 1.1. Behavior Focus

Tests **MUST** assert behavior, not implementation details.

**Requirements:**

 - **MUST** test public APIs, outputs, and visible side-effects.
 - **MUST NOT** assert internal calls or private helpers.
 - **SHOULD** keep tests robust to refactors.

**Examples:**

```typescript
// ✅ Good: assert observable behavior
it("returns the sum of two numbers", () => {
  expect(add(2, 3)).to.equal(5);
});

// ❌ Bad: asserts internal calls (brittle)
it("calls internal helper function", () => {
  const spy = sinon.spy(math, "internalAdd");
  add(2, 3);
  expect(spy.calledOnce).to.equal(true);
});
```

### 1.2. Test Characteristics

Tests **MUST** be fast, isolated, and deterministic.

**Requirements:**

 - **MUST** avoid real network, FS, or time dependencies.
 - **MUST** standardize on Chai 'expect' with chai-as-promised and sinon-chai.
 - **SHOULD** remove unused variables and fix type errors before running tests.

## 2. Test Structure and Execution

Tests **MUST** follow structured patterns for execution and organization.

### 2.1. Async Handling

Async tests **MUST** use modern syntax.

**Requirements:**

 - **MUST** use async/await; no 'done' callbacks.
 - **MUST** return promises for async assertions.

**Examples:**

```typescript
// ✅ Good: use async/await or promise-returning assertions
it("resolves with correct value", async () => {
  await expect(doAsyncThing()).to.eventually.equal("ok");
});

// ❌ Bad: using done() manually
it("resolves with correct value", (done) => {
  doAsyncThing().then((v) => { expect(v).to.equal("ok"); done(); });
});
```

### 2.2. Suite Organization

Test suites **MUST** be discoverable and independent.

**Requirements:**

 - **MUST** use descriptive titles like describe("Calculator") and it("adds negatives").
 - **MUST** limit to one behavior theme per test.
 - **SHOULD** use beforeEach/afterEach for state; before/after for expensive setup.

## 3. Isolation and Determinism

Tests **MUST** be isolated to prevent contamination.

### 3.1. Sandbox Management

Sinon sandboxes **MUST** be used for isolation.

**Requirements:**

 - **MUST** create a sinon sandbox per test/suite.
 - **MUST** restore in afterEach to prevent side-effects.

**Examples:**

```typescript
let sandbox: sinon.SinonSandbox;

beforeEach(() => { sandbox = sinon.createSandbox(); });
afterEach(() => { sandbox.restore(); });

// Example: stubbing a dependency
it("logs a warning once", () => {
  const warn = sandbox.stub(logger, "warn");
  doThing();
  expect(warn).to.have.been.calledOnce;
});
```

### 3.2. Time and Randomness Control

Deterministic tests **MUST** control time and randomness.

**Requirements:**

 - **MUST** use fake timers for time-dependent code; restore after each test.
 - **MUST** stub randomness/UUIDs for consistent results.
 - **SHOULD** silence logs and use unique temp dirs per test.

**Examples:**

```typescript
// ✅ Good: fake the clock
it("expires after 1s", () => {
  const clock = sinon.useFakeTimers();
  const token = new Token();
  clock.tick(1000);
  expect(token.isExpired()).to.equal(true);
  clock.restore();
});
```

## 4. Type Safety and Fixtures

Tests **MUST** maintain type safety.

### 4.1. Type Handling

Types **MUST** avoid 'any'.

**Requirements:**

 - **MUST** catch errors as 'unknown' and narrow before asserting.
 - **MUST NOT** use 'any'; isolate if unavoidable.
 - **SHOULD** use 'satisfies' over 'as' for validation.

**Examples:**

```typescript
// ✅ Good: catch as unknown, then narrow
it("throws a TypeError", () => {
  try {
    mightThrow();
    expect.fail("should have thrown");
  } catch (err: unknown) {
    if (err instanceof TypeError) {
      expect(err.message).to.match(/invalid/);
    } else {
      throw err; // keep unknowns honest
    }
  }
});

// ❌ Bad: `any` erases type safety
it("throws a TypeError", () => {
  try { mightThrow(); } catch (err: any) {
    expect(err.message).to.match(/invalid/);
  }
});
```

### 4.2. Fixtures

Fixtures **MUST** be minimal and expressive.

**Requirements:**

 - **MUST** prefer typed factories/builders over static fixtures.
 - **SHOULD** use small, representative data to reduce noise.

**Examples:**

```typescript
type User = { id: string; name: string; email: string };

function makeUser(overrides: Partial<User> = {}): User {
  return { id: "u1", name: "Alice", email: "a@example.com", ...overrides };
}

// ✅ Good
it("creates user with default name", () => {
  const user = makeUser();
  expect(user.name).to.equal("Alice");
});
```

## 5. Common Pitfalls and Solutions

Avoid common issues to maintain test reliability.

### 5.1. Bad Practices Avoidance

Certain practices **MUST** be avoided.

**Requirements:**

 - **MUST NOT** commit '.only'; remove before commit.
 - **MUST NOT** test internals or use real dependencies.
 - **MUST** ensure no global state leakage or order dependence.

### 5.2. Configuration and Setup

Project setup **MUST** include proper configurations.

**Requirements:**

 - **MUST** enable strict TS options like 'strict', 'noImplicitAny'.
 - **SHOULD** use a separate tsconfig.test.json for testing types.
 - **SHOULD** install recommended packages like chai, sinon, nyc.
