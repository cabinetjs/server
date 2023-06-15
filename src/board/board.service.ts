import { Repository } from "typeorm";

import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";

import { Board, RawBoard } from "@board/models/board.model";

import { BaseService } from "@common/base.service";

@Injectable()
export class BoardService extends BaseService<Board, RawBoard> {
    public constructor(@InjectRepository(Board) boardRepository: Repository<Board>) {
        super(Board, boardRepository);
    }
}
