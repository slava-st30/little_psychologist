import { Injectable, OnModuleInit } from '@nestjs/common';
import { VK } from 'vk-io';
import { AssessmentService } from '../../assessment';
import { DialogService } from '../service';
import { VkRecruiterBot } from './recruiter.bot';

@Injectable()
export class VkCandidateBot implements OnModuleInit {
    private vk: VK;

    constructor(
        private readonly assessmentService: AssessmentService,
        private readonly dialogService: DialogService,
        private readonly recruiterBot: VkRecruiterBot,
    ) {
        this.vk = new VK({
            token: process.env.CANDIDATE_BOT_TOKEN_VK as string,
            apiVersion: '5.199',
        });
    }

    private async send(peerId: number, message: string): Promise<void> {
        await this.vk.api.messages.send({
            peer_id: peerId,
            message,
            random_id: Math.floor(Math.random() * 1e9),
        } as any);
    }

    private async typing(peerId: number): Promise<void> {
        await (this.vk.api.messages as any)
            .setActivity({
                peer_id: peerId,
                type: 'typing',
                group_id: parseInt(process.env.CANDIDATE_VK_GROUP_ID!),
            })
            .catch(() => {});
    }

    private async sendLong(peerId: number, text: string): Promise<void> {
        const MAX = 4096;
        for (let i = 0; i < text.length; i += MAX) {
            await this.send(peerId, text.slice(i, i + MAX));
            if (i + MAX < text.length) {
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }
        }
    }

    onModuleInit() {
        this.vk.updates.on('message_new' as any, async (ctx: any) => {
            if (ctx.isOutbox) return;

            const peerId: number = ctx.peerId;
            const text: string = ctx.text?.trim() ?? '';
            const ref: string | undefined = ctx.message?.ref;

            // Отмена интервью
            if (text.toLowerCase() === 'отмена') {
                if (this.assessmentService.isAssessmentActive(peerId)) {
                    this.assessmentService.cancelAssessment(peerId);
                    await this.dialogService.cancelInterviewByChatId(peerId);
                    await this.send(peerId, '❌ Интервью отменено.');
                }
                return;
            }

            // Старт по ref-ссылке
            if (ref && !this.assessmentService.isAssessmentActive(peerId)) {
                const candidate = await this.dialogService.findByToken(ref);
                if (!candidate) {
                    await this.send(peerId, 'Ссылка недействительна.');
                    return;
                }
                const started = await this.dialogService.hasStartedInterview(candidate._id as any);
                if (started) {
                    await this.send(peerId, 'Эта ссылка уже была использована.');
                    return;
                }
                await this.dialogService.createInterview(candidate._id as any, peerId);
                this.assessmentService.startAssessmentForCandidate(
                    peerId,
                    candidate._id as any,
                    candidate.name,
                    candidate.recruiterChatId,
                );
                const [instruction, question] = this.assessmentService.getStartMessages();
                const plainInstruction = instruction.replace(/\*+/g, '').replace(/`/g, '');
                await this.send(peerId, `Привет, ${candidate.name}!\n\n${plainInstruction}`);
                await new Promise((resolve) => setTimeout(resolve, 1500));
                await this.send(peerId, question);
                return;
            }

            // Ответы на вопросы интервью
            if (this.assessmentService.isAssessmentActive(peerId)) {
                try {
                    await this.typing(peerId);
                    const [response, meta] = await this.assessmentService.handleAnswer(peerId, text);
                    if (response) {
                        if (meta?.completed && meta.report && meta.recruiterChatId) {
                            await this.send(peerId, '🙏 Спасибо за прохождение интервью! Ваши ответы получены.');

                            const answersText =
                                meta.answers?.map((a, i) => `Вопрос ${i + 1}:\n${a}`).join('\n\n') ?? '';

                            await this.recruiterBot.sendMessageToRecruiter(
                                meta.recruiterChatId,
                                `Кандидат: ${meta.candidateName}\n\nОтветы:\n\n${answersText}`,
                            );
                            await this.recruiterBot.sendMessageToRecruiter(
                                meta.recruiterChatId,
                                `Анализ:\n\n${meta.report}`,
                            );
                        } else {
                            const plain = response.replace(/\*+/g, '').replace(/`/g, '');
                            await this.sendLong(peerId, plain);
                        }
                    }
                } catch (e) {
                    console.error(e);
                    await this.send(peerId, 'Произошла ошибка. Попробуйте ещё раз.');
                }
                return;
            }

            // По умолчанию
            if (this.assessmentService.isAssessmentCompleted(peerId)) {
                await this.send(peerId, 'Вы уже прошли интервью. Спасибо!');
            } else {
                await this.send(peerId, 'Для начала интервью воспользуйтесь ссылкой от рекрутера.');
            }
        });

        this.vk.updates.start().catch(console.error);
    }
}
