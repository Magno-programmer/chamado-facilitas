
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateSecurePassword, hashPassword } from '@/lib/passwordUtils';
import { ClipboardCopy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  setor: {
    id: number;
    nome: string;
  };
}

interface CreateEditUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  setores: { id: number; nome: string }[];
  onSave: (values: any, isEditing: boolean) => void;
  loading: boolean;
}

// Define form schema for validation
const usuarioSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  setorId: z.string().min(1, "Setor é obrigatório"),
  role: z.string().min(1, "Função é obrigatória"),
  senha: z.string().optional()
});

type UsuarioFormValues = z.infer<typeof usuarioSchema>;

const CreateEditUsuarioDialog = ({ 
  open, 
  onOpenChange, 
  usuario, 
  setores, 
  onSave,
  loading
}: CreateEditUsuarioDialogProps) => {
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  
  // Setup form for creating/editing users
  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: "",
      email: "",
      setorId: "",
      role: "",
      senha: ""
    }
  });

  // Generate secure password when creating a new user and dialog opens
  useEffect(() => {
    if (open && !usuario) {
      const newPassword = generateSecurePassword();
      setGeneratedPassword(newPassword);
      form.setValue('senha', hashPassword(newPassword));
    } else {
      setGeneratedPassword("");
    }
  }, [open, usuario, form]);

  // Reset form and set editing user when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (usuario) {
        form.reset({
          nome: usuario.nome,
          email: usuario.email,
          setorId: String(usuario.setor?.id || ""),
          role: usuario.role,
          senha: ""
        });
      } else {
        form.reset({
          nome: "",
          email: "",
          setorId: "",
          role: "CLIENT",
          senha: hashPassword(generatedPassword)
        });
      }
    }
  }, [open, usuario, form, generatedPassword]);

  const onSubmit = (values: UsuarioFormValues) => {
    onSave(values, !!usuario);
  };

  const copyToClipboard = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast({
        title: "Senha copiada",
        description: "A senha foi copiada para a área de transferência.",
      });
    }
  };

  const isEditing = !!usuario;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{usuario ? 'Editar Usuário' : 'Criar Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {usuario 
              ? 'Atualize as informações do usuário abaixo.' 
              : 'Preencha as informações do novo usuário abaixo.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="setorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setor</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um setor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {setores.map((setor) => (
                        <SelectItem key={setor.id} value={String(setor.id)}>
                          {setor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                      <SelectItem value="CLIENT">Usuário Comum</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEditing && (
              <div className="space-y-2">
                <FormLabel>Senha Gerada Automaticamente</FormLabel>
                <div className="relative">
                  <Input 
                    type="text" 
                    value={generatedPassword}
                    readOnly
                    className="pr-10"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={copyToClipboard}
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Esta senha é gerada automaticamente e será necessária para o primeiro acesso. 
                  Copie-a e compartilhe com o usuário de forma segura.
                </p>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {usuario ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditUsuarioDialog;
