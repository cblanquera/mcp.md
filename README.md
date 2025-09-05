# MCP.MD

Turn your markdown into an MCP.

## 1.1. Install

 1. Run the following commands in the same folder your other MCP servers are.

> Make sure you are using Node version 22.

```bash
$ mkdir my-mcp.md
$ cd my-mcp.md
$ npx --y mcp.md@latest example -v
$ npm install
```

 2. Next, run the following command to vecorize your markup.

```bash
$ npm run mcp.md ingest -v
```

 3. Use `pwd` to get the full MCP path and edit your MCP server configuration by following one of the options below.

### 1.1. From the Repository With Claude Desktop

Add the following configuration to your `claude_desktop_config.json`.

```json
{
  "name": "mcp.md",
  "command": "npm",
  "args": [ 
    "--prefix",
    "[pwd]",
    "run",
    "mcp.md",
    "serve"
  ]
}
```

### 1.2. From the Repository With Cline

Add the following configuration to your `cline_mcp_settings.json`.

```json
{
  "mcpServers": {
    "mcp.md": {
      "command": "npm",
      "args": [ 
        "--prefix",
        "[pwd]",
        "run",
        "mcp.md",
        "serve"
      ]
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

You can manually start the server like the following.

```bash
$ npm run mcp.md server -v
```

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

The MCP uses `Xenova/all-MiniLM-L6-v2` locally to determine the best search query term for the MCP. Think about it like random prompt → correct query → ask MCP. You can upgrade this to use your OpenAI key by adding an `openai_host`, `openai_key` and setting `embedding_model` to `text-embedding-3-small` in `config.yml`.

> WARNING: OpenRouter doesn't support the `/embeddings` API endpoint. This is called when providing an OpenAI compatible host.

## 2.2. Updating Your Database

Everytime you add or edit new markdown you'll need to update your database like the following.

```bash
$ npx run mcp.md ingest
```

## 3. Maximizing Your Knowledge Base

Create a rule (markdown file) called **My-MCP-Rule.md** in your knowledge folder (ex. `.clinerules`) with the following context.

```md
# Rule: Using My MCP

- If the user asks about [ADD TOPICS] use the MCP tool `my-mcp.search_context`.
- If the user asks for a compact summary of rules for [ADD TOPICS], use the MCP tool `my-mcp.build_brief`.
- Always prefer these MCP tools over answering from memory.
```
