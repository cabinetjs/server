import { is } from "typia";

import {
    CreateBucketCommand,
    GetObjectCommand,
    HeadBucketCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3,
} from "@aws-sdk/client-s3";

import { Attachment } from "@attachment/models/attachment.model";

import { BaseData, BaseStorage, BaseStorageOptions } from "@storage/types/base";

import { Fetcher } from "@utils/fetcher";

export interface S3StorageOptions extends BaseStorageOptions<"s3"> {
    bucketName: string;
    region: string;
    endpoint?: string;
    credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
    };
}

export interface S3StorageData extends BaseData {
    bucketName: string;
    key: string;
}

export class S3Storage extends BaseStorage<"s3", S3StorageOptions, S3StorageData> {
    private readonly s3: S3;
    private readonly fetcher = new Fetcher();

    public constructor(options: S3StorageOptions) {
        super("s3", options);

        this.s3 = new S3({
            region: options.region,
            credentials: options.credentials,
            endpoint: options.endpoint,
        });
    }

    private async ensureBucket() {
        try {
            await this.s3.send(new HeadBucketCommand({ Bucket: this.options.bucketName }));
        } catch {
            await this.s3.send(new CreateBucketCommand({ Bucket: this.options.bucketName }));
        }
    }

    public async doInitialize(): Promise<void> {
        await this.ensureBucket();
    }
    public async doStore(attachment: Attachment): Promise<S3StorageData> {
        const buffer = await this.fetcher.download(attachment.url);

        await this.s3.send(
            new PutObjectCommand({
                Bucket: this.options.bucketName,
                Key: `${attachment.uid}${attachment.extension}`,
                Body: buffer,
            }),
        );

        return {
            bucketName: this.options.bucketName,
            key: `${attachment.uid}${attachment.extension}`,
            buffer,
        };
    }
    public async doCheckStored(attachment: Attachment): Promise<boolean> {
        if (!attachment.storageData) {
            return false;
        }

        if (!is<S3StorageData>(attachment.storageData)) {
            return false;
        }

        try {
            await this.s3.send(
                new HeadObjectCommand({
                    Bucket: attachment.storageData.bucketName,
                    Key: attachment.storageData.key,
                }),
            );
        } catch {
            return false;
        }

        return true;
    }

    public async pull(attachment: Attachment): Promise<Buffer> {
        if (!attachment.storageData) {
            throw new Error("Attachment is not stored");
        }

        if (!is<S3StorageData>(attachment.storageData)) {
            throw new Error("Stored data is invalid");
        }

        const { Body } = await this.s3.send(
            new GetObjectCommand({
                Bucket: attachment.storageData.bucketName,
                Key: attachment.storageData.key,
            }),
        );

        if (!Body) {
            throw new Error("Attachment is not stored");
        }

        return Buffer.from(await Body.transformToByteArray());
    }
}
