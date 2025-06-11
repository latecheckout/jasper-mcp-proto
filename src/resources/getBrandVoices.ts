import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeJasperRequest } from "../utils/api.js";
export interface Tone {
  id: string;
  name: string;
  value: string;
}

const GET_BRAND_VOICES_ENDPOINT = "/tones";

/**
 * Fetches all Jasper AI Brand Voices using the makeJasperRequest utility.
 *
 * @returns A promise that resolves to an array of Tone objects,
 *          or null if an error occurs or the response is not as expected.
 */
export async function getBrandVoices(): Promise<Tone[] | null> {
  try {
    // The API is expected to return an array of Tone objects directly.
    const data = await makeJasperRequest<{}, { data: Tone[] }>(
      GET_BRAND_VOICES_ENDPOINT,
      "GET"
    );
    return data?.data || null;
  } catch (error) {
    console.error("Error in getBrandVoices resource function:", error);
    return null;
  }
}

export function registerGetBrandVoicesResource(server: McpServer) {
  server.resource(
    "jasper-brand-voices", // Resource name
    "jasper://brandvoices", // Resource URI (clients will use this)
    async (requestUri: URL) => {
      const brandVoices = await getBrandVoices();

      if (brandVoices && Array.isArray(brandVoices) && brandVoices.length > 0) {
        const contents = brandVoices.map((tone) => {
          const readableText = `Name: ${tone.name}\n\n${tone.value}`;
          return {
            uri: `jasper://brandvoices/${encodeURIComponent(tone.name)}`,
            tone_id: tone.id,
            text: readableText,
          };
        });
        return { contents };
      } else if (
        brandVoices &&
        Array.isArray(brandVoices) &&
        brandVoices.length === 0
      ) {
        return {
          contents: [
            {
              uri: requestUri.href,
              text: "No Jasper AI brand voices found.",
            },
          ],
        };
      } else {
        return {
          contents: [
            {
              uri: requestUri.href,
              text: `Error fetching Jasper AI brand voices or unexpected format. Please check server logs. ${brandVoices}`,
            },
          ],
        };
      }
    }
  );
}
