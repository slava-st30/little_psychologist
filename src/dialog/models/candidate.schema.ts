import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Candidate extends Document {
    @Prop({ required: true })
    recruiterChatId!: number;

    @Prop({ required: true })
    name!: string;

    @Prop({ required: true, unique: true })
    token!: string;

    @Prop({ default: 'waiter' })
    profession!: string;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
