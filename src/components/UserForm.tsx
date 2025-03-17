
import React, { useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { mockSectors } from '@/lib/mockData';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User & { password?: string }) => void;
  user: User | null;
}

const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, onSave, user }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<User & { password?: string }>({
    defaultValues: user || {
      id: 0,
      name: '',
      email: '',
      sectorId: 1,
      role: 'CLIENT' as UserRole,
      password: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset(user || {
        id: 0,
        name: '',
        email: '',
        sectorId: 1,
        role: 'CLIENT' as UserRole,
        password: '',
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = (data: User & { password?: string }) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              {...register('name', { required: 'Nome é obrigatório' })}
              placeholder="Nome completo"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
              placeholder="email@exemplo.com"
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sectorId">Setor</Label>
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
            <Label htmlFor="role">Função</Label>
            <select
              id="role"
              {...register('role', { required: 'Função é obrigatória' })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="ADMIN">Administrador</option>
              <option value="CLIENT">Cliente</option>
            </select>
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>
          
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                {...register('password', { 
                  required: 'Senha é obrigatória para novos usuários',
                  minLength: {
                    value: 6,
                    message: 'A senha deve ter no mínimo 6 caracteres'
                  }
                })}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
