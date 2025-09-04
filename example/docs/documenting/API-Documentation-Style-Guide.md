# API Documentation Style Guide

API documentation **MUST** follow additional specific requirements beyond general documentation guidelines. These requirements ensure consistency, completeness, and usability across all API documentation.

## 1. File Organization

API documentation **MUST** be organized in a specific file structure.

**Requirements:**

 - **MUST** use separate markdown files for each major component or class
 - **MUST** place API documentation files in an `api/` directory
 - **MUST** include an `api/README.md` file as the main API reference
 - **SHOULD** use descriptive filenames matching class names (e.g., `Server.md`, `Router.md`)
 - **MUST** maintain consistent directory structure across projects

## 2. Class Documentation Structure

API classes **MUST** follow a specific structure and format.

````markdown
# ClassName

Description of the class and its purpose. This MUST explain what the class does,
its role in the framework, and when developers should use it.

```typescript
import { ClassName } from '@package/name';

// Example instantiation showing typical usage
const instance = new ClassName(options);
```

 1. [Properties](#1-properties)
 2. [Methods](#2-methods)
 3. [Static Methods](#3-static-methods)
 4. [Integration Examples](#4-integration-examples)

## 1. Properties

The following properties are available when instantiating a ClassName.

| Property | Type | Description |
|----------|------|-------------|
| `property` | `Type` | Description of what this property contains and its purpose |

## 2. Methods

The following methods are available when instantiating a ClassName.

### 2.1. Method Name

Description of what the method does and when to use it.

```typescript
const result = instance.methodName(param1, param2);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `param1` | `string` | Description of parameter and its purpose |
| `param2` | `number` | Description of parameter (optional, default: 0) |

**Returns**

Description of what the method returns and the return type.
````

**Requirements:**

 - **MUST** include class description after title (1-3 paragraphs)
 - **MUST** include example instantiation with import statement
 - **MUST** use numbered table of contents with linked anchors
 - **MUST** separate Properties, Methods, and Static Methods sections
 - **MUST** include integration examples section
 - **SHOULD** focus on public API only
 - **MUST NOT** document protected or private members

## 3. Method Documentation Standards

All methods **MUST** be documented with specific formatting and content requirements.

**Method Section Structure:**

````markdown
### X.Y. Method Name

Description of what the method does, when to use it, and any important behavior.

```typescript
// Show realistic usage example
const result = instance.methodName(param1, param2);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `param1` | `string` | Clear description of parameter purpose |
| `param2` | `number` | Description with optional/default notation |

**Returns**

Clear description of return value and type.
````

**Requirements:**

 - **MUST** use numbered subsection headers (2.1., 2.2., etc.)
 - **MUST** include descriptive method name in header
 - **MUST** provide clear description of method purpose
 - **MUST** include realistic code example
 - **MUST** use parameter tables for methods with parameters
 - **MUST** describe return values (avoid tables for returns)
 - **SHOULD** indicate optional parameters in description
 - **SHOULD** include default values when applicable

## 4. Parameter Tables

Parameter documentation **MUST** follow specific table formatting requirements.

**Table Structure:**

```markdown
**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `name` | `string` | Parameter description |
| `options` | `ConfigObject` | Configuration object (optional) |
| `callback` | `Function` | Callback function (optional, default: null) |
```

**Requirements:**

 - **MUST** use "Parameters" as bold header
 - **MUST** include Parameter, Type, and Description columns
 - **MUST** use backticks around parameter names and types
 - **MUST** indicate optional parameters in description
 - **SHOULD** include default values in description
 - **SHOULD** provide meaningful descriptions, not just type information
 - **MUST** use consistent formatting across all parameter tables

## 5. Return Value Documentation

Return values **MUST** be documented consistently without using tables.

**Format:**
```markdown
**Returns**

Description of what the method returns, including the type and any important details
about the return value's structure or behavior.
```

**Requirements:**

 - **MUST** use "Returns" as bold header
 - **MUST** describe both type and purpose of return value
 - **MUST NOT** use tables for return value documentation
 - **SHOULD** explain return value structure for complex objects
 - **SHOULD** mention when methods return the instance for chaining
 - **MUST** indicate when methods return promises

## 6. Code Examples

API documentation **MUST** include comprehensive, practical code examples.

**Example Categories:**

 - **Basic Usage**: Simple, common use cases
 - **Advanced Usage**: Complex scenarios and configurations
 - **Integration Examples**: How the API works with other components
 - **Error Handling**: Proper error handling patterns

````markdown
### X.Y. Basic HTTP Server

The following example shows how to create a basic HTTP server.

```typescript
import { server } from '@stackpress/ingest/http';

const app = server();

app.get('/', (req, res) => {
  res.setHTML('<h1>Hello World!</h1>');
});

app.create().listen(3000, () => {
  console.log('Server running on port 3000');
});
```
````

**Requirements:**

 - **MUST** provide working, complete code examples
 - **MUST** include import statements in examples
 - **MUST** demonstrate typical use cases
 - **SHOULD** include error handling where appropriate
 - **MUST** use realistic variable names and values
 - **SHOULD** include comments explaining non-obvious code
 - **MUST** be tested and verified to work
 - **SHOULD** progress from simple to complex examples

## 7. Type Safety Documentation

When applicable (ie. documenting about TypeScript), API documentation **MUST** address TypeScript usage and type safety.

**Requirements:**

 - **MUST** show TypeScript examples with proper typing
 - **SHOULD** document generic type parameters
 - **MUST** include type information in parameter tables
 - **SHOULD** show interface definitions for complex types
 - **MUST** demonstrate type-safe usage patterns

**Example:**

````markdown
## 3. Type-Safe Configuration

The following example shows how to use type-safe configuration.

```typescript
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
}

const app = server<DatabaseConfig>();
app.config.set('database', {
  host: 'localhost',
  port: 5432,
  database: 'myapp'
});
```
````

## 8. Cross-References and Integration

API documentation **MUST** include proper cross-references and integration guidance.

**Requirements:**

 - **MUST** link to related classes and methods
 - **SHOULD** reference relevant examples and guides
 - **MUST** explain how components work together
 - **SHOULD** link to external documentation when appropriate
 - **MUST** maintain working links across documentation

**Example:**

```markdown
For complete routing examples, see [Router Documentation](./Router.md).
For plugin development, see [Plugin Development Guide](../plugin-development.md).
```

## 9. Consistency Requirements

All API documentation **MUST** maintain strict consistency across files.

**Terminology:**

 - **MUST** use consistent terminology throughout all documentation
 - **MUST** use the same method names and signatures as the actual code
 - **SHOULD** maintain consistent voice and tone
 - **MUST** use consistent formatting patterns

**Structure:**

 - **MUST** follow the same section ordering across all API files
 - **MUST** use consistent header numbering
 - **MUST** maintain consistent table formatting
 - **MUST** use consistent code example formatting

## 10. Accessibility and Usability

API documentation **MUST** be accessible and user-friendly.

**Requirements:**

 - **MUST** use descriptive section headers
 - **SHOULD** include table of contents for navigation
 - **MUST** provide clear, scannable structure
 - **SHOULD** include search-friendly content
 - **MUST** work well with documentation generators
 - **SHOULD** be optimized for both reading and reference use

## 11. Maintenance and Updates

API documentation **MUST** be kept synchronized with code changes.

**Requirements:**

 - **MUST** update documentation when API changes
 - **MUST** verify examples work with current code
 - **SHOULD** include version information when relevant
 - **MUST** maintain backward compatibility notes
 - **SHOULD** document deprecation warnings
 - **MUST** remove documentation for deleted features

## 12. Quality Validation

API documentation **MUST** meet specific quality standards.

**Validation Checklist:**

 - **MUST** verify all code examples compile and run
 - **MUST** check all internal links work correctly
 - **MUST** ensure parameter tables match actual method signatures
 - **MUST** validate return value descriptions are accurate
 - **SHOULD** have technical accuracy reviewed by code authors
 - **MUST** ensure consistency with project coding standards