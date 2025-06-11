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
export function registerGetAudiencesTool(server: McpServer) {
  server.tool(
    "get-jasper-audiences",
    "Return a list of the audiences belonging to the user. These audiences include a description to help the LLM and/or the user pick an appropriate audience, and an audienceId that can be passed to jasper's generate-content tool to use that audience when creating content.",
    async () => {
      const endpoint = "/audiences";
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

      const content = result.data.map((audience: any) => {
        return {
          type: "text",
          text: `Name: ${audience.name}\n\nAudience ID: ${audience.id}\n\nDescription: ${audience.description}`,
        };
      });

      return {
        content,
      };
    }
  );
}
