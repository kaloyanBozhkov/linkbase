import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client } from "./client";
import { getFileUrl, S3_BUCKET_NAME } from "@linkbase/shared/src";

export const getFileUrlIfExists = async (
  fileKey: string
): Promise<string | null> => {
  try {
    const s3Client = getS3Client();
    await s3Client.send(
      new HeadObjectCommand({ Bucket: S3_BUCKET_NAME, Key: fileKey })
    );
    await s3Client.send(
      new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: fileKey })
    );
    return getFileUrl(fileKey);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.name === "NotFound") {
      return null;
    } else {
      throw error;
    }
  }
};
