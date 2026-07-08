// Add a note that we use Node stream fetch for App Router
import { v2 as cloudinary } from "cloudinary";

// Configure once (module-level singleton)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export { cloudinary };

/**
 * Upload a buffer to Cloudinary under the "sendlock" folder.
 * Files stored as raw resources (any file type).
 * Returns the public_id used for later download/delete.
 */
export async function cloudinaryUploadBuffer(
  buffer: Buffer,
  publicIdSuffix: string, // e.g. "abc123.txt"
  mimeType: string
): Promise<{ publicId: string; secureUrl: string; resourceType: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "sendlock",
        resource_type: "raw",
        public_id: publicIdSuffix,
        use_filename: false,
        unique_filename: false,
        overwrite: true,
        context: { mime: mimeType },
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
        } else {
          resolve({
            publicId: result.public_id,  // e.g. "sendlock/abc123.txt"
            secureUrl: result.secure_url,
            resourceType: result.resource_type,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Download a file from Cloudinary by public_id.
 * Uses the resource API to get the secure_url, then fetches the content.
 * This works correctly for raw (non-image) resources.
 */
export async function cloudinaryDownloadStream(
  publicId: string,
  resourceType: string = "raw"
): Promise<{ stream: ReadableStream; contentType: string }> {
  let resource;
  try {
    resource = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });
  } catch (err: any) {
    if (err?.error?.http_code === 404) {
      // Fallback for when resourceType is incorrect (e.g. schema caching issues or older files)
      const fallbackTypes = ["image", "video", "raw"].filter(t => t !== resourceType);
      for (const type of fallbackTypes) {
        try {
          resource = await cloudinary.api.resource(publicId, {
            resource_type: type,
          });
          break; // Found it!
        } catch (fallbackErr: any) {
          if (fallbackErr?.error?.http_code !== 404) throw fallbackErr;
        }
      }
    } else {
      throw err;
    }
  }

  if (!resource?.secure_url) {
    throw new Error("Cloudinary resource not found or has no URL");
  }

  // Step 2: Fetch the file content directly via its public URL
  const response = await fetch(resource.secure_url);

  if (!response.ok || !response.body) {
    throw new Error(
      `Failed to fetch from Cloudinary: ${response.status} ${response.statusText}`
    );
  }

  const contentType =
    response.headers.get("content-type") ||
    resource.format ||
    "application/octet-stream";

  return {
    stream: response.body,
    contentType,
  };
}

/**
 * Delete a file from Cloudinary by public_id.
 * Silent failure — non-fatal.
 */
export async function cloudinaryDelete(publicId: string, resourceType: string = "raw"): Promise<void> {
  try {
    // Attempt to delete with the provided resourceType
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    // Also attempt fallbacks silently to ensure it is deleted if type was wrong
    const fallbackTypes = ["image", "video", "raw"].filter(t => t !== resourceType);
    for (const type of fallbackTypes) {
      await cloudinary.uploader.destroy(publicId, { resource_type: type }).catch(() => {});
    }
  } catch (err) {
    console.warn("Cloudinary delete warning:", err);
  }
}
