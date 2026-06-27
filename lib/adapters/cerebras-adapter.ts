import {
  AIProvider,
  ChatMessage,
  ChatOptions,
  ChatResult,
  RetryableProviderError,
} from "./types";

const CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions";
const DEFAULT_MODEL = "qwen-3-235b-a22b";

export class CerebrasAdapter implements AIProvider {
  readonly name = "cerebras";

  constructor(private readonly apiKey: string) {}

  async chatCompletion(
    messages: ChatMessage[],
    opts: ChatOptions = {}
  ): Promise<ChatResult> {
    const model = opts.model ?? DEFAULT_MODEL;

    const res = await fetch(CEREBRAS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 1024,
      }),
    });

    if (res.status === 429) {
      throw new RetryableProviderError(this.name, "rate_limited", "Cerebras rate limit hit");
    }
    if (res.status >= 500) {
      throw new RetryableProviderError(this.name, "server_error", `Cerebras ${res.status}`);
    }
    if (!res.ok) {
      throw new Error(`Cerebras request failed: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0]?.message?.content ?? "";

    return {
      content: choice,
      provider: this.name,
      model,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
      },
    };
  }
}
