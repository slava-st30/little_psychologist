import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [ChatModule, LlmModule],
})
export class AppModule {}