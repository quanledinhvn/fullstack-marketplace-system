import { z } from 'zod';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadFileSchema = z.custom<File>(
  (val) => val instanceof File || (typeof val === 'object' && val !== null && 'name' in val && 'size' in val && 'type' in val),
  { message: 'Expected a File' },
).transform((f) => f as File)
  .superRefine((f, ctx) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'File must be PDF, JPG, or PNG' });
    }
    if (f.size > MAX_SIZE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'File must be 10MB or smaller' });
    }
  });

export type UploadFile = z.infer<typeof uploadFileSchema>;
