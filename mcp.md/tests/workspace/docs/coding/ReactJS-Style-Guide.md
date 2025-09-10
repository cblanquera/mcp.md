# ReactJS Style Guide

Comprehensive guidelines for writing consistent and maintainable ReactJS code. These standards promote readability, efficient code organization, and best practices for component development. By following these rules, developers can create scalable React applications that are easy to understand and collaborate on.

 1. [Component Formatting](#1-component-formatting)
 2. [Code Organization](#2-code-organization)
 3. [File Structure and Hooks](#3-file-structure-and-hooks)

## 1. Component Formatting

These rules ensure consistent formatting in React components for better readability.

### 1.1. Wrapping Components

Components **MUST** be wrapped in parentheses when returning JSX.

**Requirements:**

 - **MUST** wrap single-line returns in parentheses.
 - **MUST** use parentheses for multi-line JSX returns.
 - **SHOULD** maintain consistent indentation in multi-line returns.

**Examples:**

```javascript
// ✅ Good
const AsideMenu = () => (<aside>...</aside>);

// ❌ Bad
const AsideMenu = () => <aside>...</aside>;

// ✅ Good
function LeftMenu() {
  return (<div>...</div>);
}

// ✅ Good
function LeftMenu() {
  return (
    <div>...</div>
  );
}

// ❌ Bad
function LeftMenu() {
  return <div>...</div>;
}
```

### 1.2. Prop Spacing

Prop definitions **MUST** be spaced for readability.

**Requirements:**

 - **MUST** separate complex prop types into separate definitions when possible.
 - **SHOULD** use inline destructuring for simple props.
 - **MUST** format multi-line prop objects with proper indentation.

**Examples:**

```javascript
// ✅ Good
function LeftMenu(props: LeftMenuProps) {
  // props
  const { items, active, error } = props;
}

// ✅ Okay
function LeftMenu(props: { items: string[] }) {}

// ✅ Okay
function LeftMenu({ items }: { items: string[] }) {}

// ✅ Okay
function LeftMenu({ items, active, error }: {
  items: string[],
  active: string,
  error?: string
}) {
  // ...
}

// ❌ Bad
function LeftMenu({
  items,
  active,
  error
}: {
  items: string[],
  active: string,
  error?: string
}) {
  // ...
}
```

## 2. Code Organization

Code within components **MUST** follow a specific order for maintainability.

### 2.1. Organization Outline

Components **MUST** organize code in a logical sequence.

**Requirements:**

 - **MUST** follow this order: props, hooks, variables, handlers, effects, render.
 - **SHOULD** keep related logic grouped together.
 - **MUST NOT** intermix sections arbitrarily.

**Examples:**
```typescript
function LeftMenu(props: LeftMenuProps) {
  // 1. props
  const { items, error, show, active } = props;
  // 2. hooks
  const [ opened, open ] = useState(show);
  const [ selected, select ] = useState(active);
  // 3. variables
  const icon = opened ? 'chevron-down': 'chevron-left';
  // 4. handlers
  const toggle = () => open(opened => !opened);
  // 5. effects
  useEffect(() => {
    error && notify('error', error);
  }, []);
  // 6. render
  return (
    <aside>...</aside>
  );
}
```

## 3. File Structure and Hooks

File organization and hook usage **MUST** promote reusability and modularity.

### 3.1. Aggregate Hooks

Hooks **SHOULD** be aggregated into custom hooks for complex logic.

**Requirements:**

 - **SHOULD** create wrapper hooks for multiple related hooks.
 - **MUST** return usable variables from aggregate hooks.
 - **SHOULD** keep aggregate hooks in the same file as the component if not reusable.

**Examples:**
```javascript
function useLeftMenu(config: LeftMenuProps) {
  // 1. config
  const { items, error, show, active } = config;
  // 2. hooks
  const [ opened, open ] = useState(show);
  const [ selected, select ] = useState(active);
  // 3. variables
  const icon = opened ? 'chevron-down': 'chevron-left';
  // 4. handlers
  const toggle = () => open(opened => !opened);
  // 5. effects
  useEffect(() => {
    error && notify('error', error);
  }, []);
  // 6. Return usable variables
  return { opened, icon, toggle };
}

function LeftMenu(props: LeftMenuProps) {
  // 1. hooks
  const { opened, icon, toggle } = useLeftMenu(props);
  // 2. render
  return (
    <aside>...</aside>
  );
}
```

### 3.2. File Structure Options

Files **MUST** be organized to separate reusable and non-reusable elements.

**Requirements:**

 - **MUST** place reusable components in a 'components' folder.
 - **MUST** place reusable hooks in a 'hooks' folder.
 - **MUST** keep non-reusable components and hooks in the same file as their parent.
 - **SHOULD** keep contexts and providers in the same file.
