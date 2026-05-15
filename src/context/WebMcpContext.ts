import { createContext } from 'react';
import WebMcp from '../util';


export interface WebMcpContextValue {
  isTest?: boolean;
  /**
   * 是否自动注销mcp，目前mcp-b的embedjs脚本存在bug，ws在随着agent对话，会无法正常监听ontoolchange，这里建议autoClear设为false；
   * 注册的mcp会在页面关闭时统一注销。
   */
  autoClear?: boolean;
  webMcp: WebMcp;
}

export const WebMcpContext = createContext<WebMcpContextValue | null>(null);



