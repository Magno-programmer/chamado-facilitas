
import React from 'react';
import { RefreshCw, Clock, Check, MessageSquareText, AlertTriangle } from 'lucide-react';
import { TicketStatus } from '@/lib/types/ticket.types';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

export const completionSchema = z.object({
  completionDescription: z.string().min(20, {
    message: "A descrição de conclusão deve ter no mínimo 20 caracteres para concluir o chamado."
  })
});

export type CompletionFormValues = z.infer<typeof completionSchema>;

interface StatusUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStatus: TicketStatus | null;
  form: UseFormReturn<CompletionFormValues>;
  isUpdating: boolean;
  onStatusUpdate: (status: TicketStatus) => void;
}

const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedStatus,
  form,
  isUpdating,
  onStatusUpdate
}) => {
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
          <Form {...form}>
            <form onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(() => onStatusUpdate('Concluído'))();
            }} className="space-y-4">
              <FormField
                control={form.control}
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
                  {form.watch('completionDescription')?.length || 0} / 20 caracteres mínimos
                </span>
              </div>
              {form.watch('completionDescription')?.length < 20 && (
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
