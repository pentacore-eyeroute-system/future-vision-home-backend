import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid4 } from "uuid";
import config from '../config/env.js';

const AWS_ACCESS_KEY_ID = config.s3.accessKeyId;
const AWS_SECRET_ACCESS_KEY = config.s3.secretAccessKey;
const S3_BUCKET_REGION = config.s3.s3BucketRegion;
const S3_BUCKET_NAME = config.s3.s3BucketName;

const s3 = new S3Client({
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
    region: S3_BUCKET_REGION,
});

export class AwsService {
    async uploadVisionistaPic(file) {
        const folderName = 'visionistas-pictures';
        const extension = file.mimetype.split('/')[1];
        const fileKey = `${folderName}/${uuid4()}.${extension}`;

        const uploadParameters = {
            Bucket: S3_BUCKET_NAME,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(uploadParameters);

        await s3.send(command);

        return fileKey;
    };

    async getVisionistaPic(fileKey) {
        const bucketParameters = {
            Bucket: S3_BUCKET_NAME,
            Key: fileKey,
        };

        const command = new GetObjectCommand(bucketParameters);

        const url = await getSignedUrl(s3, command, { expiresIn: 60 * 10 });

        return url;
    };
}