/**
 * Client-side image compression utility.
 *
 * Base64 data URLs stored in the database can be very large. This utility
 * compresses images on the client before upload to keep payloads manageable.
 *
 * Target: each image should be under ~800KB after compression so that even
 * with 5 images the total stays well under Vercel's 4.5MB body limit and
 * the database TEXT column doesn't become unreasonably large.
 */

const MAX_DIMENSION = 1600; // max width or height in pixels
const JPEG_QUALITY = 0.75;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB per file before compression

/**
 * Returns true if the file is within acceptable size limits for upload.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: `"${file.name}" is not an image file.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `"${file.name}" is ${sizeMB}MB which exceeds the 4MB limit. Please use a smaller image.`,
    };
  }
  return { valid: true };
}

/**
 * Compress an image file by resizing and re-encoding as JPEG.
 * Returns a new File that is typically much smaller than the original.
 */
export function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // If the file is already small enough, skip compression
    if (file.size <= 200 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if either dimension exceeds the max
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // fallback: return original
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            { type: "image/jpeg" }
          );
          resolve(compressedFile);
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}

/**
 * Validate and compress multiple image files.
 * Returns the compressed files and any validation errors.
 */
export async function processImageFiles(
  files: File[]
): Promise<{ compressed: File[]; errors: string[] }> {
  const errors: string[] = [];
  const compressed: File[] = [];

  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      errors.push(validation.error!);
      continue;
    }

    try {
      const result = await compressImage(file);
      compressed.push(result);
    } catch {
      errors.push(`Failed to process "${file.name}".`);
    }
  }

  return { compressed, errors };
}
