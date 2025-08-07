import { Request, Response, Router } from "express";
import { z } from "zod";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client } from "../s3/client";
import { env } from "@/env";
import { S3_REGION, S3_BUCKET_NAME } from "@linkbase/shared";

const s3Router: Router = Router();

// Define the query schema
const querySchema = z.object({
  fileKey: z.string().min(1, "fileKey is required"),
  folder: z.string().min(1, "folder is required"),
  contentType: z.string().min(1, "contentType is required"),
});

s3Router.get("/upload-url", async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const { fileKey, contentType, folder } = querySchema.parse(req.query);
    const userId = req.headers["x-user-id"] as string; // middleware guaranteed
    const fileNameWithExtension = fileKey.includes(".")
      ? fileKey
      : `${fileKey}.${contentType.split("/")[1]}`;
    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: `${
        env.NODE_ENV === "development" ? "dev" : "prod"
      }/${folder}/${userId}/${fileNameWithExtension}`,
      ContentType: contentType,
    };

    const s3 = getS3Client();
    const cmd = new PutObjectCommand(params);
    const presignedUrl = await getSignedUrl(s3, cmd, {
      expiresIn: 60 * 3 * 1000,
    });

    const getObjectCmd = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: params.Key,
    });

    const signedGetUrl = await getSignedUrl(s3, getObjectCmd, {
      expiresIn: 60 * 20, // 20 minutes
    });

    return res.status(200).json({
      presignedUrl,
      destinationUrl: signedGetUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid request parameters",
        details: error.errors,
      });
    }

    console.error("Error generating pre-signed URL:", error);
    return res.status(500).json({ error: "Failed to generate upload URL" });
  }
});
export default s3Router;
