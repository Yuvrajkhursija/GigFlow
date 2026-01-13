import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const gigSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  budget: z.number().min(1),
});

export const bidSchema = z.object({
  gigId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid gig ID'),
  message: z.string().min(1).max(1000),
  price: z.number().min(1),
});
