import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BoardService } from "@board/board.service";
import { BoardResolver } from "@board/board.resolver";

import { PostModule } from "@post/post.module";
import { AttachmentModule } from "@attachment/attachment.module";

import { Board } from "@board/models/board.model";

@Module({
    imports: [TypeOrmModule.forFeature([Board]), PostModule, AttachmentModule],
    providers: [BoardService, BoardResolver],
    exports: [BoardService],
})
export class BoardModule {}
