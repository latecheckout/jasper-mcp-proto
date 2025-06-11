import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeJasperRequest } from "../utils/api.js";

export interface Audience {
  id: string;
  name: string;
  description?: string;
}

export const registerGetAudiencesResource = (server: McpServer) => {
  server.resource(
    "jasper-audiences",
    "jasper://audiences",
    async (
      request: URL
    ): Promise<{ contents: Array<{ uri: string; text: string }> }> => {
      try {
        const apiResponse = await makeJasperRequest<{}, { data: Audience[] }>(
          "/audiences",
          "GET"
        );

        if (!apiResponse || !apiResponse.data) {
          console.error("Invalid API response from /audiences:", apiResponse);
          throw new Error(
            "Failed to fetch audiences or invalid response format."
          );
        }

        // Transform the API response into the ContentItem format
        const audiencesContentItems = apiResponse.data.map(
          (audience: Audience) => {
            // Construct a human-readable text representation for each audience
            let text = `Audience: ${audience.name}\nID: ${audience.id}`;
            if (audience.description) {
              text += `\nDescription: ${audience.description}`;
            }

            return {
              uri: `jasper://audiences/${encodeURIComponent(
                audience.name.toLowerCase().replace(/\s+/g, "-")
              )}`,
              audienceId: audience.id,
              text: text,
            };
          }
        );

        return { contents: audiencesContentItems };
      } catch (error) {
        console.error("Error fetching Jasper audiences:", error);
        throw new Error(
          `Failed to retrieve Jasper audiences: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  );
  ("Jasper audiences resource registered.");
};
