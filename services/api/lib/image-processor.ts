import sharp from "sharp";

export interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  cropToSquare?: boolean;
}

const DEFAULT_OPTIONS: Required<ProcessImageOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 80,
  cropToSquare: false,
};

export async function processImage(
  input: Buffer | ArrayBuffer,
  options: ProcessImageOptions = {},
): Promise<Buffer> {
  const { maxWidth, maxHeight, quality, cropToSquare } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const buffer = input instanceof ArrayBuffer ? Buffer.from(input) : input;

  let pipeline = sharp(buffer).rotate(); // Auto-rotate based on EXIF orientation

  if (cropToSquare) {
    // Crop to square from center, then resize
    const metadata = await sharp(buffer).metadata();
    const size = Math.min(metadata.width || 0, metadata.height || 0);

    pipeline = pipeline
      .extract({
        left: Math.floor(((metadata.width || 0) - size) / 2),
        top: Math.floor(((metadata.height || 0) - size) / 2),
        width: size,
        height: size,
      })
      .resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
  } else {
    pipeline = pipeline.resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  return pipeline.webp({ quality }).toBuffer();
}

export async function processProfileImage(input: Buffer | ArrayBuffer): Promise<Buffer> {
  return processImage(input, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 90,
    cropToSquare: true,
  });
}

export async function processOrganizationLogo(input: Buffer | ArrayBuffer): Promise<Buffer> {
  return processImage(input, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 90,
    cropToSquare: true,
  });
}
