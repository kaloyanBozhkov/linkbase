import axios from "axios";
import { getBaseUrl } from "@linkbase/shared/src";
import { env } from "@/env";
import { API_CONFIG } from "@/config/api.config";

export class S3Service {
  /**
   * Get a pre-signed URL from the API route
   * @param fileName - Name of the file
   * @param fileType - MIME type of the file
   * @returns A pre-signed upload URL
   */
  static async getPresignedUrl(
    fileKey: string,
    fileType: string,
    folder: string,
    userId: string
  ) {
    const response = await axios.get<{
      presignedUrl: string;
      destinationUrl: string;
    }>(`${API_CONFIG.BASE_URL}/s3/upload-url`, {
      params: {
        fileKey,
        contentType: fileType,
        folder: `${env.EXPO_PUBLIC_S3_APP_FOLDER_NAME}/${folder}`,
      },
      headers: {
        "x-user-id": userId,
      },
    });

    if (response.status !== 200) {
      throw new Error("Failed to get pre-signed URL");
    }

    console.log("response", response);
    return response.data;
  }

  /**
   * Upload the file to S3 using the pre-signed URL
   * @param uploadUrl - Pre-signed URL
   * @param file - File to be uploaded
   * @param fileType - MIME type of the file
   */
  static async uploadFileToS3({
    uploadUrl,
    file,
    onUploadProgress,
    fileType,
  }: {
    uploadUrl: string;
    file: File;
    fileType: string;
    onUploadProgress?: (progress: number) => void;
  }): Promise<void> {
    const reader = new FileReader();
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

    const response = await axios.put(uploadUrl, arrayBuffer, {
      headers: {
        "Content-Type": fileType,
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
        );
        console.log(`Upload Progress: ${progress}%`);
        onUploadProgress?.(progress);
      },
    });

    console.log(`Upload completed with status: ${response.status}`);

    if (response.status !== 200) {
      throw new Error("Failed to upload file to S3");
    }
  }

  static getBucketPath(userId: string, fileName: string) {
    return `${userId}/${fileName}`;
  }

  static getBaseUrl() {
    return `${getBaseUrl()}/${env.EXPO_PUBLIC_S3_APP_FOLDER_NAME}`;
  }
  static getFileUrlFromFullPath(path: string) {
    return `${S3Service.getBaseUrl()}/${path}`;
  }
}
