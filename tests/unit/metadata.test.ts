import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  uploadTokenMetadata,
  prepareTokenMetadata,
  createImageBlob,
  createImageBlobFromUrl,
} from '../../src/utils/metadata';
import { CreateTokenMetadata } from '../../src/types';

// Mock fetch globally
const mockFetch = (global as any).fetch as jest.MockedFunction<typeof fetch>;

describe('Metadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadTokenMetadata', () => {
    const mockMetadata: CreateTokenMetadata = {
      name: 'Test Token',
      symbol: 'TEST',
      description: 'A test token',
      file: new Blob(['test-image-data'], { type: 'image/jpeg' }),
      twitter: 'https://twitter.com/test',
      telegram: 'https://t.me/test',
      website: 'https://test.com',
    };

    test('should upload metadata successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ metadataUri: 'https://ipfs.io/test-uri' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await uploadTokenMetadata(mockMetadata);

      expect(result).toEqual({
        metadataUri: 'https://ipfs.io/test-uri',
        success: true,
      });

      expect(mockFetch).toHaveBeenCalledWith('https://pump.fun/api/ipfs', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });

    test('should handle HTTP errors', async () => {
      // Debug: Reset and setup the mock explicitly
      jest.clearAllMocks();
      
      // Set up fetch mock to properly simulate HTTP error
      mockFetch.mockImplementation(async () => {
        const response = {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ error: 'Server error' }),
        };
        return response as any;
      });

      const result = await uploadTokenMetadata(mockMetadata);

      expect(result).toEqual({
        metadataUri: '',
        success: false,
        error: 'HTTP error! status: 500',
      });
      
      expect(mockFetch).toHaveBeenCalledWith('https://pump.fun/api/ipfs', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });

    test('should retry on failure and succeed', async () => {
      // First two calls fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ metadataUri: 'https://ipfs.io/test-uri' }),
        } as any);

      const result = await uploadTokenMetadata(mockMetadata, 3, 10);

      expect(result).toEqual({
        metadataUri: 'https://ipfs.io/test-uri',
        success: true,
      });

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    test('should fail after max retries', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent error'));

      const result = await uploadTokenMetadata(mockMetadata, 2, 10);

      expect(result).toEqual({
        metadataUri: '',
        success: false,
        error: 'Persistent error',
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    test('should handle empty optional fields', async () => {
      const metadataWithoutOptionals: CreateTokenMetadata = {
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        file: new Blob(['test-image-data'], { type: 'image/jpeg' }),
      };

      const mockResponse = {
        ok: true,
        json: async () => ({ metadataUri: 'https://ipfs.io/test-uri' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await uploadTokenMetadata(metadataWithoutOptionals);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('https://pump.fun/api/ipfs', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });
  });

  describe('createImageBlob', () => {
    test('should create Blob from base64 string', () => {
      const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const blob = createImageBlob(base64);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/jpeg');
      expect(blob.size).toBeGreaterThan(0);
    });

    test('should handle data URL prefix', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const blob = createImageBlob(dataUrl);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    test('should accept custom MIME type', () => {
      const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const blob = createImageBlob(base64, 'image/png');
      
      expect(blob.type).toBe('image/png');
    });
  });

  describe('createImageBlobFromUrl', () => {
    test('should fetch and create Blob from URL', async () => {
      const mockImageData = new ArrayBuffer(1024);
      const mockResponse = {
        ok: true,
        blob: async () => new Blob([mockImageData], { type: 'image/jpeg' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const blob = await createImageBlobFromUrl('https://example.com/image.jpg');

      expect(blob).toBeInstanceOf(Blob);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/image.jpg');
    });

    test('should handle fetch errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(createImageBlobFromUrl('https://example.com/notfound.jpg'))
        .rejects.toThrow('Failed to create blob from URL');
    });

    test('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(createImageBlobFromUrl('https://example.com/image.jpg'))
        .rejects.toThrow('Failed to create blob from URL');
    });
  });

  describe('prepareTokenMetadata', () => {
    test('should handle Blob input', async () => {
      const imageBlob = new Blob(['test-data'], { type: 'image/jpeg' });
      
      const metadata = await prepareTokenMetadata({
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        imageInput: imageBlob,
        twitter: 'https://twitter.com/test',
      });

      expect(metadata).toEqual({
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        file: imageBlob,
        twitter: 'https://twitter.com/test',
        telegram: undefined,
        website: undefined,
      });
    });

    test('should handle base64 string input', async () => {
      const base64 = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const metadata = await prepareTokenMetadata({
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        imageInput: base64,
      });

      expect(metadata.name).toBe('Test Token');
      expect(metadata.file).toBeInstanceOf(Blob);
    });

    test('should handle URL input', async () => {
      const mockImageData = new ArrayBuffer(1024);
      const mockResponse = {
        ok: true,
        blob: async () => new Blob([mockImageData], { type: 'image/jpeg' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const metadata = await prepareTokenMetadata({
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        imageInput: 'https://example.com/image.jpg',
      });

      expect(metadata.name).toBe('Test Token');
      expect(metadata.file).toBeInstanceOf(Blob);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/image.jpg');
    });

    test('should handle non-data URL base64 string', async () => {
      const longBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='.repeat(10);
      
      const metadata = await prepareTokenMetadata({
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        imageInput: longBase64,
      });

      expect(metadata.file).toBeInstanceOf(Blob);
    });

    test('should throw error for invalid input type', async () => {
      await expect(prepareTokenMetadata({
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        imageInput: 123 as any, // Invalid type
      })).rejects.toThrow('Invalid image input type');
    });

    test('should include all optional fields', async () => {
      const imageBlob = new Blob(['test-data'], { type: 'image/jpeg' });
      
      const metadata = await prepareTokenMetadata({
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        imageInput: imageBlob,
        twitter: 'https://twitter.com/test',
        telegram: 'https://t.me/test',
        website: 'https://test.com',
      });

      expect(metadata.twitter).toBe('https://twitter.com/test');
      expect(metadata.telegram).toBe('https://t.me/test');
      expect(metadata.website).toBe('https://test.com');
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle empty FormData responses', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({}), // Empty response
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const mockMetadata: CreateTokenMetadata = {
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        file: new Blob(['test-data']),
      };

      const result = await uploadTokenMetadata(mockMetadata);

      expect(result.success).toBe(true);
      expect(result.metadataUri).toBeUndefined();
    });

    test('should handle very large base64 strings', () => {
      const largeBase64 = 'A'.repeat(100000); // Very large string
      
      const blob = createImageBlob(largeBase64);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    test('should handle malformed JSON responses', async () => {
      const mockResponse = {
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); },
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const mockMetadata: CreateTokenMetadata = {
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        file: new Blob(['test-data']),
      };

      const result = await uploadTokenMetadata(mockMetadata, 1); // Only 1 retry to see the actual error

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });
  });
}); 