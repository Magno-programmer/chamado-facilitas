
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { DeadlineFormValues } from './DeadlineFormSchema';

interface DeadlineFormFieldsProps {
  form: UseFormReturn<DeadlineFormValues>;
  availableSectors: { id: number; nome: string }[];
  isSectorFieldDisabled: () => boolean;
}

const DeadlineFormFields = ({ form, availableSectors, isSectorFieldDisabled }: DeadlineFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="titulo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título</FormLabel>
            <FormControl>
              <Input placeholder="Digite o título do prazo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="prazo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prazo (HH:MM)</FormLabel>
            <FormControl>
              <Input 
                type="time" 
                placeholder="00:00" 
                {...field} 
              />
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
            <FormLabel>Setor {isSectorFieldDisabled() && '(determinado pelo seu setor)'}</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value || undefined} 
              defaultValue={field.value || undefined}
              disabled={isSectorFieldDisabled()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um setor (ou deixe em branco para todos)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="all_sectors">Todos os setores</SelectItem>
                {availableSectors.map((sector) => (
                  <SelectItem key={sector.id} value={String(sector.id)}>
                    {sector.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isSectorFieldDisabled() && (
              <p className="text-sm text-muted-foreground mt-1">
                Como gerente de setor, você só pode criar prazos para o seu próprio setor.
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default DeadlineFormFields;
