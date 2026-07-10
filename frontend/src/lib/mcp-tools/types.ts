/**
 * Shared TypeScript types for MCP tool definitions and results.
 * Kept minimal — only what's needed to define tools and return results.
 */

/** JSON Schema object used in tool input schemas */
export interface JsonSchema {
  type: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  items?: JsonSchema;
}

/** MCP tool definition (subset of MCP spec) */
export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonSchema;
}

/** MCP content block */
export type McpContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mimeType: string }
  | { type: "resource"; resource: { uri: string; mimeType?: string; text?: string } };

/** MCP tools/call result */
export interface McpCallToolResult {
  content: McpContentBlock[];
  /** Set to true if the tool encountered an error */
  isError?: boolean;
}

/** User document shape passed into tool handlers */
export interface McpUserContext {
  _id: string;
  email: string;
  credits: number;
  isPro: boolean;
  videoAccess: boolean;
  mcpAccess: boolean;
}
