export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 6 MB

/**
 * Format byte count into human readable string (e.g. 18.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Validates that the file size is below 6 MB instead of compressing.
 */
export async function compressFile(file: File): Promise<File> {
  if (file.size <= MAX_FILE_SIZE) {
    return file;
  }

  throw new Error("File size must be below 6 MB. Please upload a smaller file.");
}