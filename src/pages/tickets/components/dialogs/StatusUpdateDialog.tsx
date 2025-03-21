
import React from 'react';
import { RefreshCw, Check, Clock, MessageSquareText, AlertTriangle } from 'lucide-react';
import { TicketStatus } from '@/lib/types';
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
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface StatusUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (status: TicketStatus) => Promise<void>;
  selectedStatus: TicketStatus | null;
  isUpdating: boolean;
  completionForm: UseFormReturn<{
    completionDescription: string;
  }>;
}

const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  isOpen,
  onOpenChange,
  onStatusUpdate,
  selectedStatus,
  isUpdating,
  completionForm
}) => {
  if (!selectedStatus) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {selectedStatus === 'Em Andamento' ? 'Iniciar Atendimento' : 'Concluir Chamado'}
          </DialogTitle>
          <DialogDescription>
            {selectedStatus === 'Em Andamento' 
              ? 'Iniciar o atendimento deste chamado? O status será alterado para "Em Andamento".'
              : 'Para concluir este chamado, é necessário fornecer uma descrição de conclusão com pelo menos 20 caracteres.'}
          </DialogDescription>
        </DialogHeader>
        
        {selectedStatus === 'Concluído' && (
          <Form {...completionForm}>
            <form onSubmit={(e) => {
              e.preventDefault();
              completionForm.handleSubmit(() => onStatusUpdate('Concluído'))();
            }} className="space-y-4">
              <FormField
                control={completionForm.control}
                name="completionDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição de Conclusão</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva a solução implementada em detalhes..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center text-sm text-muted-foreground">
                <MessageSquareText className="h-4 w-4 mr-2" />
                <span>
                  {completionForm.watch('completionDescription')?.length || 0} / 20 caracteres mínimos
                </span>
              </div>
              {completionForm.watch('completionDescription')?.length < 20 && (
                <div className="flex items-center text-sm text-amber-500">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>
                    É necessário uma descrição de conclusão com pelo menos 20 caracteres
                  </span>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating} type="button">
                  Cancelar
                </Button>
                <Button variant="default" type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Concluir Chamado
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
        
        {selectedStatus === 'Em Andamento' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button variant="default" onClick={() => onStatusUpdate('Em Andamento')} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Iniciar Atendimento
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateDialog;
