import { tavily } from '@tavily/core';

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>, context: { tavilyKey?: string }) => Promise<unknown>;
}

export const SEARCH_TOOL: Tool = {
  name: 'search_web',
  description: 'Search the web for up-to-date information, location data, company details, or market trends.',
  parameters: {
    query: { type: 'string', description: 'The search query' },
  },
  execute: async (args: Record<string, unknown>, { tavilyKey }) => {
    const { query } = args as { query: string };
    if (!tavilyKey) throw new Error('Tavily API key required for search');
    const tvly = tavily({ apiKey: tavilyKey });
    const result = await tvly.search(query, {
      searchDepth: 'basic',
      maxResults: 5,
    });
    return result;
  },
};

export const TOOLS: Tool[] = [SEARCH_TOOL];

export const TOOL_DEFINITIONS = TOOLS.map(t => ({
  name: t.name,
  description: t.description,
  parameters: t.parameters
}));
