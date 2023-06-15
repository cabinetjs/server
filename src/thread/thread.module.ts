import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ThreadService } from "@thread/thread.service";
import { Thread } from "@thread/models/thread.model";

@Module({
    imports: [TypeOrmModule.forFeature([Thread])],
    providers: [ThreadService],
    exports: [ThreadService],
})
export class ThreadModule {}
