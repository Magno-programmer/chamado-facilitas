
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { UsuarioFormValues } from '../UserFormSchema';

interface UserEmailFieldProps {
  form: UseFormReturn<UsuarioFormValues>;
}

const UserEmailField = ({ form }: UserEmailFieldProps) => {
  // Efeito para adicionar o domínio se não estiver presente
  useEffect(() => {
    const currentEmail = form.getValues().email;
    if (currentEmail && !currentEmail.includes('@')) {
      form.setValue('email', `${currentEmail}@sistemadechamados.com`);
    }
  }, [form.getValues().email, form]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remover qualquer @ e texto após ele
    const username = inputValue.split('@')[0];
    
    // Definir o email com o domínio fixo
    form.setValue('email', `${username}@sistemadechamados.com`);
  };

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => {
        // Extrair apenas o nome de usuário (parte antes do @)
        const username = field.value ? field.value.split('@')[0] : '';
        
        return (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <div className="flex items-center">
                <Input 
                  type="text"
                  value={username}
                  onChange={handleInputChange}
                  placeholder="usuario"
                  className="rounded-r-none border-r-0"
                />
                <div className="h-10 flex items-center px-3 border border-l-0 border-input bg-muted text-muted-foreground rounded-r-md">
                  @sistemadechamados.com
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default UserEmailField;
