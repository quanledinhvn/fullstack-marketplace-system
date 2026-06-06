import { describe, expect, it } from 'vitest';
import { uploadFileSchema } from './document.schema';

describe('uploadFileSchema', () => {
  const makeFile = (name: string, size: number, type: string) =>
    new File(['x'.repeat(size)], name, { type });

  it('accepts pdf', () => {
    const result = uploadFileSchema.safeParse(makeFile('a.pdf', 100, 'application/pdf'));
    expect(result.success).toBe(true);
  });

  it('accepts jpg', () => {
    const result = uploadFileSchema.safeParse(makeFile('a.jpg', 100, 'image/jpeg'));
    expect(result.success).toBe(true);
  });

  it('accepts png', () => {
    const result = uploadFileSchema.safeParse(makeFile('a.png', 100, 'image/png'));
    expect(result.success).toBe(true);
  });

  it('rejects unsupported type', () => {
    const result = uploadFileSchema.safeParse(makeFile('a.txt', 100, 'text/plain'));
    expect(result.success).toBe(false);
  });

  it('rejects file over 10MB', () => {
    const result = uploadFileSchema.safeParse(makeFile('big.pdf', 10 * 1024 * 1024 + 1, 'application/pdf'));
    expect(result.success).toBe(false);
  });

  it('accepts file exactly 10MB', () => {
    const result = uploadFileSchema.safeParse(makeFile('ok.pdf', 10 * 1024 * 1024, 'application/pdf'));
    expect(result.success).toBe(true);
  });
});
