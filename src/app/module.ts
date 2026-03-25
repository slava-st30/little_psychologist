import { Module } from '@nestjs/common';
import { ChatModule } from '../chat';
import { LlmModule } from '../llm';

@Module({
    imports: [ChatModule, LlmModule],
})
export class AppModule {}
