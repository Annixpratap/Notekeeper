import { z } from 'zod';

const ALLOWED_BLOCK_TYPES = ['text', 'heading1', 'heading2', 'bullet', 'todo', 'code', 'divider', 'quote'];

export const BlockSchema = z.object({
  id: z.string(),
  type: z.enum(ALLOWED_BLOCK_TYPES),
  content: z.string(),
  checked: z.boolean().optional(),
  language: z.string().optional(),
});

export const BlockArraySchema = z.array(BlockSchema);
