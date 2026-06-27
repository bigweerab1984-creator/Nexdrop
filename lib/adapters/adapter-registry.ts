import { AIProvider, ChatMessage, ChatOptions, ChatResult, RetryableProviderError } from "./types";

const MAX_ATTEMPTS = 4;
const COOLDOWN_MS = 60_000;

interface CooldownEntry {
  until: number;
}

export class AdapterRegistry {
  private readonly defaultOrder: AIProvider[];
  private readonly cooldowns = new Map<string, CooldownEntry>();

  constructor(providersInPriorityOrder: AIProvider[]) {
    if (providersInPriorityOrder.length === 0) {
      throw new Error("AdapterRegistry requires at least one provider");
    }
    this.defaultOrder = providersInPriorityOrder;
  }

  async chat(
    messages: ChatMessage[],
    opts: ChatOptions = {},
    overrideOrder?: string[]
  ): Promise<ChatResult> {
    const chain = this.resolveChain(overrideOrder);

    let lastError: Error | undefined;
    let attempts = 0;

    for (const provider of chain) {
      if (attempts >= MAX_ATTEMPTS) break;

      if (this.isCoolingDown(provider.name)) {
        continue;
      }

      attempts++;

      try {
        return await provider.chatCompletion(messages, opts);
      } catch (err) {
        if (err instanceof RetryableProviderError) {
          this.startCooldown(provider.name);
          lastError = err;
          continue;
        }
        throw err;
      }
    }

    throw new Error(
      `All providers exhausted or cooling down. Last error: ${lastError?.message ?? "none"}`
    );
  }

  private resolveChain(overrideOrder?: string[]): AIProvider[] {
    if (!overrideOrder || overrideOrder.length === 0) {
      return this.defaultOrder;
    }

    const byName = new Map(this.defaultOrder.map((p) => [p.name, p]));
    const resolved = overrideOrder
      .map((name) => byName.get(name))
      .filter((p): p is AIProvider => p !== undefined);

    return resolved.length > 0 ? resolved : this.defaultOrder;
  }

  private isCoolingDown(providerName: string): boolean {
    const entry = this.cooldowns.get(providerName);
    if (!entry) return false;
    if (Date.now() >= entry.until) {
      this.cooldowns.delete(providerName);
      return false;
    }
    return true;
  }

  private startCooldown(providerName: string): void {
    this.cooldowns.set(providerName, { until: Date.now() + COOLDOWN_MS });
  }
}
