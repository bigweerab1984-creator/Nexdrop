export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface ChatResult {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
}

export class RetryableProviderError extends Error {
  constructor(
    public readonly provider: string,
    public readonly cause: "rate_limited" | "server_error" | "timeout",
    message: string
  ) {
    super(message);
    this.name = "RetryableProviderError";
  }
}

export interface AIProvider {
  readonly name: string;
  chatCompletion(messages: ChatMessage[], opts?: ChatOptions): Promise<ChatResult>;
}
