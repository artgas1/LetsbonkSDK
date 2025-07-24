// Mock global fetch for IPFS uploads
(global as any).fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};

// Mock FormData for Node.js environment
global.FormData = class FormData {
  private data: Map<string, any> = new Map();
  
  append(key: string, value: any) {
    this.data.set(key, value);
  }
  
  get(key: string) {
    return this.data.get(key);
  }
  
  has(key: string) {
    return this.data.has(key);
  }
} as any;

// Mock Blob for Node.js environment
global.Blob = class Blob {
  public size: number;
  public type: string;
  private data: any;
  
  constructor(data: any[] = [], options: { type?: string } = {}) {
    this.data = data;
    this.type = options.type || '';
    this.size = data.length;
  }
} as any;

// Mock atob and btoa for base64 operations
global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');

// Handle BigInt serialization in Jest
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

// Increase timeout for integration tests
jest.setTimeout(30000); 