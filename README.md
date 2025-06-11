# Jasper AI MCP Server Prototype

This repository contains a prototype Model Context Protocol (MCP) server for interacting with the Jasper AI API.

## Setup

### Cursor/Windsurf

To use this Jasper MCP server with Windsurf, add the following configuration to your Windsurf `mcp_config.json` file:

```json
"jasper": {
  "command": "npx",
  "args": ["-y", "https://github.com/latecheckout/jasper-mcp-prototype"],
  "env": {
    "JASPER_API_KEY": "YOUR_JASPER_API_KEY"
  }
}
```

Replace `YOUR_JASPER_API_KEY` with your actual Jasper API key.

### Claude Desktop (Recommended Method):

1. Open the Claude Desktop application.
2. Navigate to `Settings` (or `Preferences`).
3. Go to the `Developer` tab.
4. Click on the `Edit Config` button. This will open the Claude Desktop configuration file (e.g., `claude_desktop_config.json` or a similar name, often located in a Claude-specific settings directory) in a text editor.
5. In the opened JSON file, locate or add an `mcpServers` object. Add the following `jasper` configuration as a new entry within `mcpServers`:

   ```json
   "jasper": {
     "command": "npx",
     "args": ["-y", "https://github.com/latecheckout/jasper-mcp-prototype"],
     "env": {
       "JASPER_API_KEY": "YOUR_JASPER_API_KEY"
     }
   }
   ```

   **Note:** Ensure the resulting file is valid JSON. If adding `jasper` to an existing `mcpServers` object with other servers, make sure to add a comma after the preceding server entry if necessary.

6. Replace `YOUR_JASPER_API_KEY` with your actual Jasper API key in the `env` section.
7. Save the configuration file.
8. Completely close and restart the Claude Desktop application for the changes to take effect.

If you encounter issues with NPX in Claude Desktop (especially if using `nvm`), please refer to the "Claude Desktop Alternate" method detailed below.

### Claude Desktop Local Build

Claude Desktop can have issues running MCP servers with NPX, especially when node is managed with nvm. If you cannot install with the above method, follow these steps instead:

**1. Prerequisites:**

- Ensure you have the **Claude Desktop App** installed. These instructions are tailored for the desktop app, as browser-based MCP integration might differ.
- You'll need **Node.js** and **pnpm**. If you don't have Node.js, install it from [nodejs.org](https://nodejs.org/). You can install pnpm via npm: `npm install -g pnpm`.

**2. Download and Build the Jasper MCP Server:**

- Clone this repository (if you haven't already):
  ```bash
  git clone https://github.com/latecheckout/jasper-mcp-prototype.git
  cd jasper-mcp-prototype
  ```
- Install dependencies:
  ```bash
  pnpm install
  ```
- Build the project:
  ```bash
  pnpm run build
  ```
  This will create a `dist/index.js` file in the project directory.

**3. Obtain Necessary File Paths:**

- **Node Executable Path:**
  Open your terminal and run:
  ```bash
  which node
  ```
  Copy the full path displayed (e.g., `/Users/yourusername/.nvm/versions/node/v18.17.0/bin/node` or `/usr/local/bin/node`).
- **Absolute Path to `dist/index.js`:**
  Navigate to the root directory of the `jasper-mcp-prototype` (if you're not already there). Then run:
  ```bash
  echo "$(pwd)/dist/index.js"
  ```
  Copy the full path displayed (e.g., `/Users/yourusername/path/to/jasper-mcp-prototype/dist/index.js`).

**4. Configure Claude Desktop App:**

- Open your Claude Desktop App.
- Go to `Settings` (or Preferences).
- Find the `Developer` tab or section.
- Click on `Edit Config` (or a similarly named option to edit the MCP server configuration). This will open a JSON configuration file (often named `claude_desktop_config.json` or similar) in a text editor.
- Add or modify the `mcpServers` object in this file. If `mcpServers` doesn't exist, you can add the whole structure. If it does, add `jasper-ai` as a new key within it:

  ```json
  {
    "mcpServers": {
      ...
      "jasper": {
        "command": "PASTE_YOUR_NODE_EXECUTABLE_PATH_HERE",
        "args": ["PASTE_YOUR_ABSOLUTE_PATH_TO_DIST/INDEX.JS_HERE"],
        "env": {
          "JASPER_API_KEY": "YOUR_JASPER_API_KEY_HERE"
        }
      }
    }
  }
  ```

**Important:**

- Replace `"PASTE_YOUR_NODE_EXECUTABLE_PATH_HERE"` with the Node executable path you copied in step 3a.
- Replace `"PASTE_YOUR_ABSOLUTE_PATH_TO_DIST/INDEX.JS_HERE"` with the absolute path to `dist/index.js` you copied in step 3b.
- Replace `"YOUR_JASPER_API_KEY_HERE"` with your actual Jasper API key.
- Ensure the resulting file is valid JSON. If you're adding `jasper` to an existing `mcpServers` object, make sure to add a comma after the preceding server entry if necessary.

**5. Restart Claude:**

- Save the changes to the configuration file.
- Completely close and restart the Claude Desktop App for the new MCP server configuration to take effect.

You should now be able to use the Jasper MCP tools via this local MCP server in Claude.

## Usage

Once correctly setup in your environment, you can ask the LLM to use jasper to write content for you. For example:

```
Use jasper to write a blog post about the latest trends in AI. Pick an appropriate tone, and audience.
```

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd jasper-mcp
    ```

2.  **Install dependencies:**
    This project uses `pnpm` as the package manager.

    ```bash
    pnpm install
    ```

## Development Flow

```bash
pnpm run dev
```

- **Run in development mode:**
  This command starts the server and uses `@modelcontextprotocol/inspector`. You can use the inspector to test out the MCP server.

- **Note:** There isn't hot reloading. After making changes to the code, you'll need to run `pnpm build` and then click the restart button in the MCP inspector to see your changes.

## Tools and Resources

This MCP server provides the following tools and resources:

### Tools

1.  **`generate-content`**:

    - Description: Generate content via Jasper AI. Jasper is a premium generative marketing with the user's styleguide, brand voices and audiences. Jasper can be used to apply styles or generate content for the user that matches their styleguide, brand voices and audiences.
    - See `src/tools/generateContent.ts`.

2.  **`apply-style`**:

    - Description: Applies a specified styleguide's rules to the provided text content and returns the styled content. This tool can be used to ensure content conforms to the user's styleguide, especially useful when generating content for the public or for specific audiences.
    - See `src/tools/applyStyleTool.ts`.

3.  **`get-jasper-style-guides`**:

    - Description: Return the style guide id belonging to the user. This style guide id can be passed to jasper's generate-content tool to use that style when creating content. It can also be used in the apply-style tool to apply a style to a given text.
    - See `src/tools/getStyleGuides.ts`.

4.  **`get-jasper-brand-voices`**:

    - Description: Return a list of the brand voices/tones belonging to the user. These brand voices include a description to help the LLM and/or the user pick an appropriate tone, and a toneId that can be passed to jasper's generate-content tool to use that brand voice/tone when creating content.
    - See `src/tools/getBrandVoices.ts`.

5.  **`get-jasper-audiences`**:
    - Description: Return a list of the audiences belonging to the user. These audiences include a description to help the LLM and/or the user pick an appropriate audience, and an audienceId that can be passed to jasper's generate-content tool to use that audience when creating content.
    - See `src/tools/getAudiences.ts`.

### Resources

1.  **`jasper://styles`** (Registered as `jasper-styles`):

    - Fetches available Jasper AI styles.
    - Implementation: `src/resources/getStyles.ts`

2.  **`jasper://brandvoices`** (Registered as `jasper-brand-voices`):

    - Fetches available Jasper AI brand voices (tones).
    - Implementation: `src/resources/getBrandVoices.ts`

3.  **`jasper://audiences`** (Registered as `jasper-audiences`):
    - Fetches available Jasper AI audiences.
    - Implementation: `src/resources/getAudiences.ts`
