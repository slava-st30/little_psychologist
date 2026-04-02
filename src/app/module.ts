import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DialogModule } from '../dialog/module';

@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGODB_URI as string),
        DialogModule,
    ],
})
export class AppModule {}
