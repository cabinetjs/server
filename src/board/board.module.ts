import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BoardService } from "@board/board.service";

import { Board } from "@board/models/board.model";

@Module({
    imports: [TypeOrmModule.forFeature([Board])],
    providers: [BoardService],
    exports: [BoardService],
})
export class BoardModule {}
