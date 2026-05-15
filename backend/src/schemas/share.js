import { z } from 'zod';

export const ShareRequestSchema = z.object({
  share_with_email: z.string().email('Invalid email format'),
});
