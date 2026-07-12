import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface StructuredCompletionParams {
  system: string;
  userContent: string;
  schema: Record<string, unknown>;
  effort?: 'low' | 'medium' | 'high';
  maxTokens?: number;
}

/**
 * Thin wrapper around the Anthropic SDK for single-shot, structured-output
 * completions. Callers never see raw SDK errors — auth/network/refusal
 * failures are all normalized to a 503 so the rest of the app degrades
 * gracefully when ANTHROPIC_API_KEY isn't configured yet.
 */
@Injectable()
export class AnthropicService {
  private readonly logger = new Logger(AnthropicService.name);
  private readonly client: Anthropic;

  constructor(config: ConfigService) {
    this.client = new Anthropic({
      apiKey: config.get<string>('ANTHROPIC_API_KEY'),
      timeout: 30_000,
    });
  }

  async createStructuredCompletion<T>(
    params: StructuredCompletionParams,
  ): Promise<T> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: params.maxTokens ?? 1024,
        system: params.system,
        thinking: { type: 'adaptive' },
        output_config: {
          effort: params.effort ?? 'medium',
          format: { type: 'json_schema', schema: params.schema },
        },
        messages: [{ role: 'user', content: params.userContent }],
      });

      if (response.stop_reason === 'refusal') {
        throw new ServiceUnavailableException(
          'AI service declined to respond.',
        );
      }

      const textBlock = response.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text',
      );
      if (!textBlock) {
        throw new ServiceUnavailableException(
          'AI service returned no content.',
        );
      }

      return JSON.parse(textBlock.text) as T;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      this.logger.error(
        'Anthropic API call failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw new ServiceUnavailableException(
        'AI service is currently unavailable.',
      );
    }
  }
}
