# use-web-mcp API Reference

Complete API documentation for the `use-web-mcp` library.

## Table of Contents

1. [Exports](#exports)
2. [WebMcpProvider](#webmcpprovider)
3. [useWebMcp Hook](#usewebmcp-hook)
4. [WebMcp Class](#webmcp-class)
5. [initWebMcp Function](#initwebmcp-function)
6. [Type Definitions](#type-definitions)

---

## Exports

```typescript
// Main exports
export { WebMcpProvider } from './context/WebMcpProvider';
export { useWebMcp } from './hooks/useWebMcp';
export { WebMcpContext } from './context/WebMcpContext';
export type { WebMcpParams } from './util';

// Initialize WebMCP polyfill
export const initWebMcp: (port?: string) => void;
```

**Import style:**

```typescript
import { WebMcpProvider, useWebMcp, initWebMcp } from 'use-web-mcp';
```

---

## WebMcpProvider

React Context Provider that enables WebMCP functionality for child components.

### Props

```typescript
interface WebMcpProviderProps {
  isTest?: boolean;      // Default: auto-detect from NODE_ENV
  autoClear?: boolean;   // Default: true
  children?: ReactNode;
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isTest` | `boolean` | `process.env.NODE_ENV === 'test' \|\| process.env.NODE_ENV === 'development'` | Enable WebMCP and print console logs |
| `autoClear` | `boolean` | `true` | Auto-unregister tools on component unmount. Set to `false` if embed.js has tool change detection issues |
| `children` | `ReactNode` | Required | Child components |

### Usage

```tsx
import { WebMcpProvider } from 'use-web-mcp';

function App() {
  return (
    <WebMcpProvider 
      isTest={process.env.NODE_ENV === 'development'}
      autoClear={false}
    >
      <MyComponent />
    </WebMcpProvider>
  );
}
```

### Behavior

- When `isTest=true`: Prints green console log "WebMCP is enabled"
- When `autoClear=true`: Tools are unregistered on component unmount
- When `autoClear=false`: Tools persist until page close (calls `clearContext()`)

---

## useWebMcp Hook

React Hook to register MCP tools in components.

### Signature

```typescript
function useWebMcp<T = Record<string, any>>(
  params: WebMcpParams<T>,
  config?: { depDataMap?: T }
): void;
```

### Parameters

#### params: WebMcpParams\<T\>

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Unique tool identifier |
| `description` | `string` | Yes | Tool description for AI |
| `execute` | `function` | Yes | Execution function |
| `inputSchema` | `object` | No | JSON Schema for parameters |

#### config: { depDataMap?: T }

| Property | Type | Description |
|----------|------|-------------|
| `depDataMap` | `T` | Reactive data passed to `execute` as first argument |

### execute Function Signature

```typescript
type ExecuteFunction<T> = (
  data?: T,           // depDataMap (if provided)
  ...args: any[]      // Arguments from AI agent call
) => any;
```

### Examples

**Basic usage:**

```tsx
useWebMcp({
  name: 'get-user-data',
  description: 'Get current user data',
  execute: () => {
    return { name: 'John', age: 30 };
  },
});
```

**With inputSchema:**

```tsx
useWebMcp({
  name: 'calculate',
  description: 'Perform calculation',
  inputSchema: {
    type: 'object',
    properties: {
      operation: { 
        type: 'string', 
        enum: ['add', 'subtract', 'multiply', 'divide'] 
      },
      a: { type: 'number' },
      b: { type: 'number' },
    },
    required: ['operation', 'a', 'b'],
  },
  execute: (_, { operation, a, b }) => {
    switch (operation) {
      case 'add': return a + b;
      case 'subtract': return a - b;
      case 'multiply': return a * b;
      case 'divide': return a / b;
    }
  },
});
```

**With depDataMap (reactive data):**

```tsx
function MyComponent() {
  const [count, setCount] = useState(0);

  useWebMcp(
    {
      name: 'get-count',
      description: 'Get current counter value',
      execute: (depData) => {
        // depData = latest count value
        return `Current count: ${depData}`;
      },
    },
    { depDataMap: count }
  );

  return <button onClick={() => setCount(c => c + 1)}>Increment</button>;
}
```

---

## WebMcp Class

Main class that wraps `navigator.modelContext` operations.

### Constructor

```typescript
const webMcp = new WebMcp();
```

Checks if `navigator.modelContext` is available.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `webmcpAvaliable` | `boolean` | Whether `navigator.modelContext` is available |

### Methods

#### register(params: WebMcpParams): void

Register an MCP tool.

```typescript
webMcp.register({
  name: 'my-tool',
  description: 'My tool description',
  execute: () => 'result',
});
```

**Behavior:**
- Checks if tool with same name already registered (skips if exists)
- Calls `navigator.modelContext.registerTool()` with AbortController
- Stores controller in internal map for cleanup

#### unregister(name: string): void

Unregister a specific tool by name.

```typescript
webMcp.unregister('my-tool');
```

**Behavior:**
- Aborts the tool's AbortController
- Removes from internal map

#### clearContext(): void

Unregister all registered tools.

```typescript
webMcp.clearContext();
```

**Behavior:**
- Aborts all AbortControllers
- Clears internal map

---

## initWebMcp Function

Initialize WebMCP polyfill and load required scripts.

### Signature

```typescript
function initWebMcp(port?: string): void;
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `port` | `string` | `'9333'` | Relay server port |

### Behavior

1. Calls `initializeWebMCPPolyfill()` from `@mcp-b/webmcp-polyfill`
2. Loads scripts sequentially:
   - `https://cdn.jsdelivr.net/npm/@mcp-b/global@latest/dist/index.iife.js`
   - `https://cdn.jsdelivr.net/npm/@mcp-b/webmcp-local-relay@latest/dist/browser/embed.js`
3. Sets `data-relay-port` attribute on embed.js script

### Usage

```typescript
import { initWebMcp } from 'use-web-mcp';

// In development only
if (process.env.NODE_ENV === 'development') {
  initWebMcp('9333');
}
```

---

## Type Definitions

### WebMcpParams\<T\>

```typescript
type WebMcpParams<T = Record<string, any>> = 
  Parameters<ModelContext['registerTool']>['0'] & {
    execute: (data?: T, ...args: ExecuteParams) => ReturnType<ToolDescriptor['execute']>;
  };
```

Extends the parameters of `navigator.modelContext.registerTool()` with a custom `execute` function.

### WebMcpContextValue

```typescript
interface WebMcpContextValue {
  isTest?: boolean;
  autoClear?: boolean;
  webMcp: WebMcp;
}
```

### ExecuteParams

```typescript
type ExecuteParams = Parameters<ToolDescriptor['execute']>;
```

Parameters passed from AI agent when calling the tool.

---

## JSON Schema Guide

When providing `inputSchema`, follow [JSON Schema](https://json-schema.org/) specification.

### Basic Types

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "number" },
    "active": { "type": "boolean" },
    "tags": { "type": "array", "items": { "type": "string" } },
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" }
      }
    }
  }
}
```

### Required Fields

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "number" }
  },
  "required": ["name"]
}
```

### Enums

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["pending", "active", "inactive"]
    }
  }
}
```

### Nested Objects

```json
{
  "type": "object",
  "properties": {
    "user": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" }
      },
      "required": ["name", "email"]
    }
  }
}
```

---

## Complete Example

```tsx
// src/main.tsx
import { initWebMcp } from 'use-web-mcp';

if (process.env.NODE_ENV === 'development') {
  initWebMcp();
}

// src/App.tsx
import { WebMcpProvider } from 'use-web-mcp';

function App() {
  return (
    <WebMcpProvider isTest={process.env.NODE_ENV === 'development'}>
      <Dashboard />
    </WebMcpProvider>
  );
}

// src/components/Dashboard.tsx
import { useWebMcp } from 'use-web-mcp';
import { useState } from 'react';

function Dashboard() {
  const [data, setData] = useState({ count: 0 });

  // Tool 1: Get data
  useWebMcp({
    name: 'get-dashboard-data',
    description: 'Get current dashboard data',
    execute: () => data,
  });

  // Tool 2: Update count
  useWebMcp({
    name: 'update-count',
    description: 'Update the counter',
    inputSchema: {
      type: 'object',
      properties: {
        value: { type: 'number', description: 'New count value' },
      },
      required: ['value'],
    },
    execute: (_, { value }) => {
      setData(prev => ({ ...prev, count: value }));
      return `Count updated to ${value}`;
    },
  });

  // Tool 3: Reset with depDataMap
  useWebMcp(
    {
      name: 'reset-data',
      description: 'Reset dashboard data to initial state',
      execute: (depData) => {
        setData(depData);
        return 'Data reset';
      },
    },
    { depDataMap: { count: 0 } }
  );

  return (
    <div>
      <h1>Count: {data.count}</h1>
    </div>
  );
}
```

---

## Troubleshooting

### WebMCP not available

**Symptom:** Tools not registered, no console logs.

**Solution:**
- Ensure `initWebMcp()` is called before rendering
- Verify local relay server is running
- Check `navigator.modelContext` exists in browser console

### Tools not appearing in AI agent

**Symptom:** AI cannot see or call registered tools.

**Solution:**
- Confirm `isTest` prop is `true`
- Check tool `name` is unique
- Verify `description` is clear and descriptive

### Execute function errors

**Symptom:** Tool execution fails or returns unexpected results.

**Solution:**
- Ensure return value is serializable (no functions, DOM elements, etc.)
- Check `inputSchema` matches actual parameters
- Use browser DevTools to inspect errors

### Tool change detection issues

**Symptom:** Agent doesn't detect newly registered tools.

**Solution:**
- Set `autoClear={false}` on `WebMcpProvider`
- Tools will persist until page close
- Known issue with `@mcp-b/webmcp-local-relay` embed.js

---

## References

- [JSON Schema Specification](https://json-schema.org/)
- [@mcp-b/webmcp-polyfill](https://www.npmjs.com/package/@mcp-b/webmcp-polyfill)
- [@mcp-b/webmcp-local-relay](https://www.npmjs.com/package/@mcp-b/webmcp-local-relay)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
