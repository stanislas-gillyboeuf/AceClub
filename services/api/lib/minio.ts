import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const minioClient = new S3Client({
  region: "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function generateUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600,
): Promise<{ signedUrl: string; publicUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: process.env.MINIO_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(minioClient, command, { expiresIn });
  const publicUrl = `${process.env.MINIO_PUBLIC_URL}/${process.env.MINIO_BUCKET_NAME}/${key}`;

  return { signedUrl, publicUrl };
}

export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.MINIO_BUCKET_NAME!,
    Key: key,
  });
  await minioClient.send(command);
}

export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.MINIO_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await minioClient.send(command);

  return `${process.env.MINIO_PUBLIC_URL}/${process.env.MINIO_BUCKET_NAME}/${key}`;
}
