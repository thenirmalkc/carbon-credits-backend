import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { RequestOptions } from 'openai/internal/request-options';

@Injectable()
export class OpenaiService {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async completion(
    body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
    options?: RequestOptions,
  ) {
    const completion = await this.client.chat.completions.create(body, options);
    return completion.choices[0].message.content;
  }
}
