
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
  
  // Set default to "Sem Setor" (value "0") for client users when creating a new user
  useEffect(() => {
    if (isClient) {
      // Only set to "Sem Setor" if it's not already set to something else
      if (!form.getValues('setorId')) {
        form.setValue('setorId', "0");
      }
    } else if (currentUser && !form.getValues('setorId')) {
      // For non-clients, set to current user's sector if not already set
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
              {isClient && (
                <SelectItem key="0" value="0">
                  Sem Setor
                </SelectItem>
              )}
              {filteredSetores.map((setor) => (
                <SelectItem key={setor.id} value={String(setor.id)}>
                  {setor.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isClient && (
            <p className="text-sm text-muted-foreground mt-1">
              Usuários comuns são definidos como "Sem Setor" por padrão.
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default UserSectorField;
