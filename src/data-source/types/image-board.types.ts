/* eslint-disable @typescript-eslint/no-namespace */

export namespace BoardAPIResponse {
    export interface Root {
        boards: Board[];
    }

    export interface Board {
        board: string;
        title: string;
        ws_board: number;
        per_page: number;
        pages: number;
        max_filesize: number;
        max_webm_filesize: number;
        max_comment_chars: number;
        max_webm_duration: number;
        bump_limit: number;
        image_limit: number;
        cooldowns: CoolDowns;
        meta_description: string;
        spoilers?: number;
        custom_spoilers?: number;
        is_archived?: number;
        forced_anon?: number;
        board_flags?: BoardFlags;
    }

    export interface CoolDowns {
        threads: number;
        replies: number;
        images: number;
    }

    export interface BoardFlags {
        AB: string;
        XY: string;
    }
}

export namespace CatalogAPIResponse {
    export type Root = Root2[];

    export interface Root2 {
        page: number;
        threads: Thread[];
    }

    export interface BaseThread {
        no: number;
        sticky?: number;
        closed?: number;
        now: string;
        name: string;
        sub?: string;
        com: string;
        time: number;
        resto: number;
        capcode?: string;
        semantic_url: string;
        replies: number;
        images: number;
        omitted_posts: number;
        omitted_images: number;
        last_replies: LastReply[];
        last_modified: number;
        bumplimit?: number;
        imagelimit?: number;
    }

    export interface AttachmentThread extends BaseThread {
        tim: number;
        filename: string;
        ext: string;
        fsize: number;
        md5: string;
        w: number;
        h: number;
        tn_w: number;
        tn_h: number;
    }

    export interface LastReply {
        no: number;
        now: string;
        name: string;
        com: string;
        filename?: string;
        ext?: string;
        w?: number;
        h?: number;
        tn_w?: number;
        tn_h?: number;
        tim?: number;
        time: number;
        md5?: string;
        fsize?: number;
        resto: number;
        capcode?: string;
    }

    export type Thread = BaseThread | AttachmentThread;
}

export namespace ThreadsAPIResponse {
    export interface Root {
        posts: Post[];
    }

    export interface BasePost {
        no: number;
        sticky?: number;
        closed?: number;
        now: string;
        name: string;
        sub?: string;
        com: string;
        time: number;
        resto: number;
        capcode: string;
        semantic_url?: string;
        replies?: number;
        images?: number;
        unique_ips?: number;
    }

    export interface Attachment {
        tim: number;
        filename: string;
        ext: string;
        fsize: number;
        md5: string;
        w: number;
        h: number;
        tn_w: number;
        tn_h: number;
    }

    export type Post = BasePost | (BasePost & Attachment);
}

export namespace ArchiveAPIResponse {
    export type Root = number[];
}
