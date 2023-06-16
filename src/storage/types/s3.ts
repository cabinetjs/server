import { CreateBucketCommand, HeadBucketCommand, PutObjectCommand, S3 } from "@aws-sdk/client-s3";

import { Attachment } from "@attachment/models/attachment.model";

import { BaseStorage, BaseStorageOptions } from "@storage/types/base";

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

export interface S3StorageData {
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
        };
    }
}
