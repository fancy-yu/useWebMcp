# use-web-mcp

基于 `navigator.modelContext` 的 React 集成库，提供 `WebMcpProvider`、`useWebMcp` Hook 和 `WebMcp` 类。
只有开发环境可用，isTest为true时
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
import { WebMcpProvider, useWebMcp, loadmcpScript } from 'use-web-mcp'

// 1. 在应用入口加载 webmcp polyfill（仅开发环境）
loadmcpScript('9333')

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
  // 注册mcp
  useWebMcp({
    name: 'get-xxx-form',
    description: '读取当前自动评测任务表单的完整内容（JSON 格式）。返回当前页面用户已填写的表单数据快照。',
    execute: () => {
      const form = handlers.getForm();
      if (!form) {
        return '当前表单异常';
      }
      return form.getState().values;
    },
  });

  return (
    <div>
      <p>Test Mode: {isTest ? 'ON' : 'OFF'}</p>
      <button onClick={handleRegister}>Register Tool</button>
      <button onClick={handleUnregister}>Unregister Tool</button>
    </div>
  )
}
```


## API

### `WebMcpProvider`

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | 必填 | 子组件 |
| `isTest` | `boolean` | `false` | 是否开启测试模式（控制台打印日志） |

### `useWebMcp()` Hook 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `isTest` | `boolean` | 是否测试模式 |
| `webMcp` | `WebMcp` | WebMcp 实例 |

### `WebMcp` 类

```ts
const webMcp = new WebMcp()
```

| 方法 | 说明 |
|------|------|
| `register(params: WebMcpParams)` | 注册一个 MCP 工具（调用 `navigator.modelContext.registerTool`） |
| `unregister(name: string)` | 卸载指定工具（abort 对应的 controller） |
| `clearContext()` | 卸载所有已注册的工具 |

### `loadmcpScript(port?)`

动态加载 webmcp polyfill 脚本，这里请在测试环境下执行

```ts
loadmcpScript('9333') // 指定 relay 端口，默认 9333
```

## 开发

```bash
npm install
npm run dev      # 开发模式
npm run build     # 构建库（输出到 dist/）
```

## License

MIT
