
import { z } from "zod";

// Define form schema for validation
export const usuarioSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  setorId: z.string().refine((val) => val !== undefined, {
    message: "Setor é obrigatório para usuários não-comuns"
  }),
  role: z.string().min(1, "Função é obrigatória"),
  senha: z.string().optional()
}).refine((data) => {
  // Setor is only required if role is not CLIENT
  if (data.role !== 'CLIENT') {
    return !!data.setorId;
  }
  return true;
}, {
  message: "Setor é obrigatório para usuários não-comuns",
  path: ["setorId"]
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;
