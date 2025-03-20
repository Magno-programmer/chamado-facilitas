
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { UsuarioFormValues } from '../UserFormSchema';

interface UserNameFieldProps {
  form: UseFormReturn<UsuarioFormValues>;
}

const UserNameField = ({ form }: UserNameFieldProps) => {
  return (
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
  );
};

export default UserNameField;
