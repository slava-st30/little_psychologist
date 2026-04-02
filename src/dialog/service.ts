import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { Candidate } from './models/candidate.schema';
import { Interview } from './models/interview.schema';

export interface InterviewWithCandidate {
    candidateId: Types.ObjectId;
    candidateChatId: number;
    answers: string[];
    report?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    candidate: Candidate;
}

@Injectable()
export class DialogService {
    constructor(
        @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
        @InjectModel(Interview.name) private interviewModel: Model<Interview>,
    ) {}

    async createCandidate(recruiterChatId: number, name: string, profession = 'waiter'): Promise<Candidate> {
        const token = randomBytes(8).toString('hex');
        return this.candidateModel.create({ recruiterChatId, name, token, profession });
    }

    async findByToken(token: string): Promise<Candidate | null> {
        return this.candidateModel.findOne({ token });
    }

    async hasStartedInterview(candidateId: Types.ObjectId): Promise<boolean> {
        const interview = await this.interviewModel.findOne({ candidateId });
        return interview !== null && (interview as any).status !== 'pending';
    }

    async createInterview(candidateId: Types.ObjectId, candidateChatId: number): Promise<Interview> {
        return this.interviewModel.create({ candidateId, candidateChatId, status: 'in_progress' });
    }

    async markInProgress(candidateId: Types.ObjectId): Promise<void> {
        await this.interviewModel.findOneAndUpdate({ candidateId }, { status: 'in_progress' });
    }

    async saveReport(candidateId: Types.ObjectId, answers: string[], report: string): Promise<void> {
        await this.interviewModel.findOneAndUpdate(
            { candidateId },
            { answers, report, status: 'completed' },
        );
    }

    async cancelInterview(candidateId: Types.ObjectId): Promise<void> {
        await this.interviewModel.findOneAndUpdate({ candidateId }, { status: 'cancelled' });
    }

    async cancelInterviewByChatId(candidateChatId: number): Promise<void> {
        await this.interviewModel.findOneAndUpdate({ candidateChatId }, { status: 'cancelled' });
    }

    async deleteCandidate(candidateId: Types.ObjectId): Promise<void> {
        await this.candidateModel.findByIdAndDelete(candidateId);
        await this.interviewModel.deleteMany({ candidateId });
    }

    async getInterviewsByRecruiter(recruiterChatId: number): Promise<InterviewWithCandidate[]> {
        const candidates = await this.candidateModel.find({ recruiterChatId });
        const candidateIds = candidates.map((c) => c._id);
        const interviews = await this.interviewModel
            .find({ candidateId: { $in: candidateIds } })
            .lean();

        return interviews.map((interview) => ({
            ...interview,
            candidate: candidates.find((c) => c._id.equals(interview.candidateId as Types.ObjectId))!,
        })) as unknown as InterviewWithCandidate[];
    }
}
