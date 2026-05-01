/**
 * imgBB 免费图床上传
 * 文档: https://api.imgbb.com/
 *
 * 优点: 免费、无需 API key（匿名上传）、返回真实 HTTPS URL
 * 缺点: 第三方、有使用限制（轻度使用足够）
 *
 * 替代方案（未来可换）:
 * - Vercel Blob: BLOB_READ_WRITE_TOKEN + @vercel/blob
 * - Cloudflare R2: R2_ACCOUNT_ID + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY + @aws-sdk/client-s3
 * - Supabase Storage: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + @supabase/supabase-js
 */

export interface ImgBBUploadResult {
  url: string;       // 真实 HTTPS URL
  thumb: string;      // 缩略图 URL
  filename: string;
  size: number;       // bytes
}

export interface ImgBBError {
  error: {
    message: string;
    code: string;
  };
}

const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";

/**
 * 上传图片到 imgBB，返回真实 HTTPS URL
 * @param file File 或 base64
 * @param filename 文件名
 */
export async function uploadToImgBB(
  file: File | string, // File object or base64 string
  filename?: string
): Promise<ImgBBUploadResult> {
  const formData = new FormData();

  if (typeof file === "string") {
    // base64 data URL: "data:image/jpeg;base64,/9j/4AAQ..."
    // Extract just the base64 part
    const match = file.match(/^data:[^;]+;base64,(.+)$/);
    if (match) {
      formData.append("image", match[1]);
    } else {
      formData.append("image", file);
    }
  } else {
    formData.append("image", file);
    if (filename) {
      formData.append("filename", filename);
    }
  }

  const response = await fetch(IMGBB_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "unknown");
    throw new Error(`imgBB upload failed: HTTP ${response.status} - ${text}`);
  }

  const data = await response.json() as {
    success: boolean;
    data?: {
      url: string;
      thumb: { url: string };
      image: { filename: string; size: number };
    };
    error?: ImgBBError["error"];
  };

  if (!data.success || !data.data) {
    throw new Error(`imgBB upload failed: ${data.error?.message ?? "unknown error"}`);
  }

  return {
    url: data.data.url,
    thumb: data.data.thumb.url,
    filename: data.data.image.filename,
    size: data.data.image.size,
  };
}

/**
 * 从 File 对象提取 base64 data URL
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
