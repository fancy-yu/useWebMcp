/// <reference types="@mcp-b/webmcp-types" />

function isModelContextAvailable(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return !!navigator.modelContext;
}
/**
 * JSON Schema property definition.
 *
 * @see {@link https://json-schema.org/}
 */
export interface InputSchemaProperty {
  /**
   * JSON Schema type for this property.
   */
  type?: string;

  /**
   * Human-readable description of the property.
   */
  description?: string;

  /**
   * Additional JSON Schema keywords.
   */
  [key: string]: unknown;
}

/**
 * JSON Schema definition for tool input parameters.
 *
 * @see {@link https://json-schema.org/}
 */
export interface InputSchema {
  /**
   * JSON Schema type for the root value (usually `'object'` for tool args).
   */
  type?: string;

  /**
   * Property definitions for object schemas.
   */
  properties?: Record<string, InputSchemaProperty>;

  /**
   * List of required property names.
   */
  required?: readonly string[];

  /**
   * Additional JSON Schema keywords.
   */
  [key: string]: unknown;
}

export type WebMcpParams = Parameters<Navigator['modelContext']['registerTool']>['0'];
/**
 * WebMcp 主类
 * 封装 navigator.modelContext 操作
 */
export class WebMcp {
  webmcpAvaliable: boolean;
  private modelContext: Navigator['modelContext'] | undefined = navigator.modelContext;
  private mcpMap = new Map<string, WebMcpParams & { controller: AbortController }>();

  constructor() {
    this.webmcpAvaliable = isModelContextAvailable();
  }
  register = (params: WebMcpParams) => {
    const { name } = params;
    if (!this.webmcpAvaliable) return;
    const mcp = this.mcpMap.get(name);
    if (mcp) return;
    try {
      const abortController = new AbortController();
      this.modelContext?.registerTool?.(params, {
        signal: abortController.signal,
      });
      this.mcpMap.set(name, {
        ...params,
        controller: abortController,
      });
    } catch (error) {
      console.error(`Failed to register MCP tool ${name}:`, error);
    }
  };

  unregister = (name: string) => {
    if (!this.webmcpAvaliable) return;
    try {
      this.mcpMap.get(name)?.controller?.abort();
      this.mcpMap.delete(name);
    } catch (error) {
      console.error(`Failed to unregister MCP tool ${name}:`, error);
    }
  };
  clearContext = () => {
    if (!this.webmcpAvaliable) return;
    try {
      this.mcpMap.forEach((mcp) => {
        mcp.controller?.abort();
      });
      this.mcpMap.clear();
    } catch (error) {
      console.error('Failed to clear MCP context:', error);
    }
  };
}

export default WebMcp;
