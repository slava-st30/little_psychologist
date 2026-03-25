import { Module } from '@nestjs/common';
import { ChatService } from './service';
import { AssessmentService } from '../assessment';
import { LlmModule } from '../llm';

@Module({
    imports: [LlmModule],
    providers: [ChatService, AssessmentService],
    exports: [ChatService, AssessmentService],
})
export class ChatModule {}
