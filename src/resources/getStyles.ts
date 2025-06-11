// src/resources/getStyles.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeJasperRequest } from "../utils/api.js";

const GET_STYLES_ENDPOINT = "/styles"; // TODO: Verify this endpoint
type Style = {
  id: string;
};

export async function getStyles(): Promise<Style[] | null> {
  try {
    const response = await makeJasperRequest<{}, { data: Style[] }>(
      GET_STYLES_ENDPOINT,
      "GET"
    );

    return response?.data || null;
  } catch (error) {
    console.error("Error in getStyles resource function:", error);
    return null;
  }
}

export function registerGetStylesResource(server: McpServer) {
  server.resource(
    "jasper-styles", // Resource name
    "jasper://styles", // Resource URI (clients will use this)
    async (uri: URL) => {
      const styles = await getStyles(); // Call the existing function to fetch styles
      if (styles) {
        const contents = styles.map((style) => {
          return {
            uri: `jasper://styles/${style.id}`,
            style_id: style.id,
            text: `Jasper Style ID: ${style.id}`,
          };
        });
        return {
          contents,
        };
      } else {
        return {
          contents: [
            {
              uri: uri.href,
              text: "Error fetching Jasper AI styles. Please check server logs.",
            },
          ],
        };
      }
    }
  );
}
