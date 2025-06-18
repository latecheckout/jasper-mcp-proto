import { z } from "zod";
import { makeJasperRequest } from "../utils/api.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
interface SearchKnowledgeResponse {
  data: any;
  error: string | null;
}
export interface SearchKnowledgeRequest {
  query: string;
  options?: {
    dedupByDocId?: boolean;
    retrievalFilterThresholdMaxDocs?: number;
    retrievalFilterThresholdScore?: number;
    enableReranker?: boolean;
    knowledgeIds?: string[];
  };
}

/**
 * Registers the run-jasper-command tool with the MCP server.
 * This tool allows executing a command via the Jasper AI API.
 * @param server The MCP server instance.
 * @todo Confirm the actual Jasper AI endpoint for running commands.
 * 
 
 */
const SEARCH_KNOWLEDGE_BASE_DESCRIPTION = `The Jasper Knowledge Base holds info on your company's clients, internal business (strategy docs, updates, etc.), and marketing content.

Use Jasper AI's /searchKnowledge endpoint to find relevant documents using short, Google-style keyword queries or phrases. This tool surfaces related documents—it does not answer questions directly.

Output modes:
- **knowledgeIds only**: For passing source docs to another tool (e.g., content generation). Example: "take the AGM meeting notes and turn it into an investor update"—request only knowledgeIds for generate-content.
- **Summaries**: For topic overviews. Example: "what do we know about customer X?"—request document summaries.
- **Full Text**: For specific details/answers. Example: "did we meet our targets last quarter?"—request full text of relevant docs.

Choose output (knowledgeIds, summaries, text, or any combination) to match your query. Queries should be general and discovery-oriented, not direct Q&A.`;

const SEARCH_KNOWLEDGE_BASE_INPUT_SCHEMA = {
  query: z.string().describe("The search query string."),
  dedupByDocId: z
    .boolean()
    .optional()
    .default(false)
    .describe("Deduplicate by document ID."),
  retrievalFilterThresholdMaxDocs: z
    .number()
    .optional()
    .default(10)
    .describe("Max docs for retrieval filter threshold."),
  retrievalFilterThresholdScore: z
    .number()
    .optional()
    .default(0.5)
    .describe("Score threshold for retrieval filter."),
  enableReranker: z
    .boolean()
    .optional()
    .default(false)
    .describe("Enable reranker for search results."),
  knowledgeIds: z
    .array(z.string())
    .optional()
    .describe("Restrict search to these knowledge IDs."),
  includeText: z
    .boolean()
    .optional()
    .default(true)
    .describe("Include the text of each file in the result."),
  includeSummary: z
    .boolean()
    .optional()
    .default(true)
    .describe("Include the summary of each file in the result."),
  includeTags: z
    .boolean()
    .optional()
    .default(true)
    .describe("Include the tags of each file in the result."),
};

export function registerSearchKnowledgeBaseTool(server: McpServer) {
  server.tool(
    "search-knowledge-base",
    SEARCH_KNOWLEDGE_BASE_DESCRIPTION,
    SEARCH_KNOWLEDGE_BASE_INPUT_SCHEMA,
    async ({
      query,
      dedupByDocId,
      retrievalFilterThresholdMaxDocs,
      retrievalFilterThresholdScore,
      enableReranker,
      knowledgeIds,
      includeText = true,
      includeSummary = true,
      includeTags = true,
    }: {
      query: string;
      dedupByDocId?: boolean;
      retrievalFilterThresholdMaxDocs?: number;
      retrievalFilterThresholdScore?: number;
      enableReranker?: boolean;
      knowledgeIds?: string[];
      includeText?: boolean;
      includeSummary?: boolean;
      includeTags?: boolean;
    }) => {
      const endpoint = "/searchKnowledge";
      const payload: any = { query };
      const options: any = {
        retrievalFilterThresholdScore: retrievalFilterThresholdScore ?? 0.5,
      };
      if (dedupByDocId !== undefined) options.dedupByDocId = dedupByDocId;
      if (retrievalFilterThresholdMaxDocs !== undefined)
        options.retrievalFilterThresholdMaxDocs =
          retrievalFilterThresholdMaxDocs;
      if (enableReranker !== undefined) options.enableReranker = enableReranker;
      if (knowledgeIds !== undefined) options.knowledgeIds = knowledgeIds;
      if (Object.keys(options).length > 0) payload.options = options;

      const result = await makeJasperRequest<
        typeof payload,
        SearchKnowledgeResponse
      >(endpoint, "POST", payload);

      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to make request to Jasper AI for search-knowledge.",
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

      // Format result.data as text for now (MCP text type)
      let text = "No results.";
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        text = result.data
          .map(
            (item: any, idx: number) =>
              `Result ${idx + 1}:\n${JSON.stringify(item, null, 2)}`
          )
          .join("\n\n");
      } else if (result.data) {
        text = JSON.stringify(result.data, null, 2);
      }
      return {
        content: result.data
          .sort((a: any, b: any) => b.score - a.score)
          .map((item: any) => {
            let parts: string[] = [
              `Filename: ${item.name}`,
              `knowledgeId: ${item.id}`,
            ];
            if (includeTags && item.tags) {
              parts.push(`Tags: ${item.tags.join(", ")}`);
            }
            parts.push(`Score: ${item.score}`);
            if (includeSummary && item.summary) {
              parts.push(`Summary: ${item.summary}`);
            }
            if (includeText && item.text) {
              parts.push(`Text: ${item.text}`);
            }
            return {
              type: "text",
              text: parts.join("\n\n"),
            };
          }),
      };
    }
  );
}
