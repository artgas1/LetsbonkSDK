import { CreateTokenMetadata, MetadataUploadResult } from '../types';
import { getLogger } from '../core/logger';

const logger = getLogger();

/**
 * Upload token metadata to IPFS using pump.fun API
 * Based on CoreBuyTradeService implementation
 */
export async function uploadTokenMetadata(
  metadata: CreateTokenMetadata,
  retries: number = 5,
  delay: number = 1000
): Promise<MetadataUploadResult> {
  const formData = new FormData();

  // Add all metadata fields to form data
  formData.append('file', metadata.file);
  formData.append('name', metadata.name);
  formData.append('symbol', metadata.symbol);
  formData.append('description', metadata.description);
  formData.append('twitter', metadata.twitter || '');
  formData.append('telegram', metadata.telegram || '');
  formData.append('website', metadata.website || '');
  formData.append('showName', 'true');

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const request = await fetch('https://pump.fun/api/ipfs', {
        method: 'POST',
        body: formData,
      });

      if (!request.ok) {
        throw new Error(`HTTP error! status: ${request.status}`);
      }

      const result = (await request.json()) as { metadataUri: string };

      return {
        metadataUri: result.metadataUri,
        success: true,
      };
    } catch (error) {
      if (attempt < retries - 1) {
        logger.warn(`IPFS upload attempt ${attempt + 1} failed. Retrying...`, {
          attempt: attempt + 1,
          retries,
          tokenName: metadata.name,
          error,
        });
        await new Promise(resolve => setTimeout(resolve, delay)); // Delay before retrying
      } else {
        logger.error('All IPFS upload attempts failed', {
          attempts: retries,
          tokenName: metadata.name,
          error,
        });
        return {
          metadataUri: '',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  }

  // This should never be reached, but TypeScript needs it
  return {
    metadataUri: '',
    success: false,
    error: 'Upload failed after all retries',
  };
}

/**
 * Create a Blob from base64 image data
 */
export function createImageBlob(imageData: string, mimeType: string = 'image/jpeg'): Blob {
  // Remove data URL prefix if present
  const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

  // Convert base64 to bytes
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Create a Blob from a URL by fetching the image
 */
export async function createImageBlobFromUrl(imageUrl: string): Promise<Blob> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    throw new Error(
      `Failed to create blob from URL: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Helper function to prepare metadata for upload
 * Handles different image input types (Blob, base64 string, URL)
 */
export async function prepareTokenMetadata(params: {
  name: string;
  symbol: string;
  description: string;
  imageInput: Blob | string; // Can be Blob, base64 string, or URL
  twitter?: string;
  telegram?: string;
  website?: string;
}): Promise<CreateTokenMetadata> {
  const { name, symbol, description, imageInput, twitter, telegram, website } = params;

  let file: Blob;

  if (imageInput instanceof Blob) {
    file = imageInput;
  } else if (typeof imageInput === 'string') {
    // Check if it's a base64 string or URL
    if (
      imageInput.startsWith('data:') ||
      (!imageInput.startsWith('http') && imageInput.length > 100)
    ) {
      // Treat as base64
      file = createImageBlob(imageInput);
    } else {
      // Treat as URL
      file = await createImageBlobFromUrl(imageInput);
    }
  } else {
    throw new Error('Invalid image input type. Must be Blob, base64 string, or URL.');
  }

  return {
    name,
    symbol,
    description,
    file,
    twitter,
    telegram,
    website,
  };
}
