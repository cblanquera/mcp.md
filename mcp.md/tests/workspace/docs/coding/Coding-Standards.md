# Coding Standards Style Guide

Comprehensive guidelines for maintaining consistent coding practices across projects. These standards ensure code readability, reduce eye strain, and promote collaboration by enforcing uniformity in formatting, naming, and management practices. Following these rules helps create maintainable codebases that are easy to understand and contribute to.

 1. [General Principles](#1-general-principles)
 2. [Formatting Standards](#2-formatting-standards)
 3. [Commenting and Documentation](#3-commenting-and-documentation)
 4. [Naming Conventions](#4-naming-conventions)
 5. [Project Management Practices](#5-project-management-practices)

## 1. General Principles

These foundational rules establish the overall approach to coding standards in projects.

### 1.1. Consistency Requirements

Consistency **MUST** be prioritized over personal preferences.

**Requirements:**

 - **MUST** study and match the existing project's coding style before contributing.
 - **MUST NOT** use personal standards that differ from the project's established patterns.
 - **SHOULD** maintain methodical, logical, and consistent syntax even if minor mistakes occur.
 - **SHOULD** propose improvements through questions or discussions when in doubt.

### 1.2. Collaboration Guidelines

Collaboration **MUST** focus on small, focused changes.

**Requirements:**

 - **MUST** keep pull requests small and focused on specific issues.
 - **SHOULD** avoid committing all unsaved changes blindly.
 - **MAY** ask questions or seek clarification on standards.

## 2. Formatting Standards

These standards ensure code is readable and prevents issues like horizontal scrolling.

### 2.1. Line Length

Line length **MUST** be limited to reduce eye strain.

**Requirements:**

 - **MUST** ensure every line of code does not exceed 80 characters.
 - **MUST** follow a consistent line breaking style to prevent horizontal scrolling.
 - **SHOULD** configure editors to show rulers at 72, 80, 100, 120 characters.

**Example Configuration (VSCode):**

```json
"editor.rulers": [72, 80, 100, 120]
```

**Examples:**
```javascript
// ✅ Good
import type { ErrorMap } from '../types.js';

// ❌ Bad - no spaces around braces
import type {ErrorMap} from '../types.js';

// ✅ Good - multi-line with trailing comma
import type { 
  ErrorMap,
  SchemaColumnInfo, 
  SchemaSerialOptions 
} from '../types.js';

// ❌ Bad - too long
import type { ErrorMap, SchemaColumnInfo, SchemaSerialOptions } from '../types.js';
```

### 2.2. Indentation

Indentation **MUST** use spaces consistently.

**Requirements:**

 - **MUST** use 2 spaces for all indents.
 - **MUST NOT** use 4 spaces or tabs for indents.

### 2.3. Quotes

Quotes **MUST** be used appropriately based on context.

**Requirements:**

 - **MUST** prefer single quotes (') for JavaScript strings.
 - **MUST** use template literals (`) for multiline strings or templating.
 - **MUST** use double quotes (") for HTML/JSX attributes.

### 2.4. Semicolons

Semicolons **MUST** be used to end statements where appropriate.

**Requirements:**

 - **MUST** end variable declarations and function calls with semicolons.
 - **MUST NOT** end conditional blocks, while/for loops (except do-while) with semicolons.
 - **MUST** end do-while loops with a semicolon.
 - **MUST** end exported variables with semicolons.
 - **MUST NOT** add semicolons to function declarations.

**Examples:**

```javascript
// ✅ Good
const name = 'John';

// ❌ Bad
const name = 'John'

// ✅ Good
if (true) {}

// ❌ Bad
if (true) {};
```

### 2.5. Spaces in Data Structures

Spaces **MUST** be used in non-empty arrays and objects.

**Requirements:**

 - **MUST** include spaces inside opening and closing braces for non-empty arrays and objects.
 - **MUST NOT** add spaces in empty arrays or objects.

**Examples:**

```javascript
// ✅ Good
const fooBar = [ 'foo', 'bar' ];

// ❌ Bad
const fooBar = ['foo','bar'];
```

## 3. Commenting and Documentation

Comments **MUST** be formatted correctly based on their purpose.

### 3.1. JSDoc Comments

JSDoc-style comments **MUST** be used for function documentation.

**Requirements:**

 - **MUST** use /* ... */ for JSDoc comments outside functions.
 - **MUST NOT** include @param in TypeScript JSDoc as it's inferred.
 - **MUST** use // for inline comments inside functions.

**Examples:**

```javascript
// ✅ Good
/**
 * Does the foobar
 */
function fooBar(foo: string) {}

// ❌ Bad
/**
 * Does the foobar
 * @param {string} foo
 */
function fooBar(foo: string) {}
```

### 3.2. Inline Comments

Inline comments **MUST** follow spacing rules.

**Requirements:**

 - **MUST** place explainer comments before the relevant code.
 - **MUST NOT** add a space after // for single-line comments.
 - **MAY** use spaces for multi-line comment blocks.
 - **SHOULD** use comments for directions or flows.

## 4. Naming Conventions

Names **MUST** be descriptive and follow casing rules.

### 4.1. Variable Naming

Variables **MUST** use camelCase.

**Requirements:**

 - **MUST** use nouns for values.
 - **MUST** avoid single letters or abbreviations.
 - **MAY** use prefixes like is, has, can for booleans.

### 4.2. Function Naming

Functions **MUST** use camelCase and verb phrasing.

**Requirements:**

 - **MUST** start with verbs or verb-noun phrases.

### 4.3. Class and Component Naming

Classes **MUST** use PascalCase.

**Requirements:**

 - **MUST** use nouns.

### 4.4. File and Folder Naming

Files and folders **MUST** use kebab-case, except for class/component exports.

**Requirements:**

 - **MUST** use PascalCase for files exporting classes or components.

## 5. Project Management Practices

These practices ensure proper handling of dependencies, secrets, and version control.

### 5.1. Git Commits

Commit messages **MUST** be clear and structured.

**Requirements:**

 - **MUST** start with a verb.
 - **MUST** be specific about changes.
 - **SHOULD** include (wip) for work in progress.
 - **SHOULD** reference GitHub issues.
 - **SHOULD** include time spent (e.g., 4h).

### 5.2. Dependencies

Dependencies **MUST** be managed carefully.

**Requirements:**

 - **MUST** only install necessary packages.
 - **MUST** remove unused packages.
 - **SHOULD** prefer native APIs over libraries.
 - **SHOULD** document non-obvious package usage.

### 5.3. Environment Variables

Secrets **MUST** be handled securely.

**Requirements:**

 - **MUST NOT** hardcode secrets or API keys.
 - **MUST** keep .env files out of version control.
