#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerGenerateContentTool } from "./tools/generateContent.js";
import { registerGetStylesResource } from "./resources/getStyles.js";
import { registerGetBrandVoicesResource } from "./resources/getBrandVoices.js";
import { registerApplyStyleTool } from "./tools/applyStyleTool.js";
import { registerGetAudiencesResource } from "./resources/getAudiences.js";
import { registerGetStylesTool } from "./tools/getStyleGuides.js";
import { registerGetAudiencesTool } from "./tools/getAudiences.js";
import { registerGetBrandVoicesTool } from "./tools/getBrandVoices.js";
import { registerSearchKnowledgeBaseTool } from "./tools/searchKnowledgebaseTool.js";

if (!process.env.JASPER_API_KEY) {
  console.error(
    "JASPER_API_KEY environment variable is not set. Please set it and try again."
  );
  process.exit(1);
}

// Create server instance
const server = new McpServer({
  name: "jasper-ai-mcp-prototype",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Tools
registerGenerateContentTool(server);
registerGetBrandVoicesTool(server);
registerGetAudiencesTool(server);
registerApplyStyleTool(server);
registerGetStylesTool(server);
registerSearchKnowledgeBaseTool(server);

// Resources
registerGetStylesResource(server);
registerGetBrandVoicesResource(server);
registerGetAudiencesResource(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
