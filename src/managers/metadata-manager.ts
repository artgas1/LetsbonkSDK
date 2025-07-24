import { CreateTokenMetadata, MetadataUploadResult } from '../types';
import { MetadataPreparationParams } from '../types/managers';
import { SDKLogger } from '../core/logger';
import { ValidationError, NetworkError, Result, success, failure, tryAsync } from '../core/errors';
import {
  uploadTokenMetadata,
  prepareTokenMetadata,
  createImageBlob,
  createImageBlobFromUrl,
} from '../utils/metadata';

/**
 * Metadata Manager - Handles metadata-related operations
 */
export class MetadataManager {
  private logger: SDKLogger;

  constructor(logger: SDKLogger) {
    this.logger = logger.child({ manager: 'MetadataManager' });
  }

  /**
   * Upload token metadata to IPFS
   */
  async uploadMetadata(
    metadata: CreateTokenMetadata
  ): Promise<Result<MetadataUploadResult, ValidationError | NetworkError>> {
    const timer = this.logger.startTimer('uploadMetadata');

    try {
      this.logger.debug('Uploading metadata', {
        name: metadata.name,
        symbol: metadata.symbol,
        hasFile: !!metadata.file,
      });

      // Validate metadata
      const validation = this.validateMetadata(metadata);
      if (!validation.success) {
        return validation;
      }

      // Upload to IPFS
      const uploadResult = await tryAsync(
        uploadTokenMetadata(metadata),
        error =>
          new NetworkError(`Failed to upload metadata: ${error.message}`, 'ipfs', undefined, error)
      );

      if (!uploadResult.success) {
        timer.end({ success: false, error: uploadResult.error.message });
        return failure(uploadResult.error as NetworkError);
      }

      const result = uploadResult.data;

      timer.end({ success: true });

      this.logger.info('Metadata uploaded successfully', {
        metadataUri: result.metadataUri,
        name: metadata.name,
        symbol: metadata.symbol,
      });

      return success(result);
    } catch (error) {
      const networkError = new NetworkError(
        `Unexpected error uploading metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ipfs',
        undefined,
        error instanceof Error ? error : undefined
      );

      this.logger.logError(networkError);
      timer.end({ success: false, error: networkError.message });

      return failure(networkError);
    }
  }

  /**
   * Prepare metadata from various input formats
   */
  async prepareMetadata(
    params: MetadataPreparationParams
  ): Promise<Result<CreateTokenMetadata, ValidationError | NetworkError>> {
    const timer = this.logger.startTimer('prepareMetadata');

    try {
      this.logger.debug('Preparing metadata', {
        name: params.name,
        symbol: params.symbol,
        imageInputType: typeof params.imageInput,
      });

      // Validate parameters first
      const validation = this.validatePreparationParams(params);
      if (!validation.success) {
        timer.end({ success: false, error: validation.error.message });
        return validation;
      }

      // Use the core prepareTokenMetadata function to avoid duplication
      const result = await tryAsync(
        prepareTokenMetadata(params),
        error =>
          new ValidationError(
            `Failed to prepare metadata: ${error.message}`,
            'preparation',
            params,
            error
          )
      );

      if (!result.success) {
        this.logger.error('Failed to prepare metadata', { error: result.error.message });
        timer.end({ success: false, error: result.error.message });
        return failure(result.error as ValidationError);
      }

      this.logger.info('Metadata prepared successfully', {
        name: result.data.name,
        symbol: result.data.symbol,
        fileSize: result.data.file.size,
      });

      timer.end({ success: true });
      return success(result.data);
    } catch (error) {
      const validationError = new ValidationError(
        `Unexpected error preparing metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'preparation',
        params,
        error instanceof Error ? error : undefined
      );

      this.logger.logError(validationError);
      timer.end({ success: false, error: validationError.message });

      return failure(validationError);
    }
  }

  /**
   * Create image blob from base64 string
   */
  createImageFromBase64(base64: string): Result<Blob, ValidationError> {
    try {
      this.logger.debug('Creating image blob from base64');

      const blob = createImageBlob(base64);

      this.logger.debug('Image blob created', { size: blob.size });
      return success(blob);
    } catch (error) {
      const validationError = new ValidationError(
        `Failed to create image blob: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'base64',
        base64,
        error instanceof Error ? error : undefined
      );

      this.logger.logError(validationError);
      return failure(validationError);
    }
  }

  /**
   * Build image blob from URL
   */
  async buildImageFromUrl(url: string): Promise<Result<Blob, NetworkError | ValidationError>> {
    const timer = this.logger.startTimer('buildImageFromUrl');

    try {
      this.logger.debug('Creating image blob from URL', { url });

      // Validate URL
      try {
        new URL(url);
      } catch {
        return failure(new ValidationError('Invalid URL provided', 'url', url));
      }

      const result = await tryAsync(
        createImageBlobFromUrl(url),
        error =>
          new NetworkError(
            `Failed to fetch image from URL: ${error.message}`,
            url,
            undefined,
            error
          )
      );

      if (!result.success) {
        timer.end({ success: false, error: result.error.message });
        return result;
      }

      this.logger.info('Image blob created from URL', {
        url,
        size: result.data.size,
      });

      timer.end({ success: true });
      return result;
    } catch (error) {
      const networkError = new NetworkError(
        `Unexpected error creating image from URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
        url,
        undefined,
        error instanceof Error ? error : undefined
      );

      this.logger.logError(networkError);
      timer.end({ success: false, error: networkError.message });

      return failure(networkError);
    }
  }

  /**
   * Validate metadata structure
   */
  private validateMetadata(metadata: CreateTokenMetadata): Result<void, ValidationError> {
    if (!metadata.name || metadata.name.trim().length === 0) {
      return failure(new ValidationError('Token name is required', 'name', metadata.name));
    }

    if (!metadata.symbol || metadata.symbol.trim().length === 0) {
      return failure(new ValidationError('Token symbol is required', 'symbol', metadata.symbol));
    }

    if (!metadata.description || metadata.description.trim().length === 0) {
      return failure(
        new ValidationError('Token description is required', 'description', metadata.description)
      );
    }

    if (!metadata.file) {
      return failure(new ValidationError('Token image file is required', 'file', metadata.file));
    }

    // Validate symbol length and format
    if (metadata.symbol.length > 10) {
      return failure(
        new ValidationError('Token symbol must be 10 characters or less', 'symbol', metadata.symbol)
      );
    }

    if (!/^[A-Z0-9]+$/.test(metadata.symbol)) {
      return failure(
        new ValidationError(
          'Token symbol must contain only uppercase letters and numbers',
          'symbol',
          metadata.symbol
        )
      );
    }

    // Validate file size (max 1MB)
    if (metadata.file.size > 1024 * 1024) {
      return failure(
        new ValidationError('Image file must be smaller than 1MB', 'file', metadata.file)
      );
    }

    return success(undefined);
  }

  /**
   * Validate preparation parameters
   */
  private validatePreparationParams(
    params: MetadataPreparationParams
  ): Result<void, ValidationError> {
    if (!params.name || params.name.trim().length === 0) {
      return failure(new ValidationError('Token name is required', 'name', params.name));
    }

    if (!params.symbol || params.symbol.trim().length === 0) {
      return failure(new ValidationError('Token symbol is required', 'symbol', params.symbol));
    }

    if (!params.description || params.description.trim().length === 0) {
      return failure(
        new ValidationError('Token description is required', 'description', params.description)
      );
    }

    if (!params.imageInput) {
      return failure(
        new ValidationError('Image input is required', 'imageInput', params.imageInput)
      );
    }

    // Validate symbol
    if (params.symbol.length > 10) {
      return failure(
        new ValidationError('Token symbol must be 10 characters or less', 'symbol', params.symbol)
      );
    }

    if (!/^[A-Z0-9]+$/.test(params.symbol)) {
      return failure(
        new ValidationError(
          'Token symbol must contain only uppercase letters and numbers',
          'symbol',
          params.symbol
        )
      );
    }

    return success(undefined);
  }
}
