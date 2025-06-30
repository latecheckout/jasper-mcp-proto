import { makeJasperRequest } from "../utils/api.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
interface GetBrandVoicesResponse {
  data: any;
  error: string | null;
}
export interface GetBrandVoicesRequest {
  inputs: {};
}

/**
 * Registers the run-jasper-command tool with the MCP server.
 * This tool allows executing a command via the Jasper AI API.
 * @param server The MCP server instance.
 * @todo Confirm the actual Jasper AI endpoint for running commands.
 */
export function registerGetBrandVoicesTool(server: McpServer) {
  server.tool(
    "get-jasper-brand-voices",
    "Return a list of the brand voices/tones belonging to the user. These brand voices include a description to help the LLM and/or the user pick an appropriate tone, and a toneId that can be passed to jasper's generate-content tool to use that brand voice/tone when creating content. ",
    async () => {
      const endpoint = "/tones?size=100";
      const result = await makeJasperRequest<
        GetBrandVoicesRequest,
        GetBrandVoicesResponse
      >(endpoint, "GET");

      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to make request to Jasper AI for run-command.",
            },
          ],
        };
      }

      if (result.error) {
        return {
          content: [
            {
              type: "text",
              text: `Jasper AI Error: ${result.error}`,
            },
          ],
        };
      }

      const content = result.data.map((tone: any) => {
        return {
          type: "text",
          text: `Name: ${tone.name}\n\nTone ID: ${tone.id}\n\nDescription: ${tone.value}`,
        };
      });

      return {
        content,
      };
    }
  );
}
