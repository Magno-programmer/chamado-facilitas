
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { User } from '@/lib/types/user.types';
import { Deadline } from '@/lib/types/sector.types';
import DeadlineFormFields from './dialogs/DeadlineFormFields';
import DeadlineFormActions from './dialogs/DeadlineFormActions';
import { useDeadlineForm } from '../hooks/useDeadlineForm';

interface CreateEditDeadlineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deadline: Deadline | null;
  sectors: { id: number; nome: string }[];
  user: User | null;
  isSectorAdmin: boolean;
  onSuccess: () => void;
}

const CreateEditDeadlineDialog = ({ 
  open, 
  onOpenChange, 
  deadline, 
  sectors, 
  user,
  isSectorAdmin,
  onSuccess 
}: CreateEditDeadlineDialogProps) => {
  const isAdmin = user?.role === 'ADMIN';
  
  const { 
    form, 
    availableSectors, 
    onSubmit, 
    isSectorFieldDisabled 
  } = useDeadlineForm({
    deadline,
    sectors,
    user,
    isSectorAdmin,
    isAdmin,
    onSuccess,
    onClose: () => onOpenChange(false)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{deadline ? 'Editar Prazo' : 'Criar Novo Prazo'}</DialogTitle>
          <DialogDescription>
            {deadline 
              ? 'Atualize as informações do prazo abaixo.' 
              : 'Preencha as informações do novo prazo abaixo.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DeadlineFormFields 
              form={form} 
              availableSectors={availableSectors} 
              isSectorFieldDisabled={isSectorFieldDisabled} 
            />
            <DeadlineFormActions 
              isEditing={!!deadline} 
              onCancel={() => onOpenChange(false)} 
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditDeadlineDialog;
