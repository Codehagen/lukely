import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 configuration
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || "";

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file to Cloudflare R2
 * @param file - File buffer to upload
 * @param filename - Name of the file
 * @param contentType - MIME type of the file
 * @returns Public URL of the uploaded file
 */
export async function uploadToR2(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const key = `quiz-images/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  const url = `${PUBLIC_URL}/${key}`;

  return { url, key };
}

/**
 * Validate if file is an image
 */
export function isValidImageType(contentType: string): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  return validTypes.includes(contentType);
}

/**
 * Validate image file size (max 5MB)
 */
export function isValidImageSize(size: number): boolean {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  return size <= MAX_SIZE;
}
