/**
 * Base SDK Error class with structured error information
 */
export abstract class SDKError extends Error {
  abstract readonly code: string;
  abstract readonly category: ErrorCategory;

  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON for logging/serialization
   */
  toJSON(): ErrorJSON {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      context: this.context,
      stack: this.stack,
      cause: this.cause
        ? {
            name: this.cause.name,
            message: this.cause.message,
            stack: this.cause.stack,
          }
        : undefined,
    };
  }
}

/**
 * Configuration related errors
 */
export class ConfigurationError extends SDKError {
  readonly code = 'CONFIGURATION_ERROR';
  readonly category = ErrorCategory.Configuration;
}

/**
 * Validation related errors
 */
export class ValidationError extends SDKError {
  readonly code = 'VALIDATION_ERROR';
  readonly category = ErrorCategory.Validation;

  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
    cause?: Error
  ) {
    super(message, cause, { field, value });
  }
}

/**
 * Network/RPC related errors
 */
export class NetworkError extends SDKError {
  readonly code = 'NETWORK_ERROR';
  readonly category = ErrorCategory.Network;

  constructor(
    message: string,
    public readonly endpoint?: string,
    public readonly statusCode?: number,
    cause?: Error
  ) {
    super(message, cause, { endpoint, statusCode });
  }
}

/**
 * Transaction related errors
 */
export class TransactionError extends SDKError {
  readonly code = 'TRANSACTION_ERROR';
  readonly category = ErrorCategory.Transaction;

  constructor(
    message: string,
    public readonly signature?: string,
    public readonly instructionIndex?: number,
    cause?: Error
  ) {
    super(message, cause, { signature, instructionIndex });
  }
}

/**
 * Account related errors (PDAs, token accounts, etc.)
 */
export class AccountError extends SDKError {
  readonly code = 'ACCOUNT_ERROR';
  readonly category = ErrorCategory.Account;

  constructor(
    message: string,
    public readonly address?: string,
    public readonly accountType?: string,
    cause?: Error
  ) {
    super(message, cause, { address, accountType });
  }
}

/**
 * Program/Smart contract related errors
 */
export class ProgramError extends SDKError {
  readonly code = 'PROGRAM_ERROR';
  readonly category = ErrorCategory.Program;

  constructor(
    message: string,
    public readonly programId?: string,
    public readonly instructionName?: string,
    public readonly errorCode?: number,
    cause?: Error
  ) {
    super(message, cause, { programId, instructionName, errorCode });
  }
}

/**
 * Timeout related errors
 */
export class TimeoutError extends SDKError {
  readonly code = 'TIMEOUT_ERROR';
  readonly category = ErrorCategory.Timeout;

  constructor(
    message: string,
    public readonly timeoutMs?: number,
    public readonly operation?: string,
    cause?: Error
  ) {
    super(message, cause, { timeoutMs, operation });
  }
}

/**
 * Error categories for better error handling
 */
export enum ErrorCategory {
  Configuration = 'configuration',
  Validation = 'validation',
  Network = 'network',
  Transaction = 'transaction',
  Account = 'account',
  Program = 'program',
  Timeout = 'timeout',
  Unknown = 'unknown',
}

/**
 * Error JSON representation
 */
export interface ErrorJSON {
  name: string;
  message: string;
  code: string;
  category: ErrorCategory;
  context?: Record<string, unknown>;
  stack?: string;
  cause?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E extends SDKError = SDKError> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

/**
 * Success result constructor
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Error result constructor
 */
export function failure<E extends SDKError>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Utility function to create a Result from a Promise
 */
export async function tryAsync<T, E extends SDKError = SDKError>(
  promise: Promise<T>,
  errorMapper?: (error: Error) => E
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return success(data);
  } catch (error) {
    const sdkError = errorMapper
      ? errorMapper(error as Error)
      : (new ValidationError('Unknown error occurred', undefined, undefined, error as Error) as E);
    return failure(sdkError);
  }
}

/**
 * Utility function to create a Result from a synchronous operation
 */
export function trySync<T, E extends SDKError = SDKError>(
  fn: () => T,
  errorMapper?: (error: Error) => E
): Result<T, E> {
  try {
    const data = fn();
    return success(data);
  } catch (error) {
    const sdkError = errorMapper
      ? errorMapper(error as Error)
      : (new ValidationError('Unknown error occurred', undefined, undefined, error as Error) as E);
    return failure(sdkError);
  }
}

/**
 * Type guards for error handling
 */
export function isSDKError(error: unknown): error is SDKError {
  return error instanceof SDKError;
}

export function isConfigurationError(error: unknown): error is ConfigurationError {
  return error instanceof ConfigurationError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isTransactionError(error: unknown): error is TransactionError {
  return error instanceof TransactionError;
}

export function isAccountError(error: unknown): error is AccountError {
  return error instanceof AccountError;
}

export function isProgramError(error: unknown): error is ProgramError {
  return error instanceof ProgramError;
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}
