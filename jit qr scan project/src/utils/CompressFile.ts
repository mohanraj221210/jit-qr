import imageCompression from "browser-image-compression";
import { PDFDocument } from "pdf-lib";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Compresses a PDF using pdf-lib (object-stream compression).
 * Returns a new File whose size is as small as pdf-lib can make it.
 */
async function compressPdf(file: File): Promise<File> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
        // Allow loading PDFs with some corruption or non-standard features
        ignoreEncryption: true,
    });

    // Save with object-stream compression enabled (deflate streams)
    const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,   // main lever for pdf-lib compression
        addDefaultPage: false,
        objectsPerTick: 50,
    });

    return new File([compressedBytes.buffer as ArrayBuffer], file.name, {
        type: "application/pdf",
        lastModified: Date.now(),
    });
}

export async function compressFile(file: File): Promise<File> {

    // ── IMAGE FILES ─────────────────────────────────────────────
    // Compress first, validate size after.
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
            fileType: originalMime,   // preserve original image format — never output PDF
            initialQuality: 0.85,
        };

        const compressed = await imageCompression(file, options);

        // Guarantee the returned File keeps the original name and MIME type
        const safeType = compressed.type.startsWith("image/")
            ? compressed.type
            : originalMime;

        const result = new File([compressed], file.name, {
            type: safeType,
            lastModified: Date.now(),
        });

        if (result.size > MAX_SIZE) {
            throw new Error("Unable to compress this file below the 5 MB upload limit.");
        }

        return result;
    }

    // ── PDF FILES ────────────────────────────────────────────────
    // Compress first, validate size after.
    if (file.type === "application/pdf") {
        const compressed = await compressPdf(file);

        if (compressed.size > MAX_SIZE) {
            throw new Error("Unable to compress this file below the 5 MB upload limit.");
        }

        return compressed;
    }

    // ── OFFICE DOCUMENTS & OTHER FILES ──────────────────────────
    // No format conversion — return unchanged if within limit.
    if (file.size <= MAX_SIZE) return file;

    throw new Error(
        "This document exceeds the 5 MB upload limit. Please compress it manually before uploading."
    );
}