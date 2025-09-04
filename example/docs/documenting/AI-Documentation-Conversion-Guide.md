# AI Documentation Conversion Guide

Instructions for AI systems to convert existing human-written documentation into structured, consistent markdown documentation following established guidelines and standards.

 1. [Conversion Overview](#1-conversion-overview)
 2. [Pre-Conversion Analysis](#2-pre-conversion-analysis)
 3. [Structure Transformation](#3-structure-transformation)
 4. [Content Reorganization](#4-content-reorganization)
 5. [API Documentation Conversion](#5-api-documentation-conversion)
 6. [Formatting Standardization](#6-formatting-standardization)
 7. [Quality Validation](#7-quality-validation)
 8. [Post-Conversion Tasks](#8-post-conversion-tasks)

## 1. Conversion Overview

The following instructions guide AI systems in converting human-written documentation to structured markdown that follows established documentation guidelines.

### 1.1. Conversion Goals

The primary objectives when converting documentation are consistency, completeness, and usability.

**Primary Goals:**
- Transform unstructured content into numbered outline format
- Ensure all content follows MUST/SHOULD/MAY requirements
- Maintain original information while improving structure
- Create consistent formatting across all documentation
- Add missing required elements (table of contents, proper headers, etc.)

### 1.2. Input Analysis

Before beginning conversion, analyze the existing documentation to understand its current state and conversion requirements.

**Analysis Steps:**
 1. Identify document type (general documentation vs API documentation)
 2. Catalog existing sections and their hierarchy
 3. Identify missing required elements
 4. Note formatting inconsistencies
 5. Assess code examples and their quality
 6. Check for cross-references and links

## 2. Pre-Conversion Analysis

Perform comprehensive analysis of the source documentation before making any changes.

### 2.1. Document Type Classification

Determine the type of documentation to apply appropriate conversion rules.

**Classification Types:**
- **General Documentation**: Guides, tutorials, explanations
- **API Documentation**: Class references, method documentation
- **Mixed Documentation**: Contains both general and API content

**Decision Rules:**
- If document contains class/method signatures → API Documentation
- If document explains concepts/processes → General Documentation
- If document contains both → Split into separate files or apply mixed rules

### 2.2. Content Inventory

Create an inventory of all existing content to ensure nothing is lost during conversion.

**Inventory Checklist:**
- [ ] Main topics and subtopics
- [ ] Code examples and snippets
- [ ] Tables and lists
- [ ] Images and diagrams
- [ ] Cross-references and links
- [ ] Alerts and callouts
- [ ] Metadata and configuration

### 2.3. Gap Analysis

Identify missing elements required by the documentation guidelines.

**Required Elements Check:**
- [ ] Title and description (1-3 paragraphs)
- [ ] Table of contents with linked anchors
- [ ] At least 2 main subjects
- [ ] Numbered outline system
- [ ] Proper code block formatting
- [ ] Parameter tables for API methods
- [ ] Return value descriptions

## 3. Structure Transformation

Transform the existing structure to follow the numbered outline system and required hierarchy.

### 3.1. Title and Description Conversion

Convert the existing title and add proper description if missing.

**Conversion Steps:**
 1. Ensure single H1 title exists
 2. Add description after title (1-3 paragraphs)
 3. Summarize main subjects in description
 4. Move any content that belongs in main subjects

**Example Transformation:**
```markdown
# Original
# API Reference
This document covers the API.

# Converted
# API Reference

Complete API documentation for the framework, providing comprehensive guides 
for all classes, methods, and utilities. This documentation covers core classes, 
plugin systems, routing interfaces, and integration examples.
```

### 3.2. Outline Numbering Implementation

Convert existing headers to numbered outline format.

**Conversion Rules:**
- H2 headers → ## 1., ## 2., ## 3., etc.
- H3 headers → ### 1.1., ### 1.2., ### 2.1., etc.
- H4 headers → #### 1.1.1., #### 1.1.2., etc.
- Maximum 5 levels of nesting
- Sequential numbering within each level

**Example Transformation:**
```markdown
# Original
## Getting Started
### Installation
### Configuration
## Advanced Usage
### Plugins

# Converted
## 1. Getting Started
### 1.1. Installation
### 1.2. Configuration
## 2. Advanced Usage
### 2.1. Plugins
```

### 3.3. Table of Contents Generation

Create a linked table of contents for all main subjects.

**Generation Rules:**
- Use numbered list format with space before number
- Include only H2 headers (main subjects)
- Create anchor links matching header format
- Place before first main subject

**Example Generation:**
```markdown
 1. [Getting Started](#1-getting-started)
 2. [Advanced Usage](#2-advanced-usage)
 3. [API Reference](#3-api-reference)
```

## 4. Content Reorganization

Reorganize content to follow the "at least two" rule and proper section descriptions.

### 4.1. Section Description Addition

Add descriptions after every header that lacks one.

**Description Rules:**
- Every header MUST be followed by 1-3 paragraphs
- Summarize what the section covers
- If no logical description exists, summarize subsections
- Move detailed content to subsections if needed

**Example Addition:**
```markdown
# Original
## Configuration
### Database Setup
### API Keys

# Converted
## 1. Configuration

The following sections cover how to configure the application for different 
environments and use cases. Configuration includes database connections, 
API key management, and environment-specific settings.

### 1.1. Database Setup
### 1.2. API Keys
```

### 4.2. Content Consolidation

Apply the "at least two" rule by consolidating or splitting content as needed.

**Consolidation Rules:**
- If only one subsection exists, move content to parent section
- If content is too long, split into multiple subsections
- Ensure each level has at least 2 items
- Maintain logical grouping of related content

### 4.3. Document Block Separation

Ensure proper spacing between document blocks.

**Spacing Rules:**
- One empty line between document blocks
- No multiple consecutive empty lines
- Separate paragraphs, lists, code blocks, and tables
- Maintain consistent spacing throughout

## 5. API Documentation Conversion

Apply specific conversion rules for API documentation files.

### 5.1. Class Documentation Structure

Convert class documentation to follow the required API format.

**Required Structure:**
```markdown
# ClassName

Description of class purpose and usage.

```typescript
import { ClassName } from '@package/name';
const instance = new ClassName(options);
```

 1. [Properties](#1-properties)
 2. [Methods](#2-methods)
 3. [Static Methods](#3-static-methods)
 4. [Examples](#4-examples)
```

**Conversion Steps:**
 1. Ensure class name as H1 title
 2. Add class description (1-3 paragraphs)
 3. Add import and instantiation example
 4. Create numbered table of contents
 5. Organize content into required sections

### 5.2. Method Documentation Conversion

Convert method documentation to use parameter tables and proper formatting.

**Required Method Format:**
```markdown
### 2.1. Method Name

Description of what the method does and when to use it.

```typescript
const result = instance.methodName(param1, param2);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `param1` | `string` | Description of parameter |
| `param2` | `number` | Optional parameter (default: 0) |

**Returns**

Description of return value and type.
```

**Conversion Steps:**
 1. Extract method signature and parameters
 2. Create parameter table from existing documentation
 3. Convert return value description (no tables)
 4. Add realistic code example
 5. Ensure numbered subsection header

### 5.3. Property Documentation Conversion

Convert property documentation to use consistent table format.

**Required Property Format:**
```markdown
## 1. Properties

The following properties are available when instantiating a ClassName.

| Property | Type | Description |
|----------|------|-------------|
| `property` | `Type` | Description of property purpose |
```

**Conversion Steps:**
 1. Extract all public properties
 2. Create consistent property table
 3. Add meaningful descriptions
 4. Include type information
 5. Focus only on public properties

## 6. Formatting Standardization

Standardize all formatting elements to follow guidelines.

### 6.1. Code Block Conversion

Convert all code blocks to include language specification and proper formatting.

**Conversion Rules:**
- Add language identifier to all code blocks
- Ensure closing ``` followed by empty line
- Add relevant comments where helpful
- Verify code examples are complete and functional

**Example Conversion:**
```markdown
# Original
```
const example = 'value';
```

# Converted
```typescript
const example = 'value';
```

```

### 6.2. List Formatting

Convert all lists to follow proper spacing and formatting rules.

**List Conversion Rules:**
- Add space before dash in bullet lists
- Add space after period in numbered lists
- Ensure at least 2 items in every list
- Keep list items short (1-3 sentences)
- Use parallel structure

**Example Conversion:**
```markdown
# Original
- Item one
-Item two

# Converted
 - Item one
 - Item two
```

### 6.3. Table Standardization

Convert all tables to use consistent formatting.

**Table Rules:**
- Use consistent column alignment
- Include proper headers
- Use backticks around code elements
- Maintain consistent spacing

## 7. Quality Validation

Perform validation checks to ensure conversion meets all requirements.

### 7.1. Structure Validation

Verify the converted document follows all structural requirements.

**Structure Checklist:**
- [ ] Single H1 title with description
- [ ] Table of contents with linked anchors
- [ ] At least 2 main subjects
- [ ] Numbered outline system throughout
- [ ] Proper section descriptions
- [ ] "At least two" rule followed

### 7.2. Content Validation

Ensure all original content is preserved and properly formatted.

**Content Checklist:**
- [ ] All original information retained
- [ ] Code examples include language specification
- [ ] Parameter tables for API methods
- [ ] Return values described properly
- [ ] Cross-references maintained
- [ ] Proper spacing between document blocks

### 7.3. API-Specific Validation

For API documentation, verify compliance with API-specific requirements.

**API Checklist:**
- [ ] Import statements in examples
- [ ] Parameter tables for all methods
- [ ] Return value descriptions (no tables)
- [ ] Public API focus only
- [ ] Consistent method formatting
- [ ] Integration examples included

## 8. Post-Conversion Tasks

Complete final tasks after conversion is finished.

### 8.1. Link Verification

Verify all internal and external links work correctly.

**Link Verification Steps:**
 1. Check all table of contents links
 2. Verify cross-reference links
 3. Test external links
 4. Update broken or outdated links
 5. Ensure anchor links match headers

### 8.2. Cross-Reference Updates

Update cross-references to match new structure and numbering.

**Update Rules:**
- Update section references to use new numbering
- Maintain links between related documents
- Add new cross-references where helpful
- Ensure consistent link formatting

### 8.3. Final Review

Perform comprehensive review of converted documentation.

**Review Checklist:**
- [ ] All requirements met
- [ ] Consistent formatting throughout
- [ ] No information lost
- [ ] Improved readability and structure
- [ ] Working code examples
- [ ] Proper grammar and spelling

## Conversion Examples

### 8.4. Before and After Example

The following example shows a complete conversion from unstructured to structured documentation.

**Before Conversion:**
```markdown
# User Management

This covers user stuff.

## Creating Users
You can create users like this:
```
createUser(name, email)
```

## User Properties
- name
- email
- id

## Deleting Users
Use deleteUser(id) to remove users.
```

**After Conversion:**
```markdown
# User Management

Complete guide for managing users in the system, covering user creation, 
property management, and deletion operations. This documentation provides 
examples and best practices for user management workflows.

 1. [Creating Users](#1-creating-users)
 2. [User Properties](#2-user-properties)
 3. [Deleting Users](#3-deleting-users)

## 1. Creating Users

The following section explains how to create new users in the system.

```typescript
const user = createUser(name, email);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `name` | `string` | Full name of the user |
| `email` | `string` | Valid email address |

**Returns**

A new user object with generated ID and provided information.

## 2. User Properties

The following properties are available on user objects.

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Full name of the user |
| `email` | `string` | User's email address |
| `id` | `string` | Unique identifier for the user |

## 3. Deleting Users

The following section explains how to remove users from the system.

```typescript
const success = deleteUser(id);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier of user to delete |

**Returns**

Boolean indicating whether the deletion was successful.
```

## Conclusion

Following these conversion instructions ensures that existing documentation is transformed into consistent, well-structured markdown that follows established guidelines. The conversion process preserves all original information while significantly improving readability, navigation, and usability for developers.

Remember that the goal is to enhance the documentation's value to users while maintaining technical accuracy and completeness.
