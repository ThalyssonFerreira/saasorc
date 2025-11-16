import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.number().positive(),
  occurredAt: z.string().datetime(),
  description: z.string().optional(),
  categoryId: z.number().nullable().optional(),
  walletId: z.number(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  icon: z.string().optional(),
});
