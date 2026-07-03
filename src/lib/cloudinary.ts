import { v2 as cloudinary } from "cloudinary";

/* ============================================================
   Cloudinary upload helper. Configured from env. When Cloudinary
   is not configured, falls back to an inline data URL so image /
   voice analysis still works end-to-end in a demo environment.
   ============================================================ */

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const url = process.env.CLOUDINARY_URL;
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (url) {
    // CLOUDINARY_URL is auto-parsed by the SDK.
    configured = true;
    return true;
  }
  if (cloud && key && secret) {
    cloudinary.config({ cloud_name: cloud, api_key: key, api_secret: secret, secure: true });
    configured = true;
    return true;
  }
  return false;
}

export function isCloudinaryConfigured(): boolean {
  return ensureConfigured();
}

/**
 * Upload a file buffer. Returns a hosted URL, or a data URL fallback
 * when Cloudinary is not configured.
 */
export async function uploadBuffer(
  buffer: Buffer,
  opts: { folder?: string; resourceType?: "image" | "video" | "auto" | "raw"; mimeType?: string }
): Promise<{ url: string; hosted: boolean }> {
  const { folder = "fraudshield", resourceType = "auto", mimeType = "application/octet-stream" } = opts;

  if (!ensureConfigured()) {
    // Fallback: inline data URL (works for Claude Vision without external hosting).
    const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    return { url: dataUrl, hosted: false };
  }

  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: resourceType,
  });
  return { url: res.secure_url, hosted: true };
}
