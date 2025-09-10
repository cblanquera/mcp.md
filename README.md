# MCP.MD

Turn your markdown into an MCP.

## 1.1. Install

 1. Run the following commands in the same folder your other MCP servers are.

> Make sure you are using Node version 22.

```bash
$ mkdir my-mcp.md
$ cd my-mcp.md
$ npx --y mcp.md@latest example -l
$ npm install
```

 2. Next, run the following command to vecorize your markup.

```bash
$ npx --y mcp.md@latest ingest -l
```

 3. Edit your MCP server configuration by following one of the options below.

> Use `pwd` to get the full MCP path for `[pwd]` in the next set of instructions.

### 1.1. From the Repository With Claude Desktop

Add the following configuration to your `claude_desktop_config.json`.

```json
{
  "name": "mcp.md",
  "command": "node",
  "args": [ "[pwd]/mcp.md.js", "serve", "--cwd", "[pwd]" ]
}
```

### 1.2. From the Repository With Cline

Add the following configuration to your `cline_mcp_settings.json`.

```json
{
  "mcpServers": {
    "mcp.md": {
      "command": "node",
      "args": [ "[pwd]/mcp.md.js", "serve", "--cwd", "[pwd]" ]
    }
  }
}
```

### 1.3. From Prompt

 1. Copy and paste the following prompt.

```
Set up the MCP server from https://github.com/cblanquera/mcp.md while adhering to these MCP server installation rules:
- Start by loading the MCP documentation.
- Use "github.com/cblanquera/mcp" as the server name in cline_mcp_settings.json.
- Create the directory for the new MCP server before starting installation.
- Make sure you read the user's existing cline_mcp_settings.json file before editing it with this new mcp, to not overwrite any existing servers.
- Use commands aligned with the user's shell and operating system best practices.
- Once installed, demonstrate the server's capabilities by using one of its tools.
Here is the project's README to help you get started:
```

 2. Then paste in this README.

## 2. Usage

All you need to do is configure `inputs` in `config.yml` to where your markdown files are actually located and ingest them into your database. The following sections cover the prescribed steps.

## 2.1. Configuration

The following are the possible configuration options for `config.yml`.

```yml
# MCP Server requires a name (should be slug)
name: "my-mcp"
# MCP Server requires a version
version: 0.0.1
# Add many topics like the following:
inputs:
  - topic: coding
    # Relative to [pwd]
    # Start with / for an exact path
    paths: [ "docs/coding/**/*.md" ]
    # When there are conflicting rules, the lower rank wins
    rank: 10
  - topic: documenting
    paths: [ "docs/documenting/**/*.md" ]
    rank: 20
  - topic: testing
    paths: [ "docs/testing/**/*.md" ]
    rank: 30
# Where to save your database files relative to [pwd]
# Start with / for an exact path
output: "database"
# Batch size of vectors: 64, 128, 256, 512, etc.
batch_size: 64
# If embedding_model is text-embedding-3-small, need to set the below.
openai_host: "https://api.openai.com/v1"
openai_key: "sk-xxx"
# Model to use for embeds: local or text-embedding-3-small
embedding_model: "local"
# Just a provision for later developments
budgets:
  max_chunk_tokens: 400
  overlap_tokens: 32
```

The MCP uses `Xenova/all-MiniLM-L6-l2` locally to determine the best search query term for the MCP. Think about it like random prompt → correct query → ask MCP. You can upgrade this to use your OpenAI key by adding an `openai_host`, `openai_key` and setting `embedding_model` to `text-embedding-3-small` in `config.yml`.

> WARNING: OpenRouter doesn't support the `/embeddings` API endpoint. This is called when providing an OpenAI compatible host.

## 2.2. Updating Your Database

Everytime you add or edit new markdown you'll need to update your database like the following.

```bash
$ npx --y mcp.md@latest ingest -l
```

## 2.3. Starting Your MCP Server

You can manually start the server like the following.

```bash
$ npx --y mcp.md@latest serve -l
```

## 3. Maximizing Your Knowledge Base

Create a rule (markdown file) called **My-MCP-Rule.md** in your knowledge folder (ex. `.clinerules`) with the following context.

```md
# My MCP Usage Rules

This MCP provides access to knowledge bases and rulesets. Agents must use these tools to ground answers, learn about user-defined code libraries, follow user-defined style guides, and enforce coding or documentation standards.

## 1. General Guidance

- ALWAYS use this MCP to look up knowledge or rules that the user has provided in Markdown.
- NEVER assume defaults: if a topic or tag is unclear, first list available ones.
- PLAN mode → use listing and searching tools to gather relevant context.
- ACT mode → use fetching and enforcement tools to apply style, rules, or examples when producing outputs.
- Prefer **sections over full documents** unless the whole doc is short and necessary.
- ALWAYS cite or enforce rules when producing user-facing drafts.

## 2. Tools & When to Use Them

The following MCP tool sets are used to plan and execute tasks.

### 2.1. Discovery

The following MCP tools are used to discover the overall topics, subjects and sections available.

- **list_topics**
  - Use FIRST to learn what high-level topics exist.
  - Example: "coding", "testing", "documenting".
- **list_tags**
  - Use to discover available tags and their variants.
  - Always confirm tag spelling before searching with them.
- **list_documents**
  - Use to see which documents exist under a topic or tag filter.
  - Use when the user refers to “that style guide document” or similar.
- **list_sections**
  - Use to map out a document’s sections before fetching text.
  - Use when you need a specific section rather than the whole doc.

### 2.2. Retrieval

The following MCP tools are used to generally retrieve data particulars.

- **search_context**
  - Use for general keyword/semantic search across topics.
  - Start with `mode=hybrid`. Add `snippet_only=true` for code examples.
- **search_by_tags**
  - Use when you know specific tags to require or exclude.
  - Strongest option for precision (e.g., `require_tags=["ruleset"]`).
- **fetch_document**
  - Use to retrieve full content of a document or specific sections.
  - Provide `sections` array when possible to minimize tokens.
- **fetch_section**
  - Use to retrieve exact sections by ID, optionally with neighbors.
  - Ideal for “show me the context around section X”.

### 2.3. Analysis & Reasoning

The following MCP tools are used to help analyze and rationalize tasks before execution.

- **build_brief**
  - Use in PLAN mode to turn a task into a structured brief with references.
  - Example: "Write a test plan" → outline + linked ruleset sections.
- **summarize_context**
  - Use to compress multiple hits into a summary before acting.
  - Helps reduce token load in large docs.
- **compare_context**
  - Use to highlight differences between two contexts (e.g., coding vs testing guides).
- **dedupe_context**
  - Use to merge overlapping hits before reasoning.
- **expand_context**
  - Use when initial search is too narrow and you need neighbors or related sections.
- **list_related**
  - Use to find related sections by tags or document proximity.

### 2.4. Governance

The following MCP tools are rule set oriented and must be used during the execution of a task.

- **enforce_rules**
  - ALWAYS use in ACT mode before returning final drafts.
  - Input is the current draft; output is the applicable rules (MUST, SHOULD, MUST NOT).
  - Fix violations before presenting to user.
- **check_rules**
  - Use to produce a checklist of rules for a given task.
  - Good in PLAN mode when scoping compliance requirements.
- **validate_filters**
  - Use to ensure a proposed filter set (tags/topics) actually matches content.
  - Run before committing to a narrow search.

### 2.5. Output & Support

The following MCP tools are available for general support for both planning and executing tasks.

- **cite_context**
  - Use to convert section IDs into stable citation metadata.
  - ALWAYS attach citations when you rely on context.
- **extract_code**
  - Use to pull fenced code blocks only, not prose.
  - Ideal for examples, snippets, or test templates.
- **export_context**
  - Use to package selected context for reuse or external reporting.

## 3. Mandatory Practices

- MUST check `list_topics` or `list_tags` before attempting a narrow search if the scope is ambiguous.
- MUST call `enforce_rules` before returning any draft that involves formatting, style, or coding standards.
- MUST use `cite_context` when referencing any guidance from this MCP in the final answer.
- SHOULD prefer `search_by_tags` over `search_context` when a relevant tag is known.
- SHOULD use `summarize_context` when multiple hits are too verbose to include raw.
- MAY expand context (`expand_context` or `list_related`) if search results appear incomplete.
```
