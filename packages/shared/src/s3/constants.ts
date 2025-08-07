export const S3_REGION = "eu-central-1";
export const S3_BUCKET_NAME = "react-native-apps-koko"; // one bucet to rule all mobile apps of mine
export const S3_FEATURE_FOLDERS = ["add-contact-recordings", "add-multiple-contacts-recordings"] as const


export const getFileUrl = async (fileKey: string) => {
  const fileUrl = `${getBaseUrl()}/${fileKey}`;
  return fileUrl;
};

export const getBaseUrl = () => {
  return `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com`;
};