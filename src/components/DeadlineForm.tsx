
import React, { useEffect } from 'react';
import { Deadline } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { mockSectors } from '@/lib/mockData';

interface DeadlineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deadline: Deadline) => void;
  deadline: Deadline | null;
}

const DeadlineForm: React.FC<DeadlineFormProps> = ({ isOpen, onClose, onSave, deadline }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Deadline>({
    defaultValues: deadline || {
      id: 0,
      title: '',
      sectorId: 1,
      deadline: 'PT60M', // Default to 60 minutes
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset(deadline || {
        id: 0,
        title: '',
        sectorId: 1,
        deadline: 'PT60M', // Default to 60 minutes
      });
    }
  }, [isOpen, deadline, reset]);

  const onSubmit = (data: Deadline) => {
    // Format deadline to ISO duration format if minutes value is provided
    if (data.deadline.match(/^\d+$/)) {
      data.deadline = `PT${data.deadline}M`;
    }
    onSave(data);
  };

  // Parse ISO duration to minutes for the form
  const parseDuration = (duration: string): string => {
    const minuteMatch = duration.match(/PT(\d+)M/);
    const dayMatch = duration.match(/P(\d+)D/);
    
    if (minuteMatch) {
      return minuteMatch[1];
    } else if (dayMatch) {
      // Convert days to minutes (1 day = 1440 minutes)
      return String(parseInt(dayMatch[1]) * 1440);
    }
    
    return duration;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{deadline ? 'Editar Prazo' : 'Novo Prazo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              {...register('title', { required: 'Título do prazo é obrigatório' })}
              placeholder="Ex: Prioridade Alta - TI"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sectorId">Setor Responsável</Label>
            <select
              id="sectorId"
              {...register('sectorId', { required: 'Setor é obrigatório' })}
              className="w-full px-3 py-2 border rounded-md"
            >
              {mockSectors.map(sector => (
                <option key={sector.id} value={sector.id}>{sector.name}</option>
              ))}
            </select>
            {errors.sectorId && <p className="text-sm text-destructive">{errors.sectorId.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo (minutos)</Label>
            <Input
              id="deadline"
              type="number"
              min="1"
              {...register('deadline', { 
                required: 'Prazo é obrigatório',
                min: {
                  value: 1,
                  message: 'O prazo deve ser de pelo menos 1 minuto'
                }
              })}
              defaultValue={parseDuration(deadline?.deadline || 'PT60M')}
              placeholder="Número de minutos"
            />
            {errors.deadline && <p className="text-sm text-destructive">{errors.deadline.message}</p>}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeadlineForm;
