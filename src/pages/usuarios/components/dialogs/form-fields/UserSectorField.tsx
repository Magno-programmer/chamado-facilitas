
import React, { useEffect } from 'react';
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
  const isClient = userRole === 'CLIENT';
  
  // If user is a client, automatically set the sector to the current user's sector
  useEffect(() => {
    if (isClient && currentUser) {
      form.setValue('setorId', String(currentUser.sectorId));
    }
  }, [isClient, currentUser, form]);

  // If user is an admin but not from Geral sector, filter setores to only show their own sector
  const filteredSetores = isGeralSector 
    ? setores 
    : setores.filter(setor => currentUser && setor.id === currentUser.sectorId);

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
            disabled={isClient}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um setor" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {filteredSetores.map((setor) => (
                <SelectItem key={setor.id} value={String(setor.id)}>
                  {setor.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isClient && (
            <p className="text-sm text-muted-foreground mt-1">
              Usuários comuns não podem escolher setor.
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default UserSectorField;
