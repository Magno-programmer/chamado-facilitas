
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { UsuarioFormValues } from '../UserFormSchema';
import { User } from '@/lib/types/user.types';

interface UserSectorFieldProps {
  form: UseFormReturn<UsuarioFormValues>;
  setores: { id: number; nome: string }[];
  currentUser?: User | null;
  isGeralSector?: boolean;
}

const UserSectorField = ({ form, setores, currentUser, isGeralSector }: UserSectorFieldProps) => {
  const userRole = form.watch('role');
  
  // Only filter setores if user is not from Geral sector and has a sector
  const filteredSetores = isGeralSector || !currentUser?.sectorId
    ? setores 
    : setores.filter(setor => setor.id === currentUser.sectorId);

  // Calculate if this field should be disabled - only when editing self and not from Geral sector
  const isDisabled = !!currentUser && 
                    form.getValues('id') === currentUser.id && 
                    !isGeralSector;

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
            disabled={isDisabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um setor" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem key="0" value="0">
                Sem Setor
              </SelectItem>
              {filteredSetores.map((setor) => (
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
