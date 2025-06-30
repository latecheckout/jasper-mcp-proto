import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeJasperRequest } from "../utils/api.js";

// Define types for the Jasper API request and response for this specific tool
// These could be moved to '../types/jasper.js' for broader consistency if they become standard.
interface JasperApplyStyleApiRequest {
  content: string;
}

interface JasperApplyStyleApiResponse {
  data: any;
  error?: string; // To match potential error structure seen in runCommand.ts
}

const applyStyleInputSchema = z.object({
  styleId: z.string().describe("The ID of the style to apply."),
  content: z.string().describe("The text content to style."),
});

// Infer the input type from the Zod schema, similar to runCommand.ts
type ApplyStyleHandlerInput = z.infer<typeof applyStyleInputSchema>;

/**
 * Registers a tool with the MCP server to apply a Jasper style to a given text content.
 * This implementation mirrors the structure of 'runCommand.ts'.
 */
export function registerApplyStyleTool(server: McpServer): void {
  server.tool(
    "apply-style",
    "Applies a specified style guide's rules to the provided text content and returns the styled content. This tool can be used to ensure content conforms to the user's style guide, especially useful when generating content for public consumption or checking published content against the style guide.",
    {
      styleId: z.string().describe("The ID of the style to apply."),
      content: z.string().describe("The text content to style."),
    },
    async ({ styleId, content }: ApplyStyleHandlerInput) => {
      const endpoint = `/styles/${styleId}/apply`;
      const payload: JasperApplyStyleApiRequest = { content };

      const result = await makeJasperRequest<
        JasperApplyStyleApiRequest,
        JasperApplyStyleApiResponse
      >(endpoint, "POST", payload);

      if (!result) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to make request to Jasper AI for applyStyle. Result: ${JSON.stringify(
                result
              )}`,
            },
          ],
        };
      }

      if (result.error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Jasper AI Error applying style: ${
                result.error
              }. Full response: ${JSON.stringify(result)}`,
            },
          ],
        };
      }

      // Ensure data and output exist, and output is a string
      if (result.data) {
        return {
          content: [
            {
              type: "text" as const,
              text: result.data.text,
            },
          ],
        };
      } else {
        // Handle unexpected response structure from Jasper API
        console.error(
          "[applyStyleTool] Error: Unexpected response data structure from Jasper API:",
          result
        );
        return {
          content: [
            {
              type: "text" as const,
              text: `Style applied, but received an unexpected response format from Jasper AI. Response: ${JSON.stringify(
                result
              )}`,
            },
          ],
        };
      }
    }
  );
}
