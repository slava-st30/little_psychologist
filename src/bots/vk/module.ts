import { Module } from '@nestjs/common';
import { VkRecruiterBot } from './recruiter.bot';
import { VkCandidateBot } from './candidate.bot';
import { DialogModule } from '../tg/module';

@Module({
    imports: [DialogModule],
    providers: [VkRecruiterBot, VkCandidateBot],
})
export class VkModule {}
