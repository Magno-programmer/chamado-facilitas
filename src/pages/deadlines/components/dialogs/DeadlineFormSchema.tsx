
import * as z from "zod";

// Define the deadline schema for form validation
export const deadlineSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  prazo: z.string().min(1, "O prazo é obrigatório"),
  setorId: z.string().optional()
});

export type DeadlineFormValues = z.infer<typeof deadlineSchema>;
