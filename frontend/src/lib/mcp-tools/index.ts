/**
 * index.ts — MCP tool registry
 *
 * Single import point for all v1 MCP tools.
 * Exports the full tools/list array and the dispatcher map.
 */

export { listAvatarsDefinition,     executeListAvatars     } from "./list-avatars";
export { generateImageDefinition,   executeGenerateImage   } from "./generate-image";
export { generateVideoDefinition,   executeGenerateVideo   } from "./generate-video";
export { getCreditBalanceDefinition, executeGetCreditBalance } from "./get-credit-balance";

import { listAvatarsDefinition }      from "./list-avatars";
import { generateImageDefinition }    from "./generate-image";
import { generateVideoDefinition }    from "./generate-video";
import { getCreditBalanceDefinition } from "./get-credit-balance";
import type { McpToolDefinition }     from "./types";

/** All tool definitions returned by tools/list */
export const ALL_TOOL_DEFINITIONS: McpToolDefinition[] = [
  listAvatarsDefinition,
  generateImageDefinition,
  generateVideoDefinition,
  getCreditBalanceDefinition,
];

/** Tool names as a union type for exhaustive dispatch */
export type MCP_TOOL_NAME =
  | "list_avatars"
  | "generate_image"
  | "generate_video"
  | "get_credit_balance";

export type { McpToolDefinition, McpCallToolResult, McpUserContext } from "./types";
