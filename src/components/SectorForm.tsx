
import React, { useEffect } from 'react';
import { Sector } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';

interface SectorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sector: Sector) => void;
  sector: Sector | null;
}

const SectorForm: React.FC<SectorFormProps> = ({ isOpen, onClose, onSave, sector }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Sector>({
    defaultValues: sector || {
      id: 0,
      name: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset(sector || {
        id: 0,
        name: '',
      });
    }
  }, [isOpen, sector, reset]);

  const onSubmit = (data: Sector) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{sector ? 'Editar Setor' : 'Novo Setor'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Setor</Label>
            <Input
              id="name"
              {...register('name', { required: 'Nome do setor é obrigatório' })}
              placeholder="Nome do setor"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
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

export default SectorForm;
