export const JASPER_API_BASE = "https://api.jasper.ai/v1";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"; // Add more as needed

/**
 * Makes a request to the Jasper AI API.
 * @param endpoint The API endpoint to hit (e.g., '/run-command').
 * @param method The HTTP method to use.
 * @param payload The request payload (optional, typically for POST/PUT/PATCH).
 * @returns Promise with the response data or null if the request fails.
 */
export async function makeJasperRequest<Req, Res>(
  endpoint: string,
  method: HttpMethod,
  payload?: Req // Payload is now optional
): Promise<Res | null> {
  const url = `${JASPER_API_BASE}${endpoint}`;
  const apiKey = process.env.JASPER_API_KEY;

  if (!apiKey) {
    throw new Error("JASPER_API_KEY environment variable is not set.");
  }

  const headers: HeadersInit = {
    // Type headers for clarity
    "X-API-Key": apiKey,
  };

  const fetchOptions: RequestInit = {
    // Type fetchOptions
    method,
    headers,
  };

  if (
    payload &&
    (method === "POST" || method === "PUT" || method === "PATCH")
  ) {
    headers["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(payload);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let errorBody = null;
    try {
      errorBody = await response.json();
    } catch (e) {
      // Ignore
    }
    console.error(
      `Jasper API HTTP error! Status: ${
        response.status
      }, URL: ${url}, Method: ${method}, Response: ${JSON.stringify(
        errorBody || response.statusText
      )}`
    );
    throw new Error(
      `Jasper API HTTP error! Status: ${response.status}, Method: ${method}`
    );
  }

  // Handle cases where response might be empty (e.g., 204 No Content)
  const contentType = response.headers.get("content-type");
  if (
    response.status === 204 ||
    !contentType ||
    !contentType.includes("application/json")
  ) {
    return null;
  }

  return (await response.json()) as Res;
}
