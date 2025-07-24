import { PublicKey, Keypair } from '@solana/web3.js';
import { ValidationError, Result, success, failure } from '../core/errors';
import { CreateTokenMetadata, BuyParams, SellParams, InitializeParams } from '../types';

/**
 * Shared validation utilities to eliminate duplicate validation logic
 */
export class SharedValidators {
  /**
   * Validate PublicKey
   */
  static validatePublicKey(
    key: PublicKey | undefined | null,
    fieldName: string
  ): Result<void, ValidationError> {
    if (!key) {
      return failure(new ValidationError(`${fieldName} is required`, fieldName, key));
    }

    try {
      // Try to convert to string to validate the key
      key.toString();
      return success(undefined);
    } catch {
      return failure(new ValidationError(`Invalid ${fieldName}`, fieldName, key));
    }
  }

  /**
   * Validate Keypair
   */
  static validateKeypair(
    keypair: Keypair | undefined | null,
    fieldName: string
  ): Result<void, ValidationError> {
    if (!keypair) {
      return failure(new ValidationError(`${fieldName} keypair is required`, fieldName, keypair));
    }

    if (!keypair.publicKey || !keypair.secretKey) {
      return failure(new ValidationError(`Invalid ${fieldName} keypair`, fieldName, keypair));
    }

    return success(undefined);
  }

  /**
   * Validate string field
   */
  static validateString(
    value: string | undefined | null,
    fieldName: string,
    minLength = 1,
    maxLength = 1000
  ): Result<void, ValidationError> {
    if (!value || typeof value !== 'string') {
      return failure(new ValidationError(`${fieldName} is required`, fieldName, value));
    }

    const trimmed = value.trim();
    if (trimmed.length < minLength) {
      return failure(
        new ValidationError(
          `${fieldName} must be at least ${minLength} characters`,
          fieldName,
          value
        )
      );
    }

    if (trimmed.length > maxLength) {
      return failure(
        new ValidationError(
          `${fieldName} must be at most ${maxLength} characters`,
          fieldName,
          value
        )
      );
    }

    return success(undefined);
  }

  /**
   * Validate bigint amount
   */
  static validateBigIntAmount(
    amount: bigint | undefined | null,
    fieldName: string,
    minAmount = 0n
  ): Result<void, ValidationError> {
    if (amount === undefined || amount === null) {
      return failure(new ValidationError(`${fieldName} is required`, fieldName, amount));
    }

    if (typeof amount !== 'bigint') {
      return failure(new ValidationError(`${fieldName} must be a bigint`, fieldName, amount));
    }

    if (amount < minAmount) {
      return failure(
        new ValidationError(`${fieldName} must be at least ${minAmount}`, fieldName, amount)
      );
    }

    return success(undefined);
  }

  /**
   * Validate URL
   */
  static validateURL(
    url: string | undefined,
    fieldName: string,
    required = false
  ): Result<void, ValidationError> {
    if (!url) {
      if (required) {
        return failure(new ValidationError(`${fieldName} is required`, fieldName, url));
      }
      return success(undefined);
    }

    try {
      new URL(url);
      return success(undefined);
    } catch {
      return failure(new ValidationError(`Invalid ${fieldName} URL`, fieldName, url));
    }
  }

  /**
   * Validate file blob
   */
  static validateFile(
    file: Blob | undefined | null,
    fieldName: string,
    maxSizeBytes = 10 * 1024 * 1024 // 10MB default
  ): Result<void, ValidationError> {
    if (!file) {
      return failure(new ValidationError(`${fieldName} is required`, fieldName, file));
    }

    if (!(file instanceof Blob)) {
      return failure(new ValidationError(`${fieldName} must be a Blob`, fieldName, file));
    }

    if (file.size === 0) {
      return failure(new ValidationError(`${fieldName} cannot be empty`, fieldName, file));
    }

    if (file.size > maxSizeBytes) {
      return failure(
        new ValidationError(
          `${fieldName} size cannot exceed ${maxSizeBytes / (1024 * 1024)}MB`,
          fieldName,
          file.size
        )
      );
    }

    return success(undefined);
  }

  /**
   * Validate token metadata
   */
  static validateTokenMetadata(metadata: CreateTokenMetadata): Result<void, ValidationError> {
    // Validate name
    const nameValidation = SharedValidators.validateString(metadata.name, 'name', 1, 32);
    if (!nameValidation.success) return nameValidation;

    // Validate symbol
    const symbolValidation = SharedValidators.validateString(metadata.symbol, 'symbol', 1, 10);
    if (!symbolValidation.success) return symbolValidation;

    // Validate description
    const descValidation = SharedValidators.validateString(
      metadata.description,
      'description',
      1,
      1000
    );
    if (!descValidation.success) return descValidation;

    // Validate file
    const fileValidation = SharedValidators.validateFile(metadata.file, 'file');
    if (!fileValidation.success) return fileValidation;

    // Validate optional URLs
    const websiteValidation = SharedValidators.validateURL(metadata.website, 'website');
    if (!websiteValidation.success) return websiteValidation;

    return success(undefined);
  }

  /**
   * Validate buy parameters
   */
  static validateBuyParams(params: BuyParams): Result<void, ValidationError> {
    // Validate buyer keypair
    const buyerValidation = SharedValidators.validateKeypair(params.buyer, 'buyer');
    if (!buyerValidation.success) return buyerValidation;

    // Validate base mint
    const baseMintValidation = SharedValidators.validatePublicKey(params.baseMint, 'baseMint');
    if (!baseMintValidation.success) return baseMintValidation;

    // Validate amount in
    const amountInValidation = SharedValidators.validateBigIntAmount(
      params.amountIn,
      'amountIn',
      1n
    );
    if (!amountInValidation.success) return amountInValidation;

    // Validate minimum amount out
    const minAmountValidation = SharedValidators.validateBigIntAmount(
      params.minimumAmountOut,
      'minimumAmountOut',
      0n
    );
    if (!minAmountValidation.success) return minAmountValidation;

    return success(undefined);
  }

  /**
   * Validate sell parameters
   */
  static validateSellParams(params: SellParams): Result<void, ValidationError> {
    // Validate seller keypair
    const sellerValidation = SharedValidators.validateKeypair(params.seller, 'seller');
    if (!sellerValidation.success) return sellerValidation;

    // Validate base mint
    const baseMintValidation = SharedValidators.validatePublicKey(params.baseMint, 'baseMint');
    if (!baseMintValidation.success) return baseMintValidation;

    // Validate amount in
    const amountInValidation = SharedValidators.validateBigIntAmount(
      params.amountIn,
      'amountIn',
      1n
    );
    if (!amountInValidation.success) return amountInValidation;

    // Validate minimum amount out
    const minAmountValidation = SharedValidators.validateBigIntAmount(
      params.minimumAmountOut,
      'minimumAmountOut',
      0n
    );
    if (!minAmountValidation.success) return minAmountValidation;

    return success(undefined);
  }

  /**
   * Validate initialize parameters
   */
  static validateInitializeParams(params: InitializeParams): Result<void, ValidationError> {
    // Validate payer keypair
    const payerValidation = SharedValidators.validateKeypair(params.payer, 'payer');
    if (!payerValidation.success) return payerValidation;

    // Validate creator public key
    const creatorValidation = SharedValidators.validatePublicKey(params.creator, 'creator');
    if (!creatorValidation.success) return creatorValidation;

    // Validate base mint keypair
    const baseMintValidation = SharedValidators.validateKeypair(params.baseMint, 'baseMint');
    if (!baseMintValidation.success) return baseMintValidation;

    // Validate token metadata
    if (!params.tokenMetadata) {
      return failure(
        new ValidationError('Token metadata is required', 'tokenMetadata', params.tokenMetadata)
      );
    }

    const metadataValidation = SharedValidators.validateTokenMetadata(params.tokenMetadata);
    if (!metadataValidation.success) return metadataValidation;

    return success(undefined);
  }
}
