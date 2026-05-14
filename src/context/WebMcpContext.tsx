import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import WebMcp from '../util';


export interface WebMcpContextValue {
  isTest?: boolean;
  webMcp: WebMcp;
}

export const WebMcpContext = createContext<WebMcpContextValue | null>(null);

export interface WebMcpProviderProps {
  children: ReactNode;
  isTest?: boolean;
}

export const WebMcpProvider: React.FC<WebMcpProviderProps> = (props) => {
  const { isTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development', children } = props ?? {};
  const webMcp = useMemo(() => new WebMcp(), []);
  useEffect(() => {
    if (isTest) {
      console.log('%cWebMcp is enabled', 'color: green; font-weight: bold;');
    }
  }, []);
  const value = useMemo(() => {
    return {
      isTest,
      webMcp,
    };
  }, []);

  return <WebMcpContext.Provider value={value}>{children}</WebMcpContext.Provider>;
};

export function useWebMcpContext(): WebMcpContextValue {
  const context = useContext(WebMcpContext);
  if (!context) {
    throw new Error('useWebMcpContext must be used within a WebMcpProvider');
  }
  return context;
}

export default WebMcpContext;
