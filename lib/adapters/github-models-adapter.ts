import {
  AIProvider,
  ChatMessage,
  ChatOptions,
  ChatResult,
  RetryableProviderError,
} from "./types";

const GITHUB_MODELS_API_URL = "https://models.inference.ai.azure.com/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

export class GitHubModelsAdapter implements AIProvider {
  readonly name = "github-models";

  constructor(private readonly githubToken: string) {}

  async chatCompletion(
    messages: ChatMessage[],
    opts: ChatOptions = {}
  ): Promise<ChatResult> {
    const model = opts.model ?? DEFAULT_MODEL;

    const res = await fetch(GITHUB_MODELS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.githubToken}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 1024,
      }),
    });

    if (res.status === 429) {
      throw new RetryableProviderError(
        this.name,
        "rate_limited",
        "GitHub Models rate limit hit"
      );
    }
    if (res.status >= 500) {
      throw new RetryableProviderError(this.name, "server_error", `GitHub Models ${res.status}`);
    }
    if (!res.ok) {
      throw new Error(`GitHub Models request failed: ${res.status} ${await res.text()}`);
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
