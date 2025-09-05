export const config = `
name: "my-mcp"
version: 0.1.0
inputs:
  - topic: general
    paths: [ "docs" ]
`.trim();

export const doc = `
# Ballroom Dance Styles

The following are popular dance styles:

 - Tango
 - Cha cha
 - Waltz
 - Rumba
`.trim();

export const project = {
  "name": "mymcp.md",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "mcp.md": "node ./node_modules/mcp.md/bin.js"
  },
  "dependencies": {
    "mcp.md": "^0.0.10"
  }
};

export const bin = `require("mcp.md/bin");`;