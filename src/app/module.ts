import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DialogModule } from '@bots/tg/module';
import { VkModule } from '@bots/vk/module';

@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGODB_URI as string),
        DialogModule,
        VkModule,
    ],
})
export class AppModule {}
