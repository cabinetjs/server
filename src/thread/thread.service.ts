import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { BaseService } from "@common/base.service";

import { RawThread, Thread } from "@thread/models/thread.model";

@Injectable()
export class ThreadService extends BaseService<Thread, RawThread> {
    public constructor(@InjectRepository(Thread) threadRepository: Repository<Thread>) {
        super(Thread, threadRepository);
    }
}
