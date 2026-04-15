import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Candidate, CandidateSchema } from '@bots/models/candidate.schema';
import { Interview, InterviewSchema } from '@bots/models/interview.schema';
import { DialogService } from '@bots/service';
import { RecruiterBot } from './recruiter.bot';
import { CandidateBot } from './candidate.bot';
import { AssessmentService } from '@assessment';
import { LlmModule } from '@llm';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Candidate.name, schema: CandidateSchema },
            { name: Interview.name, schema: InterviewSchema },
        ]),
        LlmModule,
    ],
    providers: [DialogService, AssessmentService, RecruiterBot, CandidateBot],
    exports: [DialogService, AssessmentService, RecruiterBot, CandidateBot],
})
export class DialogModule {}
