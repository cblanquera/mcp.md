# Markdown Documentation Guidelines

Comprehensive guidelines for writing consistent, well-structured markdown documentation based on established documentation standards and best practices.

 1. [Document Structure Requirements](#1-document-structure-requirements)
 2. [Content Organization](#2-content-organization)
 3. [Formatting Standards](#3-formatting-standards)
 4. [API Documentation Specific Requirements](#4-api-documentation-specific-requirements)
 5. [Code Examples and Snippets](#5-code-examples-and-snippets)
 6. [Cross-References and Navigation](#6-cross-references-and-navigation)
 7. [Quality Assurance](#7-quality-assurance)
 8. [Best Practices](#8-best-practices)

## 1. Document Structure Requirements

The following requirements define the mandatory structure for all markdown documentation.

### 1.1. Title and Description

Every document **MUST** start with a single H1 title followed by a description.

```markdown
# Document Title

Description of what the document covers. This MUST be 1-3 paragraphs that 
summarize the main subjects covered in the document.
```

**Requirements:**

 - The title **MUST** be descriptive and specific
 - The description **MUST** be between 1-3 paragraphs
 - The description **SHOULD** mention the main subjects as a guide
 - Longer descriptions **MUST** be split into main subjects

> You can add an any number of Document Blocks between and/or below paragraphs.

### 1.2. Table of Contents

Every document **MUST** include a table of contents before the first main subject.

```markdown
 1. [Main Subject 1](#1-main-subject-1)
 2. [Main Subject 2](#2-main-subject-2)
 3. [Main Subject 3](#3-main-subject-3)
```

**Requirements:**

 - **MUST** use numbered list format with space before number
 - **MUST** include linked anchors to sections
 - **SHOULD** cover all main subjects (H2 headers)
 - **MAY** include subsections for complex documents

### 1.3. Main Subjects

Every document **MUST** have at least 2 main subjects (H2 headers).

> Documents can have more than 2 main subjects.

```markdown
## 1. Main Subject 1

Description of the main subject. This MUST summarize what will be covered
in this section using 1-3 paragraphs.

### 1.1. Supporting Point 1

Description of the supporting point...

### 1.2. Supporting Point 2

Description of the supporting point...

## 2. Main Subject 2

Description of the second main subject...
```

**Requirements:**

 - **MUST** use numbered outline system (1., 2., 3., 4.)
 - **MUST** have AT LEAST 2 main subjects per document
 - Each main subject **MUST** have a description (1-3 paragraphs)
 - **MUST** follow the "at least two" rule for subsections

### 1.4. Outline Numbering System

All headers **MUST** follow a consistent numbering system.

```markdown
## 1. Main Subject
### 1.1. Supporting Point
#### 1.1.1. Sub-Supporting Point
#### 1.1.1.1. Sub-Sub-Supporting Point
##### 1.1.1.1.1. Sub-Sub-Sub-Supporting Point
##### 1.1.1.2.1. Sub-Sub-Sub-Supporting Point
#### 1.1.1.2. Sub-Sub-Supporting Point
#### 1.1.2. Sub-Supporting Point
### 1.2. Supporting Point
## 2. Main Subject
```

**Requirements:**

 - **MUST** use only numbers separated by dots
 - **MUST** end outline IDs with a period
 - **MUST NOT** exceed 5 levels of nesting (1.2.3.4.5. is maximum)
 - **MUST** maintain sequential numbering

## 2. Content Organization

The following guidelines ensure logical and consistent content organization.

### 2.1. Section Descriptions

Every section header **MUST** be followed by a description.

**Requirements:**
 - **MUST** add description after every title and topic
 - **MUST** use 1-3 paragraphs for descriptions
 - **SHOULD** summarize or paraphrase the content to follow
 - Longer content **MUST** be split into supporting points

### 2.2. The "At Least Two" Rule

When adding subsections, you **MUST** have at least 2 items.

**Requirements:**

 - If there's a 1, there **MUST** be a 2
 - If you cannot create a second item, **MUST** move content to parent section
 - This applies to headers, bullet lists, and numbered lists

### 2.3. Document Blocks

All content **MUST** be organized into properly separated document blocks.

````markdown
This is a paragraph block.

 - This is a bullet list block
 - With proper spacing

This is another paragraph block.

```typescript
// This is a code block
const example = 'value';
```

Another paragraph block.
````

**Requirements:**

 - Document blocks **MUST** be separated by one empty line
 - **MUST NOT** use multiple consecutive empty lines
 - **MUST** include paragraphs, lists, code blocks, alerts, etc.

## 3. Formatting Standards

The following standards ensure consistent formatting across all documentation.

### 3.1. Lists

Lists **MUST** follow specific formatting requirements.

**Bullet Lists:**

```markdown
 - Always add a space before and after the dash
 - Bullet points MUST be short (1-3 sentences)
 - MUST have at least 2 bullet points
 - MAY prefix with emojis for visual appeal
```

**Numbered Lists:**

```markdown
 1. Always add a space after the period
 2. Number points MUST be short (1-3 sentences)
 3. MUST have at least 2 numbered points
 4. MAY prefix with emojis for visual appeal
```

**Requirements:**

 - **MUST** use proper spacing as shown above
 - **MUST** keep items short (1-3 sentences)
 - **MUST** have at least 2 items in any list
 - **SHOULD** use parallel structure in list items

### 3.2. Code Blocks

Code blocks **MUST** follow specific formatting requirements.

````markdown
```typescript
// Code example here
const example = 'value';
```

````

**Requirements:**

 - **MUST** specify language for syntax highlighting
 - **MUST** end with ``` followed by an empty line
 - **SHOULD** include relevant comments
 - **MUST** be complete and functional examples

### 3.3. Alerts and Callouts

Alerts **MUST** follow a specific format when used.

```markdown
> INFO: Tag alerts like log levels followed by a colon. You can also add 
> the relative emoji so it looks better.

> WARNING: ⚠️ This is a warning message.

> ERROR: ❌ This indicates an error condition.
```

**Requirements:**

 - **MUST** tag with log levels (INFO, WARNING, ERROR, NOTICE, HINT, TIP)
 - **MUST** follow tag with a colon
 - **SHOULD** include relevant emoji
 - **MUST** be separated by empty lines

### 3.4. Labels and Emphasis

Labels and emphasis **MUST** be formatted consistently.

```markdown
**Example**

This is a label, not a header.

**Usage**

Another label showing usage.
```

**Requirements:**

 - Labels **MUST** be bold (double asterisk)
 - Labels **MUST NOT** be headers (no # prefix)
 - **MUST** be separated by empty lines
 - **SHOULD** use "Example", "Usage", "Note" as common labels

## 4. Code Examples and Snippets

Code examples **MUST** meet specific quality standards.

### 4.1. Language Specification

All code blocks **MUST** specify the programming language.

````markdown
```typescript
const example: string = 'TypeScript example';
```

```javascript
const example = 'JavaScript example';
```

```json
{
  "example": "JSON example"
}
```

```bash
# Bash example
npm install package
```
````

**Requirements:**

 - **MUST** declare language for syntax highlighting
 - **SHOULD** use appropriate language for context
 - **MUST** be syntactically correct
 - **SHOULD** include relevant comments

### 4.2. Example Quality

Code examples **MUST** be high quality and practical.

**Requirements:**

 - **MUST** be complete and functional
 - **SHOULD** demonstrate real-world usage
 - **MUST** include error handling where relevant
 - **SHOULD** follow project coding standards
 - **MUST** be tested and verified

### 4.3. Code Comments

Code examples **SHOULD** include helpful comments.

```typescript
// Configure the server with options
const server = createServer({
  port: 3000,
  host: 'localhost'
});

// Start listening for requests
server.listen(() => {
  console.log('Server started successfully');
});
```

**Requirements:**

 - **SHOULD** explain non-obvious code
 - **MUST** be concise and relevant
 - **SHOULD** explain the purpose, not just what the code does
 - **MUST NOT** over-comment obvious operations

## 5. Cross-References and Navigation

Documentation **MUST** provide clear navigation and cross-references.

### 5.1. Internal Links

Links to other sections **MUST** use proper anchor format.

```markdown
See [Section 2.1](#21-subsection-name) for more details.

For complete API reference, see [API Documentation](./api/README.md).
```

**Requirements:**

 - **MUST** use lowercase with hyphens for anchors
 - **SHOULD** link to related sections
 - **MUST** verify links are working
 - **SHOULD** provide context for external links

### 5.2. File Organization

Documentation files **MUST** be organized logically.

**Requirements:**

 - **SHOULD** group related documentation together
 - **MUST** use descriptive filenames
 - **SHOULD** maintain consistent directory structure
 - **MUST** update navigation when adding new files
 - **MUST** put API related documents (more than one) in an `api` folder
 - **MUST** put example documents (more than one) in a `examples` folder

### 5.3. Table of Contents Links

Table of contents **MUST** use proper linking format.

```markdown
 1. [Main Subject](#1-main-subject)
 2. [Another Subject](#2-another-subject)
```

**Requirements:**

 - **MUST** use numbered list format with space before number
 - **MUST** include anchor links to sections
 - **MUST** match section headers exactly
 - **SHOULD** be updated when sections change

## 6. Quality Assurance

All documentation **MUST** meet quality standards before publication.

### 6.1. Content Review

Documentation **MUST** be reviewed for accuracy and completeness.

**Requirements:**

 - **MUST** verify all code examples work
 - **MUST** check all links are functional
 - **SHOULD** have technical accuracy reviewed
 - **MUST** ensure consistency with project standards

### 6.2. Formatting Validation

Documentation **MUST** be validated for proper formatting.

**Requirements:**

 - **MUST** follow outline numbering system
 - **MUST** have proper spacing and empty lines
 - **MUST** use consistent formatting throughout
 - **SHOULD** be validated with markdown linters

### 6.3. Accessibility

Documentation **SHOULD** be accessible to all users.

**Requirements:**

 - **SHOULD** use descriptive link text
 - **SHOULD** provide alt text for images
 - **MUST** use proper heading hierarchy
 - **SHOULD** ensure good contrast in examples

## 7. Best Practices

The following best practices **SHOULD** be followed for optimal documentation.

### 7.1. Writing Style

Documentation **SHOULD** use clear, concise language.

**Guidelines:**

 - **SHOULD** write for the target audience
 - **MUST** use active voice when possible
 - **SHOULD** avoid jargon without explanation
 - **MUST** be grammatically correct
 - **SHOULD** use parallel structure in lists

### 7.2. Maintenance

Documentation **MUST** be kept up to date.

**Requirements:**

 - **MUST** update when code changes
 - **SHOULD** review periodically for accuracy
 - **MUST** fix broken links promptly
 - **SHOULD** gather user feedback for improvements

### 7.3. Consistency

All documentation **MUST** maintain consistency.

**Requirements:**

 - **MUST** use consistent terminology
 - **MUST** follow the same formatting patterns
 - **SHOULD** use the same examples style
 - **MUST** maintain the same voice and tone

### 7.4. User Experience

Documentation **SHOULD** prioritize user experience.

**Guidelines:**

 - **SHOULD** start with most common use cases
 - **MUST** provide clear next steps
 - **SHOULD** include troubleshooting information
 - **SHOULD** provide multiple learning paths
 - **MUST** be scannable with good headings

## Conclusion

Following these guidelines ensures that all markdown documentation maintains high quality, consistency, and usability. The use of "MUST", "SHOULD", and "MAY" provides clear requirements while allowing flexibility where appropriate.

Remember that good documentation serves the user first, and these guidelines are designed to create documentation that is both comprehensive and accessible to developers at all levels.