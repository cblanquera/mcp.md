# TypeScript Style Guide

Comprehensive guidelines for writing consistent and maintainable TypeScript code. These standards cover formatting, typing, class structures, control flow, and error handling to ensure code is readable, reliable, and scalable. Following these rules promotes best practices and reduces bugs in TypeScript projects.

 1. [Formatting and Syntax Standards](#1-formatting-and-syntax-standards)
 2. [Import and Export Rules](#2-import-and-export-rules)
 3. [Type and Class Definitions](#3-type-and-class-definitions)
 4. [Control Flow and Naming Conventions](#4-control-flow-and-naming-conventions)
 5. [Error Handling and Runtime Practices](#5-error-handling-and-runtime-practices)

## 1. Formatting and Syntax Standards

These foundational rules ensure consistent code formatting for better readability.

### 1.1. Indentation and Spacing

Indentation and spacing **MUST** be uniform.

**Requirements:**

 - **MUST** use 2 spaces for indentation; tabs are not allowed.
 - **MUST** limit lines to 100 characters and break before reaching it.
 - **MUST** place spaces after commas, around operators, and around union/intersection pipes.

**Examples:**
```typescript
// ✅ Good
function sum(a: number, b: number): number {
  return a + b;
}

// ❌ Bad
function sum(a:number,b:number){return a+b;}
```

### 1.2. Semicolons and Quotes

Semicolons and quotes **MUST** follow strict rules.

**Requirements:**

 - **MUST** always use semicolons.
 - **MUST** use single quotes for strings.
 - **MUST** avoid double quotes unless necessary.

**Examples:**

```typescript
// ✅ Good
const name: string = 'Stackpress';

// ❌ Bad
const name = "Stackpress";
```

### 1.3. Braces and Blank Lines

Braces and blank lines **MUST** be handled consistently.

**Requirements:**

 - **MUST** place opening braces on the same line (K&R style).
 - **MUST** separate document blocks with exactly one blank line.
 - **MUST NOT** use multiple consecutive empty lines.

**Examples:**

```typescript
// ✅ Good
if (value) {
  doSomething();
}

// ❌ Bad
if (value)
{
    doSomething()
}
```

### 1.4. Trailing Commas and Lists

Trailing commas **MUST** be avoided.

**Requirements:**

 - **MUST NOT** use trailing commas in imports or parameter lists.
 - **MUST** ensure lists in documentation have at least two items.

## 2. Import and Export Rules

Imports and exports **MUST** be organized and formatted correctly.

### 2.1. Import Organization

Imports **MUST** be grouped by type.

**Requirements:**

 - **MUST** organize imports: node modules first (prefixed with 'node:'), then packages, then local.
 - **MUST** separate type imports from runtime imports.
 - **MUST** prefix native node modules with 'node:'.

**Examples:**
```javascript
// node
import type { IncomingMessage } from 'node:http';
import { resolve } from 'node:path';
import fs from 'node:fs';
// modules
import type { Request } from '@whatwg/fetch';
import { Mailer, send } from 'simple-mailer'; 
import mustache from 'mustache';
// local
import type { User, Auth } from '../types.js';
import { getUser } from './helpers';
import Session from './Session.js';
```

### 2.2. Export Formatting

Exports **MUST** end with semicolons.

**Requirements:**

 - **MUST** end all export blocks with a semicolon, even for functions or classes.

**Examples:**
```typescript
// ✅ Good
export const template = 'Hello %s';

// ✅ Good
export function getTemplate() {
  return template;
};

// ✅ Good
export default class Template {};

// ❌ Bad
export const welcome = 'Welcom %s';
```

## 3. Type and Class Definitions

Types and classes **MUST** be defined with explicit rules for consistency.

### 3.1. Object Types

Object types **MUST** use commas for separation.

**Requirements:**
 - **MUST** use commas to separate properties; no semicolons.
 - **MUST** prefer 'type' over 'interface' for object types.

**Examples:**
```typescript
// ✅ Good
type User = {
  name: string,
  age: number
};

// ❌ Bad
type Post = {
  title: string;
  detail: string;
};
```

### 3.2. Interfaces vs Types

Interfaces and types **MUST** be used appropriately.

**Requirements:**
 - **MUST** use 'interface' for class shapes that will be implemented.
 - **MUST** use 'type' for object properties, functions, and variables.

### 3.3. Generics and Annotations

Generics **MUST** default to 'unknown'.

**Requirements:**

 - **MUST** default generics to 'unknown'; avoid 'any'.
 - **MUST** format type annotations with no space before colon and one after.
 - **MUST** include spaces around '|' and '&' in unions/intersections.

### 3.4. Built-in Types Usage

Built-in types **MUST** be preferred.

**Requirements:**

 - **MUST** use Record, Omit, Pick, Partial, Required where appropriate.
 - **SHOULD** use these to keep types in sync with parent changes.

### 3.5. Function and Method Typing

Function types **MUST** be inferred where possible.

**Requirements:**

 - **MUST NOT** add argument or return types if inferable.
 - **MUST** use explicit access modifiers in classes.
 - **MUST** prefix protected/private methods with '_'.

## 4. Control Flow and Naming Conventions

Control flow and naming **MUST** be consistent.

### 4.1. Delegation

Delegation **MUST** be by shape.

**Requirements:**

 - **MUST** delegate based on input shape.
 - **SHOULD** return 'this' for chainable methods.

### 4.2. Naming Standards

Names **MUST** follow casing conventions.

**Requirements:**

 - **MUST** use PascalCase for classes/interfaces.
 - **MUST** use camelCase for functions/variables.
 - **MUST** use UPPER_SNAKE_CASE only for true constants.

### 4.3. Documentation

Documentation **MUST** use JSDoc for public members.

**Requirements:**

 - **MUST** explain 'why' in inline comments, not 'what'.

## 5. Error Handling and Runtime Practices

Errors and runtime **MUST** be handled strictly.

### 5.1. Error Throwing

Errors **MUST** be thrown with meaningful messages.

**Requirements:**

 - **MUST** throw Error or subclasses; never swallow errors.
 - **MUST** return typed results.

### 5.2. Runtime and Testing

Runtime **MUST** be strict ESM.

**Requirements:**

 - **MUST** use '.js' suffix for local imports.
 - **MUST** separate type and runtime imports.
 - **MUST** test async code with 'await'.
 - **SHOULD** use black-box testing for public APIs.
