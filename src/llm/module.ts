import { Module } from '@nestjs/common';
import { LlmService } from './service';

@Module({
    providers: [LlmService],
    exports: [LlmService],
})
export class LlmModule {}
