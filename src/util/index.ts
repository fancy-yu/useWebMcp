import type{ ModelContext, ToolDescriptor } from "@mcp-b/webmcp-types";

function isModelContextAvailable(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return !!navigator.modelContext;
}

export type ExecuteParams = Parameters<ToolDescriptor['execute']>
export type WebMcpParams<T = Record<string, any>> = Parameters<ModelContext['registerTool']>['0'] & {
  execute: (data?: T, ...args: ExecuteParams) => ReturnType<ToolDescriptor['execute']>;
}
/**
 * WebMcp 主类
 * 封装 navigator.modelContext 操作
 */
export class WebMcp {
  webmcpAvaliable: boolean;
  private mcpMap = new Map<string, WebMcpParams & { controller: AbortController }>();

  constructor() {
    this.webmcpAvaliable = isModelContextAvailable();
  }
  register = (params: WebMcpParams) => {
    const { name } = params;
    if (!this.webmcpAvaliable) return;
    const mcp = this.mcpMap.get(name);
    if (mcp) {
      return;
    }
    try {
      const abortController = new AbortController();
      (navigator?.modelContext?.registerTool as any)?.(params, {
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
      const target = this.mcpMap.get(name);
      if (target?.controller) {
        target.controller.abort();
        this.mcpMap.delete(name);
      }
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
