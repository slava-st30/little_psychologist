import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [LlmModule],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}