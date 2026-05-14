import { WebMcpParams } from './util'
import WebMcpContext from './context/WebMcpContext'
import { useWebMcp } from './hooks/useWebMcp'

export { WebMcpContext, useWebMcp }
export type { WebMcpParams }

export const loadmcpScript = (port = '9333') => {
  if (typeof window !== 'undefined') {
    const mcpbjs = 'https://cdn.jsdelivr.net/npm/@mcp-b/global@latest/dist/index.iife.js';
    const EMBED_SRC = 'https://cdn.jsdelivr.net/npm/@mcp-b/webmcp-local-relay@latest/dist/browser/embed.js';
    const webmcpDepjs = [mcpbjs, EMBED_SRC];

    // embed.js 默认连接 ws://127.0.0.1:9333
    // 通过 <script data-relay-host/data-relay-port> 显式指定，避免端口对不上导致
    // 浏览器报 "WebSocket is closed before the connection is established."。
    // webmcpDepjs 按顺序依次加载：前一个加载完成后再加载下一个，
    // 避免 embed.js 在 @mcp-b/global 尚未初始化前执行，导致 polyfill / relay 注册失败。
    const loadScriptSequentially = (urls: string[], index = 0): void => {
      if (index >= urls.length) return;
      const script = document.createElement('script');
      script.src = urls[index];
      script.async = false;
      if (urls[index] === EMBED_SRC) {
        script.setAttribute('data-relay-port', port);
      }
      script.onload = () => loadScriptSequentially(urls, index + 1);
      script.onerror = () => {
        // eslint-disable-next-line no-console
        console.warn('[webmcp] script load failed:', urls[index]);
      };
      document.head.appendChild(script);
    };
    loadScriptSequentially(webmcpDepjs);
  }
};