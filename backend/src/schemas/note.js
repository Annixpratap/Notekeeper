import { z } from 'zod';
import { BlockArraySchema } from './block.js';

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const CreateNoteRequestSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  content: z.string().optional(),
  blocks: BlockArraySchema.optional(),
  color: z.string().regex(HEX_COLOR_REGEX, 'Invalid hex color format').optional(),
  tags: z.array(z.string().min(1, 'Tags cannot be empty')).optional(),
  isPinned: z.boolean().optional(),
});

export const UpdateNoteRequestSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  content: z.string().optional(),
  blocks: BlockArraySchema.optional(),
  color: z.string().regex(HEX_COLOR_REGEX, 'Invalid hex color format').optional(),
  tags: z.array(z.string().min(1, 'Tags cannot be empty')).optional(),
  isPinned: z.boolean().optional(),
});
