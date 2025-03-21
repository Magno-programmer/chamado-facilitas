
import React from 'react';
import { RefreshCw, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { User } from '@/lib/types/user.types';
import { Deadline } from '@/lib/types/sector.types';
import DeadlineSelector from '../DeadlineSelector';

interface AssignTicketDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: () => Promise<void>;
  isUpdating: boolean;
  isLoadingEmployees: boolean;
  sectorEmployees: User[];
  deadlines: Deadline[];
  isLoadingDeadlines: boolean;
  assignForm: UseFormReturn<{
    responsibleId?: string;
    deadlineId?: string;
  }>;
}

const AssignTicketDialog: React.FC<AssignTicketDialogProps> = ({
  isOpen,
  onOpenChange,
  onAssign,
  isUpdating,
  isLoadingEmployees,
  sectorEmployees,
  deadlines,
  isLoadingDeadlines,
  assignForm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Atribuir Chamado</DialogTitle>
          <DialogDescription>
            Selecione o funcionário que será responsável por este chamado e o prazo de atendimento.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...assignForm}>
          <form onSubmit={(e) => {
            e.preventDefault();
            assignForm.handleSubmit(onAssign)();
          }} className="space-y-4">
            <FormField
              control={assignForm.control}
              name="responsibleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funcionário Responsável</FormLabel>
                  <Select 
                    disabled={isLoadingEmployees} 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um funcionário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingEmployees ? (
                        <div className="flex items-center justify-center p-2">
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          <span>Carregando funcionários...</span>
                        </div>
                      ) : sectorEmployees.length > 0 ? (
                        sectorEmployees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-muted-foreground">
                          Nenhum funcionário disponível neste setor
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={assignForm.control}
              name="deadlineId"
              render={({ field }) => (
                <FormItem>
                  <DeadlineSelector
                    deadlines={deadlines}
                    selectedDeadlineId={field.value ? parseInt(field.value) : null}
                    onDeadlineChange={field.onChange}
                    isLoading={isLoadingDeadlines}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating} type="button">
                Cancelar
              </Button>
              <Button variant="default" type="submit" disabled={isUpdating || isLoadingEmployees || isLoadingDeadlines}>
                {isUpdating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Atribuir Chamado
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTicketDialog;
