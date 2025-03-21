
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createTicket } from '@/lib/services/ticketService';
import { getDeadlines } from '@/lib/services/deadlineService';
import { Deadline } from '@/lib/types/sector.types';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const NewTicket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDeadlineId, setSelectedDeadlineId] = useState<number | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDeadlines, setIsLoadingDeadlines] = useState(true);

  useEffect(() => {
    const loadDeadlines = async () => {
      try {
        setIsLoadingDeadlines(true);
        const deadlinesData = await getDeadlines();
        setDeadlines(deadlinesData);
        if (deadlinesData.length > 0) {
          setSelectedDeadlineId(deadlinesData[0].id);
          setTitle(deadlinesData[0].titulo);
        }
      } catch (error) {
        console.error('Error loading deadlines:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os prazos cadastrados.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingDeadlines(false);
      }
    };

    loadDeadlines();
  }, [toast]);

  const handleDeadlineChange = (deadlineId: string) => {
    const selectedId = Number(deadlineId);
    setSelectedDeadlineId(selectedId);
    
    const selectedDeadline = deadlines.find((d) => d.id === selectedId);
    if (selectedDeadline) {
      setTitle(selectedDeadline.titulo);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDeadlineId || !description) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, selecione um prazo e preencha a descrição.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para criar um chamado.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedDeadline = deadlines.find((d) => d.id === selectedDeadlineId);
      
      if (!selectedDeadline) {
        throw new Error('Prazo selecionado não encontrado');
      }

      const sectorId = selectedDeadline.setor_id ?? 1; // Default to 1 if null

      // Create a new Date object for the current time
      const currentDate = new Date();
      
      // Parse the deadline duration string "HH:MM:SS"
      const prazoTime = selectedDeadline.prazo;
      const [hoursStr, minutesStr, secondsStr] = prazoTime.split(':');
      
      // Convert to numbers (using 0 as default if any part is missing)
      const hours = parseInt(hoursStr, 10) || 0;
      const minutes = parseInt(minutesStr, 10) || 0;
      const seconds = parseInt(secondsStr, 10) || 0;
      
      // Calculate total seconds for this deadline
      const totalDeadlineSeconds = (hours * 3600) + (minutes * 60) + seconds;
      
      // Create the deadline date by adding the total seconds to current time
      const deadlineDate = new Date(currentDate.getTime() + totalDeadlineSeconds * 1000);

      const newTicket = {
        titulo: title,
        descricao: description,
        setor_id: sectorId,
        solicitante_id: user.id,
        responsavel_id: user.id, // Adding responsavel_id
        status: 'Aberto',
        data_criacao: currentDate.toISOString(),
        prazo: deadlineDate.toISOString(),
      };

      await createTicket(newTicket);
      
      toast({
        title: 'Chamado criado',
        description: 'Seu chamado foi criado com sucesso!',
      });
      
      navigate('/tickets');
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o chamado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/tickets');
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20 animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Novo Chamado</h1>
        <p className="text-muted-foreground">Crie um novo chamado no sistema</p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="deadline-title" className="block text-sm font-medium mb-1">
              Selecione um Prazo <span className="text-red-500">*</span>
            </label>
            {isLoadingDeadlines ? (
              <div className="w-full p-2 border rounded-lg bg-gray-50">Carregando prazos...</div>
            ) : deadlines.length === 0 ? (
              <div className="w-full p-2 border rounded-lg bg-red-50 text-red-500">
                Nenhum prazo cadastrado. Você precisa cadastrar prazos primeiro.
              </div>
            ) : (
              <Select
                value={selectedDeadlineId?.toString() || ''}
                onValueChange={handleDeadlineChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um prazo" />
                </SelectTrigger>
                <SelectContent>
                  {deadlines.map((deadline) => (
                    <SelectItem key={deadline.id} value={deadline.id.toString()}>
                      {deadline.titulo} {deadline.setor?.nome ? `(${deadline.setor.nome})` : ''} - {deadline.prazo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-32"
              placeholder="Descreva detalhadamente o problema ou solicitação"
              required
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center"
              disabled={isSubmitting || isLoadingDeadlines || deadlines.length === 0}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando...
                </>
              ) : (
                'Criar Chamado'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTicket;
