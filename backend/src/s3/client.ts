import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../env";
import { S3_REGION } from "@linkbase/shared";

export const getS3Client = () =>
  new S3Client({
    region: S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
