"use client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = "us-east-1"; // e.g., "us-east-1"
const BUCKET_NAME = "mehek-purchase-orders";
const FOLDER_PATH = "purchase-orders/";

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadToS3(file) {
  if (!file) return null;

  try {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${FOLDER_PATH}${fileName}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: filePath,
      ContentType: file.type,
    };

    const uploadUrl = await getSignedUrl(s3Client, new PutObjectCommand(params), { expiresIn: 300 });

    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${filePath}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return null;
  }
}






[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT",
            "POST",
            "GET"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://bountyfe.vercel.app",
            "https://app.huntbounty.xyz"
        ],
        "ExposeHeaders": []
    }
]