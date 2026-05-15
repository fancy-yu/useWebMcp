import { ReactNode, useEffect, useMemo } from "react";
import WebMcp from "../util";
import { WebMcpContext } from "./WebMcpContext";

export interface WebMcpProviderProps {
  /**
   * 是否为测试环境 默认process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' 为true时才会启用和注册mcp
   */
  isTest?: boolean;
  /**
 * 是否自动注销mcp，目前mcp-b的embedjs脚本存在bug，ws在随着agent对话，会无法正常监听ontoolchange，这里建议autoClear设为false；
 * 注册的mcp会在页面关闭时统一注销。
 */
  autoClear?: boolean;
  children?: ReactNode | any;
}

export const WebMcpProvider = (props: WebMcpProviderProps) => {
  const { isTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development', autoClear = true, children } = props;
  const webMcp = useMemo(() => new WebMcp(), []);
  useEffect(() => {
    if (isTest) {
      console.log('%cWebMcp is enabled', 'color: green; font-weight: bold;');
    }
  }, [isTest]);
  useEffect(() => {
    return () => {
      webMcp.clearContext();
    }
  }, [])
  const value = useMemo(() => {
    return {
      isTest,
      webMcp,
      autoClear,
    };
  }, [isTest, webMcp, autoClear]);


  return <WebMcpContext.Provider value={value}>{children}</WebMcpContext.Provider>;
};
