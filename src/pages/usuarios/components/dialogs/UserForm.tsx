
import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import PasswordDisplay from './PasswordDisplay';
import { DialogFooter } from "@/components/ui/dialog";

// Define form schema for validation
export const usuarioSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  setorId: z.string().min(1, "Setor é obrigatório"),
  role: z.string().min(1, "Função é obrigatória"),
  senha: z.string().optional()
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;

interface UserFormProps {
  form: UseFormReturn<UsuarioFormValues>;
  onSubmit: (values: UsuarioFormValues) => void;
  setores: { id: number; nome: string }[];
  isEditing: boolean;
  loading: boolean;
  generatedPassword: string;
  onCancel: () => void;
}

const UserForm = ({ 
  form, 
  onSubmit, 
  setores, 
  isEditing, 
  loading, 
  generatedPassword,
  onCancel
}: UserFormProps) => {
  return (
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
          <PasswordDisplay password={generatedPassword} />
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {isEditing ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default UserForm;
