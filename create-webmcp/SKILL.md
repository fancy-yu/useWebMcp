---
name: create-webmcp
description: Guide for creating WebMCP tools in React applications using the use-web-mcp library. This skill should be used when users want to create, register, or manage Model Context Protocol (MCP) tools in web applications, integrate AI agent tools with React components, or enable web applications to communicate with AI models via navigator.modelContext API.
---

# Create WebMCP

## Overview

This skill provides comprehensive guidance for creating WebMCP tools in React applications using the `use-web-mcp` library. WebMCP (Web Model Context Protocol) enables web applications to expose tools and capabilities to AI agents through the `navigator.modelContext` API.

Key capabilities:
- Initialize WebMCP polyfill in development environment
- Register MCP tools using React Hook (`useWebMcp`)
- Manage tool lifecycle with `WebMcpProvider` context
- Enable AI agents to interact with web application data and functions

## Workflow

### Step 1: Install Dependencies

Install the `use-web-mcp` library in your React project:

```bash
npm install use-web-mcp
```

**Requirements:**
- React >= 16.8.0 (peer dependency, must be installed separately)

### Step 2: Initialize WebMCP Polyfill

In your application entry point (e.g., `src/main.tsx` or `src/index.tsx`), initialize the WebMCP polyfill **only in development environment**:

```tsx
import { initWebMcp } from 'use-web-mcp';

// Initialize WebMCP with default port 9333
if (process.env.NODE_ENV === 'development') {
  initWebMcp('9333');
}
```

**What `initWebMcp` does:**
- Loads `@mcp-b/webmcp-polyfill` to polyfill `navigator.modelContext`
- Dynamically loads required scripts from CDN:
  - `https://cdn.jsdelivr.net/npm/@mcp-b/global@latest/dist/index.iife.js`
  - `https://cdn.jsdelivr.net/npm/@mcp-b/webmcp-local-relay@latest/dist/browser/embed.js`
- Connects to local relay server at specified port (default: 9333)

**Important:** Only run in development environment. The polyfill requires a running local relay server.

### Step 3: Wrap Application with WebMcpProvider

Use the `WebMcpProvider` component to wrap your application, enabling WebMCP context for all child components:

```tsx
import { WebMcpProvider } from 'use-web-mcp';

function App() {
  return (
    <WebMcpProvider isTest={process.env.NODE_ENV === 'development'}>
      <MyComponent />
    </WebMcpProvider>
  );
}
```

**WebMcpProvider Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isTest` | `boolean` | `process.env.NODE_ENV === 'test' \|\| process.env.NODE_ENV === 'development'` | Enable WebMCP functionality and print console logs |
| `autoClear` | `boolean` | `true` | Automatically unregister tools on component unmount. Set to `false` if experiencing issues with agent tool change detection |
| `children` | `ReactNode` | Required | Child components |

**Note:** When `autoClear` is `false`, registered tools will be cleared only when the page closes.

### Step 4: Register MCP Tools with useWebMcp Hook

Use the `useWebMcp` Hook in your components to register MCP tools that AI agents can call:

```tsx
import { useWebMcp } from 'use-web-mcp';

function MyComponent() {
  // Register an MCP tool
  useWebMcp({
    name: 'get-form-data',
    description: 'Retrieve the current form data as JSON. Returns the complete form state.',
    execute: () => {
      const form = getFormInstance();
      if (!form) {
        return 'Form not found';
      }
      return form.getState().values;
    },
  });

  return <div>{/* Your component JSX */}</div>;
}
```

**WebMcpParams (Tool Registration Parameters):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | Unique identifier for the tool |
| `description` | `string` | Yes | Description of what the tool does (visible to AI) |
| `execute` | `function` | Yes | Function to execute when the tool is called |
| `inputSchema` | `object` | No | JSON Schema defining the tool's input parameters |

**execute Function Signature:**

```typescript
type ExecuteFunction<T = Record<string, any>> = (
  data?: T,
  ...args: ExecuteParams
) => ReturnType<ToolDescriptor['execute']>;
```

**Using depDataMap for Reactive Data:**

To pass reactive data to the execute function, use the `config` parameter:

```tsx
function MyComponent() {
  const [formData, setFormData] = useState({});

  useWebMcp(
    {
      name: 'get-form-data',
      description: 'Get current form data',
      execute: (depData) => {
        // depData contains the latest formData
        return depData;
      },
    },
    { depDataMap: formData }
  );

  return <div>{/* Component JSX */}</div>;
}
```

The `depDataMap` is passed as the first argument to `execute`, allowing access to the latest state.

### Step 5: Advanced Usage with WebMcp Class

For advanced use cases, access the `WebMcp` class instance directly through context:

```tsx
import { useContext } from 'react';
import { WebMcpContext } from 'use-web-mcp';

function MyComponent() {
  const ctx = useContext(WebMcpContext);
  
  const handleManualRegister = () => {
    ctx?.webMcp?.register({
      name: 'manual-tool',
      description: 'Manually registered tool',
      execute: () => 'Hello from manual tool',
    });
  };

  const handleUnregister = () => {
    ctx?.webMcp?.unregister('manual-tool');
  };

  return (
    <div>
      <button onClick={handleManualRegister}>Register Tool</button>
      <button onClick={handleUnregister}>Unregister Tool</button>
    </div>
  );
}
```

**WebMcp Class Methods:**

| Method | Description |
|--------|-------------|
| `register(params: WebMcpParams)` | Register an MCP tool |
| `unregister(name: string)` | Unregister a specific tool by name |
| `clearContext()` | Unregister all registered tools |

## Complete Example

Here's a complete example integrating all steps:

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { initWebMcp } from 'use-web-mcp';
import App from './App';

// Initialize WebMCP in development
if (process.env.NODE_ENV === 'development') {
  initWebMcp('9333');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```tsx
// src/App.tsx
import { WebMcpProvider } from 'use-web-mcp';
import MyComponent from './MyComponent';

function App() {
  return (
    <WebMcpProvider isTest={process.env.NODE_ENV === 'development'}>
      <MyComponent />
    </WebMcpProvider>
  );
}

export default App;
```

```tsx
// src/MyComponent.tsx
import { useWebMcp } from 'use-web-mcp';

function MyComponent() {
  // Register a tool to get page title
  useWebMcp({
    name: 'get-page-title',
    description: 'Get the current page title',
    execute: () => {
      return document.title;
    },
  });

  // Register a tool with input schema
  useWebMcp({
    name: 'calculate-sum',
    description: 'Calculate the sum of two numbers',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number', description: 'First number' },
        b: { type: 'number', description: 'Second number' },
      },
      required: ['a', 'b'],
    },
    execute: (_, { a, b }) => {
      return a + b;
    },
  });

  return (
    <div>
      <h1>WebMCP Demo</h1>
      <p>Check browser console for WebMcp logs in development mode.</p>
    </div>
  );
}

export default MyComponent;
```

## Troubleshooting

**WebMCP not working:**
- Ensure `initWebMcp()` is called before rendering the app
- Verify local relay server is running on the specified port
- Check browser console for errors

**Tools not appearing in AI agent:**
- Confirm `isTest` prop is `true` on `WebMcpProvider`
- Verify tool names are unique
- Check that `navigator.modelContext` is available in browser console

**Tool execution errors:**
- Ensure `execute` function returns serializable data
- Check tool parameter types match `inputSchema`
- Review browser console for error messages

## Resources

### references/

Place additional documentation in the `references/` directory:
- `api_reference.md` - Detailed API documentation
- `json_schema_guide.md` - Guide for writing JSON Schema for input parameters
- `relay_setup.md` - Instructions for setting up local relay server

### scripts/

No scripts are required for this skill. The `use-web-mcp` library handles all scripting needs.

### assets/

No assets are required for this skill. 

---

**Delete any unused directories (scripts/, assets/) if not needed for this skill.**
