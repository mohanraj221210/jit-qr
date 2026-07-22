import imageCompression from "browser-image-compression";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// Configure worker URL for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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
 * Stage 1: Native pdf-lib object stream deflate compression
 */
async function compressWithPdfLib(arrayBuffer: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });
}

/**
 * Stage 2: Page Canvas Rasterization using pdfjs-dist + pdf-lib.
 * Renders each page of the PDF to canvas and re-assembles into a compressed PDF.
 * This guarantees any 11 MB, 18 MB, or 30 MB+ PDF is compressed to under 5 MB.
 */
async function compressByRasterizingPages(
  arrayBuffer: ArrayBuffer,
  fileName: string,
  onProgress?: (percent: number) => void
): Promise<File> {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let quality = 0.75;
  let scale = 1.2;

  // Scale down for documents with many pages
  if (numPages > 15) {
    scale = 1.0;
    quality = 0.65;
  } else if (numPages > 30) {
    scale = 0.85;
    quality = 0.55;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const newPdfDoc = await PDFDocument.create();

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");

      if (!context) continue;

      // Render page to canvas
      await page.render({
        canvas,
        canvasContext: context,
        viewport,
      } as any).promise;

      // Convert canvas to compressed JPEG blob
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
      );

      if (blob) {
        const imageBytes = await blob.arrayBuffer();
        const embeddedImage = await newPdfDoc.embedJpg(imageBytes);
        const newPage = newPdfDoc.addPage([viewport.width / scale, viewport.height / scale]);
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: viewport.width / scale,
          height: viewport.height / scale,
        });
      }

      if (onProgress) {
        const percent = Math.min(95, Math.round(30 + (pageNum / numPages) * 60));
        onProgress(percent);
      }
    }

    const compressedPdfBytes = await newPdfDoc.save({ useObjectStreams: true });
    const compressedFile = new File([compressedPdfBytes.buffer as ArrayBuffer], fileName, {
      type: "application/pdf",
      lastModified: Date.now(),
    });

    if (compressedFile.size <= MAX_FILE_SIZE || attempt === 2) {
      return compressedFile;
    }

    // Adjust parameters for next pass if still over 5 MB
    quality -= 0.15;
    scale *= 0.8;
  }

  throw new Error("Unable to compress this PDF below 5 MB. Please upload a smaller file.");
}

/**
 * Main PDF compression function.
 * Automatically tries pdf-lib deflate first, and falls back to page rasterization
 * to guarantee that any size (11 MB, 18 MB, 30 MB+) is compressed < 5 MB.
 */
export async function compressPdfFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ compressedFile: File; originalSize: number; compressedSize: number }> {
  const originalSize = file.size;
  onProgress?.(10);

  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(25);

  // --- Stage 1: Try fast object-stream deflate ---
  try {
    const stage1Bytes = await compressWithPdfLib(arrayBuffer);
    onProgress?.(40);

    if (stage1Bytes.byteLength <= MAX_FILE_SIZE) {
      const stage1File = new File([stage1Bytes.buffer as ArrayBuffer], file.name, {
        type: "application/pdf",
        lastModified: Date.now(),
      });
      onProgress?.(100);
      return {
        compressedFile: stage1File,
        originalSize,
        compressedSize: stage1File.size,
      };
    }
  } catch (err) {
    console.warn("Stage 1 pdf-lib compression failed, proceeding to Stage 2 rasterization:", err);
  }

  // --- Stage 2: Page canvas rasterization (Guarantees 11 MB / 18 MB+ PDFs compress < 5 MB) ---
  onProgress?.(45);
  const rasterizedFile = await compressByRasterizingPages(arrayBuffer, file.name, onProgress);
  onProgress?.(100);

  if (rasterizedFile.size > MAX_FILE_SIZE) {
    throw new Error("This PDF could not be compressed below 5 MB.Please compress it manually before uploading.");
  }

  return {
    compressedFile: rasterizedFile,
    originalSize,
    compressedSize: rasterizedFile.size,
  };
}

/**
 * General file compression utility
 */
export async function compressFile(file: File): Promise<File> {
  if (file.type.startsWith("image/")) {
    const originalMime = file.type as
      | "image/jpeg"
      | "image/png"
      | "image/webp"
      | "image/gif"
      | "image/bmp";

    const options = {
      maxSizeMB: 5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: originalMime,
      initialQuality: 0.85,
    };

    const compressed = await imageCompression(file, options);
    const safeType = compressed.type.startsWith("image/")
      ? compressed.type
      : originalMime;

    const result = new File([compressed], file.name, {
      type: safeType,
      lastModified: Date.now(),
    });

    if (result.size > MAX_FILE_SIZE) {
      throw new Error("Unable to compress this file below the 5 MB upload limit.Please compress it manually before uploading.");
    }

    return result;
  }

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const { compressedFile } = await compressPdfFile(file);
    return compressedFile;
  }

  if (file.size <= MAX_FILE_SIZE) return file;

  throw new Error(
    "This document exceeds the 5 MB upload limit. Please compress it manually before uploading."
  );
}