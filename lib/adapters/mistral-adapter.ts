import {
  AIProvider,
  ChatMessage,
  ChatOptions,
  ChatResult,
  RetryableProviderError,
} from "./types";

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const DEFAULT_MODEL = "mistral-large-latest";

export class MistralAdapter implements AIProvider {
  readonly name = "mistral";

  constructor(private readonly apiKey: string) {}

  async chatCompletion(
    messages: ChatMessage[],
    opts: ChatOptions = {}
  ): Promise<ChatResult> {
    const model = opts.model ?? DEFAULT_MODEL;

    const res = await fetch(MISTRAL_API_URL, {
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
      throw new RetryableProviderError(this.name, "rate_limited", "Mistral rate limit hit");
    }
    if (res.status >= 500) {
      throw new RetryableProviderError(this.name, "server_error", `Mistral ${res.status}`);
    }
    if (!res.ok) {
      throw new Error(`Mistral request failed: ${res.status} ${await res.text()}`);
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
