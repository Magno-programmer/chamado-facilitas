
import { z } from "zod";

// Define form schema for validation
export const usuarioSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  setorId: z.string(), // Allow any string value including "0"
  role: z.string().min(1, "Função é obrigatória"),
  senha: z.string().optional()
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;
