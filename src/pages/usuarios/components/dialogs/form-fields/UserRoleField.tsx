
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { UsuarioFormValues } from '../UserFormSchema';

interface UserRoleFieldProps {
  form: UseFormReturn<UsuarioFormValues>;
}

const UserRoleField = ({ form }: UserRoleFieldProps) => {
  return (
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
  );
};

export default UserRoleField;
