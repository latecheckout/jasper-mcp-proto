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
export function registerGetStylesTool(server: McpServer) {
  server.tool(
    "get-jasper-style-guides",
    "Return the style guide id belonging to the user. This style guide id can be passed to jasper's generate-content tool to use that style when creating content. It can also be used in the apply-style tool to apply a style to a given text.",
    async () => {
      const endpoint = "/styles";
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

      const content: any = [
        {
          type: "text",
          text: `Style ID: ${result.data[0].id}`,
        },
      ];

      return {
        content,
      };
    }
  );
}
