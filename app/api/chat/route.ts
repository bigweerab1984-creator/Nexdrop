import { NextRequest, NextResponse } from 'next/server';
import { logBrainActivity, initLogger } from '@/lib/logger';
import { executeTool } from '@/lib/tools';
import { retrieveContext } from '@/lib/rag';
import { AdapterRegistry } from '@/lib/adapters/adapter-registry';
import { GroqAdapter } from '@/lib/adapters/groq-adapter';
import { MistralAdapter } from '@/lib/adapters/mistral-adapter';
import { CerebrasAdapter } from '@/lib/adapters/cerebras-adapter';
import { GitHubModelsAdapter } from '@/lib/adapters/github-models-adapter';

const providers = [];
if (process.env.GROQ_API_KEY) providers.push(new GroqAdapter(process.env.GROQ_API_KEY));
if (process.env.MISTRAL_API_KEY) providers.push(new MistralAdapter(process.env.MISTRAL_API_KEY));
if (process.env.CEREBRAS_API_KEY) providers.push(new CerebrasAdapter(process.env.CEREBRAS_API_KEY));
if (process.env.GITHUB_TOKEN) providers.push(new GitHubModelsAdapter(process.env.GITHUB_TOKEN));

if (providers.length === 0) {
  providers.push({
    name: 'mock',
    chatCompletion: async (messages: any[]) => ({
      content: "I'm in demo mode because no AI API keys are configured. Please set GROQ_API_KEY, MISTRAL_API_KEY, etc. in your .env.local",
      provider: 'mock',
      model: 'mock'
    })
  } as any);
}

const registry = new AdapterRegistry(providers);

export async function POST(req: NextRequest) {
  try {
    await initLogger();
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    logBrainActivity('ai', `Thinking about: ${lastUserMessage.substring(0, 50)}...`);

    // RAG: Retrieve context from long-term memory
    const memoryContext = await retrieveContext(lastUserMessage);
    if (memoryContext) {
      logBrainActivity('ai', 'Retrieved relevant context from long-term memory');
    }

    const systemMessage = {
      role: 'system',
      content: `You are the "Second Brain", a highly advanced AI assistant.
      You excel at:
      1. Solving complex multi-step problems.
      2. Writing clean, efficient, and well-documented code.
      3. Analyzing and explaining the local codebase.

      ${memoryContext ? `LONG-TERM MEMORY CONTEXT:\n${memoryContext}\n` : ''}

      TOOLS:
      You have access to tools to help you answer questions about the current project.
      To use a tool, output a JSON block in this format:
      {"tool": "read_file", "path": "path/to/file"}
      {"tool": "list_files", "path": "directory/path"}
      {"tool": "search_web", "query": "search query"}

      After you output a tool call, wait for the response.
      When writing code, always use triple backticks with the language specified.
      Be concise but thorough.`
    };

    let chatMessages = [systemMessage, ...messages];
    let result = await registry.chat(chatMessages);

    // Simple tool execution loop (max 3 iterations)
    for (let i = 0; i < 3; i++) {
      const toolMatch = result.content.match(/\{"tool":\s*".*?"\}/);
      if (toolMatch) {
        try {
          const toolCall = JSON.parse(toolMatch[0]);
          logBrainActivity('ai', `Executing tool: ${toolCall.tool}`);
          const toolResult = await executeTool(toolCall);

          chatMessages.push({ role: 'assistant', content: result.content });
          chatMessages.push({ role: 'user', content: `TOOL_RESULT: ${JSON.stringify(toolResult)}` });

          result = await registry.chat(chatMessages);
        } catch (err) {
          break;
        }
      } else {
        break;
      }
    }

    logBrainActivity('ai', `Responded using ${result.provider} (${result.model})`);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
