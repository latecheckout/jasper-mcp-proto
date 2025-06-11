import { z } from "zod";
import { makeJasperRequest } from "../utils/api.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
interface GenerateContentResponse {
  data: any;
  error: string | null;
}
export interface GenerateContentRequest {
  inputs: {
    command: string;
    styleId?: string;
    toneId?: string;
    audienceId?: string;
  };
}

/**
 * Registers the run-jasper-command tool with the MCP server.
 * This tool allows executing a command via the Jasper AI API.
 * @param server The MCP server instance.
 * @todo Confirm the actual Jasper AI endpoint for running commands.
 */
export function registerGenerateContentTool(server: McpServer) {
  server.tool(
    "generate-content",
    "Generate content via Jasper AI. Jasper is a premium generative marketing with the user's styleguide, brand voices and audiences. Jasper can be used to apply styles or generate content for the user that matches their styleguide, brand voices and audiences.",
    {
      command: z.string().describe("The command string to execute."),
      styleId: z.string().optional().describe("The ID of the style to apply."),
      toneId: z.string().optional().describe("The ID of the tone to use."),
      audienceId: z
        .string()
        .optional()
        .describe("The ID of the audience to target."),
    },
    async ({
      command,
      styleId,
      toneId,
      audienceId,
    }: {
      command: string;
      styleId?: string;
      toneId?: string;
      audienceId?: string;
    }) => {
      const endpoint = "/command";
      const payload: GenerateContentRequest = {
        inputs: {
          command,
        },
      };

      if (styleId) {
        payload.inputs.styleId = styleId;
      }
      if (toneId) {
        payload.inputs.toneId = toneId;
      }
      if (audienceId) {
        payload.inputs.audienceId = audienceId;
      }

      const result = await makeJasperRequest<
        GenerateContentRequest,
        GenerateContentResponse
      >(endpoint, "POST", payload);

      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to make request to Jasper AI for generate-content.",
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

      return {
        content: [
          {
            type: "text",
            text:
              result.data[0].text ||
              "Command executed, but no output was returned.",
          },
        ],
      };
    }
  );
}
