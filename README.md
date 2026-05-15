# use-web-mcp

基于 `navigator.modelContext` 的 React 集成库，提供 `WebMcpProvider`、`useWebMcp` Hook 和 `WebMcp` 类。

当 `isTest` 为 `true` 时，控制台会打印绿色日志：

```
WebMcp is enabled
```

## 安装

```bash
npm install use-web-mcp
```

> 依赖 `react >= 16.8.0`（需使用者自行安装）

## 使用示例

### 基础用法

```tsx
import { WebMcpProvider, useWebMcp, initWebMcp } from 'use-web-mcp'

// 1. 在应用入口加载 webmcp polyfill（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  initWebMcp('9333')
}

// 2. 用 Provider 包裹应用
function App() {
  return (
    <WebMcpProvider isTest={process.env.NODE_ENV === 'development'}>
      <MyComponent />
    </WebMcpProvider>
  )
}
```

### 在组件中使用 `useWebMcp`

```tsx
import { useWebMcp } from 'use-web-mcp'

function MyComponent() {
  // 注册 MCP 工具
  useWebMcp({
    name: 'get-form-data',
    description: '获取当前表单数据',
    execute: () => {
      const form = getForm();
      if (!form) {
        return '表单不存在';
      }
      return form.getState().values;
    },
  });

  return <div>My Component</div>
}
```

### 使用 `depDataMap` 传递响应式数据

```tsx
import { useWebMcp } from 'use-web-mcp'
import { useState } from 'react'

function MyComponent() {
  const [count, setCount] = useState(0);

  // 使用 depDataMap 传递响应式数据
  useWebMcp(
    {
      name: 'get-count',
      description: '获取当前计数',
      execute: (depData) => {
        return `当前计数: ${depData.count}`;
      },
    },
    { depDataMap: count }
  );

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  )
}
```

### 使用 `inputSchema` 定义参数

```tsx
import { useWebMcp } from 'use-web-mcp'

function MyComponent() {
  // 带参数验证的工具
  useWebMcp({
    name: 'calculate',
    description: '执行计算操作',
    inputSchema: {
      type: 'object',
      properties: {
        operation: { 
          type: 'string', 
          enum: ['add', 'subtract', 'multiply', 'divide'],
          description: '运算类型'
        },
        a: { type: 'number', description: '第一个数字' },
        b: { type: 'number', description: '第二个数字' },
      },
      required: ['operation', 'a', 'b'],
    },
    execute: ({ operation, a, b }) => {
      switch (operation) {
        case 'add': return a + b;
        case 'subtract': return a - b;
        case 'multiply': return a * b;
        case 'divide': return a / b;
      }
    },
  });

  return <div>Calculator Tool Registered</div>
}
```

### 手动管理 MCP 工具

```tsx
import { useContext } from 'react'
import { WebMcpContext } from 'use-web-mcp'

function ToolManager() {
  const ctx = useContext(WebMcpContext);
  
  const handleRegister = () => {
    ctx?.webMcp?.register({
      name: 'manual-tool',
      description: '手动注册的工具',
      execute: () => 'Hello from manual tool',
    });
  };

  const handleUnregister = () => {
    ctx?.webMcp?.unregister('manual-tool');
  };

  return (
    <div>
      <button onClick={handleRegister}>注册工具</button>
      <button onClick={handleUnregister}>卸载工具</button>
    </div>
  )
}
```

## API

### `WebMcpProvider`

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | 必填 | 子组件 |
| `isTest` | `boolean` | `process.env.NODE_ENV === 'test' \|\| process.env.NODE_ENV === 'development'` | 是否开启测试模式（控制台打印日志） |
| `autoClear` | `boolean` | `true` | 是否在组件卸载时自动卸载 MCP 工具。目前 mcp-b 的 embed.js 存在 bug，建议设为 `false` |

### `useWebMcp()` Hook

在 React 组件中注册 MCP 工具。

```ts
useWebMcp<T = Record<string, any>>(
  params: WebMcpParams<T>,
  config?: { depDataMap?: T }
): void
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `params.name` | `string` | 是 | 工具的唯一标识符 |
| `params.description` | `string` | 是 | 工具的功能描述（AI Agent 可见） |
| `params.inputSchema` | `object` | 否 | 参数的 JSON Schema 定义 |
| `params.execute` | `function` | 是 | 工具被执行时调用的函数 |
| `config.depDataMap` | `T` | 否 | 响应式数据，会作为 execute 的第一个参数传入 |

### `WebMcp` 类

```ts
const webMcp = new WebMcp()
```

| 方法 | 说明 |
|------|------|
| `register(params: WebMcpParams)` | 注册一个 MCP 工具（调用 `navigator.modelContext.registerTool`） |
| `unregister(name: string)` | 卸载指定工具（abort 对应的 controller） |
| `clearContext()` | 卸载所有已注册的工具 |

### `initWebMcp(port?)`

动态加载 webmcp polyfill 脚本，请在测试环境下执行。

```ts
initWebMcp('9333') // 指定 relay 端口，默认 9333
```

该函数会：
1. 调用 `initializeWebMCPPolyfill()` 初始化 polyfill
2. 按顺序加载以下脚本：
   - `https://cdn.jsdelivr.net/npm/@mcp-b/global@latest/dist/index.iife.js`
   - `https://cdn.jsdelivr.net/npm/@mcp-b/webmcp-local-relay@latest/dist/browser/embed.js`
3. 设置 relay 端口连接本地服务器



## License

MIT
