import { NextRequest, NextResponse } from 'next/server';
import { logBrainActivity } from '@/lib/logger';
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
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    logBrainActivity('ai', `Thinking about: ${lastUserMessage.substring(0, 50)}...`);

    const systemMessage = {
      role: 'system',
      content: `You are the "Second Brain", a highly advanced AI assistant.
      You excel at:
      1. Solving complex multi-step problems.
      2. Writing clean, efficient, and well-documented code in any language.
      3. Thinking critically and providing deep insights.
      4. Assisting the user in organizing their thoughts.

      When writing code, always use triple backticks with the language specified.
      Be concise but thorough.`
    };

    const result = await registry.chat([systemMessage, ...messages]);
    logBrainActivity('ai', `Responded using ${result.provider} (${result.model})`);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
