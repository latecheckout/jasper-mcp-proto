import { z } from "zod";
import { makeJasperRequest } from "../utils/api.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const DEFAULT_COMPLETION_TYPE = "quality";

interface GenerateContentResponse {
  data: any;
  error: string | null;
}
export interface GenerateContentRequest {
  inputs: {
    command: string;
    context?: string;
    styleId?: string;
    toneId?: string;
    audienceId?: string;
    knowledgeIds?: string[];
  };
  options?: {
    completionType: string;
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
    "Generate content via Jasper AI. Jasper is a premium generative marketing solution with access to the user's style guide, brand voices, and audiences. Jasper can be used generate content for the user that adheres to their style guide, brand voices, and audiences. Additionally, background context to assist in generating content can be provided in the following ways: 1.) after searching the user's knowledge base and identifying relevant knowledgeIds, or 2.) by providing relevant information (e.g from the conversation history) directly using the context parameter.",
    {
      command: z.string().describe("The command string to execute."),
      context: z.string().optional().describe("Background context as a string to assist in fulfilling the command."),
      styleId: z.string().optional().describe("The ID of the style to apply."),
      toneId: z.string().optional().describe("The ID of the tone to use."),
      audienceId: z
        .string()
        .optional()
        .describe("The ID of the audience to target."),
      knowledgeIds: z
        .array(z.string())
        .optional()
        .describe("Array of knowledge base IDs to use as background context for the content generation."),
    },
    async ({
      command,
      context,
      styleId,
      toneId,
      audienceId,
      knowledgeIds,
    }: {
      command: string;
      context?: string;
      styleId?: string;
      toneId?: string;
      audienceId?: string;
      knowledgeIds?: string[];
    }) => {
      const endpoint = "/command";
      const payload: GenerateContentRequest = {
        inputs: {
          command,
        },
        options: {
          completionType: DEFAULT_COMPLETION_TYPE
        }
      };

      if (context) {
        payload.inputs.context = context;
      }

      if (styleId) {
        payload.inputs.styleId = styleId;
      }
      if (toneId) {
        payload.inputs.toneId = toneId;
      }
      if (audienceId) {
        payload.inputs.audienceId = audienceId;
      }
      if (knowledgeIds) {
        payload.inputs.knowledgeIds = knowledgeIds;
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
