# MCP Echo Server

A minimal Model Context Protocol (MCP) server template that provides a simple echo functionality. This template is designed to be a starting point for building your own MCP servers.

## Features

- Simple echo tool that returns messages
- Minimal dependencies
- TypeScript support
- Ready for npm publishing

## Installation

You can run this server directly using npx:

```bash
npx mcp-echo-server
```

Or install it globally:

```bash
npm install -g mcp-echo-server
```

## Usage

### As an MCP Server

Configure your MCP client to use this server. For example, in Claude Desktop, add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "echo": {
      "command": "npx",
      "args": ["mcp-echo-server"]
    }
  }
}
```

### Available Tools

The server provides one tool:

- **echo**: Echoes back any message you send to it
  - Parameters:
    - `message` (string): The message to echo back

## Development

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd mcp-echo-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Running in Development

```bash
npm run dev
```

## Using as a Template

This server is designed to be a minimal starting point. To create your own MCP server:

1. Fork or clone this repository
2. Update the `package.json` with your project details
3. Modify `src/index.ts` to add your own tools
4. Build and publish to npm

### Adding New Tools

To add a new tool, modify `src/index.ts`:

```typescript
server.tool(
  "your-tool-name",
  "Description of what your tool does",
  {
    // Define your parameters using Zod schema
    param1: z.string().describe("Description of param1"),
    param2: z.number().optional().describe("Optional param2")
  },
  async ({ param1, param2 }) => {
    // Your tool logic here
    return {
      content: [{
        type: "text",
        text: `Your result here`
      }]
    };
  }
);
```

## Publishing

To publish your own version:

1. Update the `name` field in `package.json`
2. Set your npm registry (if using a scoped package)
3. Run `npm publish`

## License

MIT