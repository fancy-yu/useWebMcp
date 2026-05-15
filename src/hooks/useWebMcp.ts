import { useContext, useEffect, useRef } from 'react';
import { ExecuteParams, WebMcpParams } from '../util';
import { WebMcpContext } from '../context/WebMcpContext';

/**
 * React Hook 用于注册 WebMCP 工具
 * @description 在 React 组件中注册 Model Context Protocol (MCP) 工具，使 AI Agent 能够调用组件提供的功能
 * @param params - MCP 工具注册参数
 * @param params.name - 工具的唯一标识符
 * @param params.description - 工具的功能描述（AI Agent 可见）
 * @param params.inputSchema - 可选的参数 JSON Schema 定义
 * @param params.execute - 工具被执行时调用的函数
 * @param config - 可选的配置对象
 * @param config.depDataMap - execute依赖的响应式数据，会作为 execute 函数的第一个参数传入
 * @example
 * // 带参数验证的用法
 * useWebMcp({
 *   name: 'calculate',
 *   description: '执行计算操作',
 *   inputSchema: {
 *     type: 'object',
 *     properties: {
 *       operation: { type: 'string', enum: ['add', 'subtract'] },
 *       a: { type: 'number' },
 *       b: { type: 'number' },
 *     },
 *     required: ['operation', 'a', 'b'],
 *   },
 *   execute: (_, { operation, a, b }) => {
 *     return operation === 'add' ? a + b : a - b;
 *   },
 * });
 * 
 * @example
 * // 使用 depDataMap 传递响应式数据
 * const [count, setCount] = useState(0);
 * 
 * useWebMcp(
 *   {
 *     name: 'get-count',
 *     description: '获取当前计数',
 *     execute: (data) => {
 *       return `当前计数: ${data.count}`;
 *     },
 *   },
 *   { depDataMap: count }
 * );
 */
export const useWebMcp = <T = Record<string, any>>(
  params: WebMcpParams<T>,
  config?: { depDataMap?: T }
) => {
  const { depDataMap } = config ?? {};
  const ctx = useContext(WebMcpContext);

  // 用 ref 保存最新参数，避免闭包
  const depDataRef = useRef<T>(depDataMap as T);
  depDataRef.current = depDataMap as T;

  useEffect(() => {
    if (!ctx?.isTest) return;
    const wrappedParams = {
      ...params,
      execute: ((...args: ExecuteParams) => {
        if (!depDataMap) return params.execute?.(...args);
        const latestDepData = depDataRef.current;
        return params.execute?.(latestDepData, ...args);
      }) as WebMcpParams['execute'],
    };
    ctx?.webMcp?.register(wrappedParams);
    return () => {
      if (ctx.autoClear) ctx?.webMcp?.unregister(wrappedParams.name);
    };
  }, []);
};
