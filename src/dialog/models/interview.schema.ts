import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InterviewStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

@Schema({ timestamps: true })
export class Interview extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
    candidateId!: Types.ObjectId;

    @Prop({ required: true })
    candidateChatId!: number;

    @Prop({ type: [String], default: [] })
    answers!: string[];

    @Prop()
    report?: string;

    @Prop({ type: String, default: 'pending' })
    status!: InterviewStatus;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);
