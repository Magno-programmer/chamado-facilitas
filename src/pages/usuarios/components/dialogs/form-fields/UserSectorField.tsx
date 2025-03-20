
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { UsuarioFormValues } from '../UserFormSchema';

interface UserSectorFieldProps {
  form: UseFormReturn<UsuarioFormValues>;
  setores: { id: number; nome: string }[];
}

const UserSectorField = ({ form, setores }: UserSectorFieldProps) => {
  return (
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
  );
};

export default UserSectorField;
