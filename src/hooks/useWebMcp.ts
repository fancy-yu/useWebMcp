import { useContext, useEffect } from 'react';
import { WebMcpParams } from '../util';
import WebMcpContext from '../context/WebMcpContext';


type useWebMcpParams = {} & WebMcpParams;
export const useWebMcp = (params: useWebMcpParams) => {
  const { ...webmcpParams } = params;
  const ctx = useContext(WebMcpContext);
  useEffect(() => {
    if (!ctx?.isTest) return;
    ctx?.webMcp?.register({
      ...webmcpParams,
    });
    return () => {
      ctx?.webMcp?.unregister(webmcpParams.name);
    };
  }, [webmcpParams.name]);
};
