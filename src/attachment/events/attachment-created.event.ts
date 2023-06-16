import { Attachment } from "@attachment/models/attachment.model";

export class AttachmentCreatedEvent {
    public readonly attachments: ReadonlyArray<Attachment>;

    public constructor(attachments: ReadonlyArray<Attachment>) {
        this.attachments = attachments;
    }
}
