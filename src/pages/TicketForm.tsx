
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Deadline, TicketFormData } from '@/lib/types';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mockSectors } from '@/lib/mockData';
import { format, addDays } from 'date-fns';

const TicketForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [deadlineId, setDeadlineId] = useState<number>(0);
  const [availableDeadlines, setAvailableDeadlines] = useState<Deadline[]>([]);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      navigate('/login');
      return;
    }

    // Mock loading data
    const timer = setTimeout(() => {
      // Mock deadlines data based on selected sector
      const mockDeadlines: Deadline[] = [
        { id: 1, title: 'Prioridade Alta - TI', sectorId: 1, deadline: 'P1D' },  // 1 day
        { id: 2, title: 'Prioridade Média - TI', sectorId: 1, deadline: 'P3D' }, // 3 days
        { id: 3, title: 'Prioridade Baixa - TI', sectorId: 1, deadline: 'P7D' }, // 7 days
        { id: 4, title: 'Prioridade Alta - RH', sectorId: 3, deadline: 'P2D' },  // 2 days
        { id: 5, title: 'Prioridade Média - RH', sectorId: 3, deadline: 'P5D' }, // 5 days
        { id: 6, title: 'Prioridade Alta - Vendas', sectorId: 4, deadline: 'P1D' }, // 1 day
      ];
      
      setAvailableDeadlines(mockDeadlines);
      if (mockDeadlines.length > 0) {
        setDeadlineId(mockDeadlines[0].id);
        setSelectedDeadline(mockDeadlines[0]);
      }
      
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Update selected deadline when deadlineId changes
  useEffect(() => {
    const deadline = availableDeadlines.find(d => d.id === deadlineId);
    setSelectedDeadline(deadline || null);
  }, [deadlineId, availableDeadlines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'A descrição do chamado é obrigatória.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedDeadline) {
      toast({
        title: 'Erro de validação',
        description: 'Selecione um prazo válido para o chamado.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const ticketData: TicketFormData = {
        title: selectedDeadline.title, // Use the deadline title as the ticket title
        description,
        sectorId: selectedDeadline.sectorId,
        deadlineId,
      };
      
      console.log('Creating ticket:', ticketData);
      
      toast({
        title: 'Chamado criado',
        description: 'Seu chamado foi criado com sucesso.',
      });
      
      navigate('/tickets');
    } catch (error) {
      toast({
        title: 'Erro ao criar chamado',
        description: 'Ocorreu um erro ao criar o chamado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to calculate deadline date
  const calculateDeadlineDate = (deadlineStr: string | undefined) => {
    if (!deadlineStr) return '';
    
    const dayMatch = deadlineStr.match(/P(\d+)D/);
    if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      return format(addDays(new Date(), days), 'dd/MM/yyyy');
    }
    
    return '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20">
        <div className="flex items-center justify-center h-full">
          <Clock className="h-12 w-12 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20 animate-slide-up">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/tickets')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Chamados
        </Button>
        
        <h1 className="text-3xl font-bold">Novo Chamado</h1>
        <p className="text-muted-foreground mt-1">
          Crie um novo chamado utilizando um prazo pré-definido
        </p>
      </div>
      
      <div className="bg-white rounded-xl border shadow-sm p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="deadline">Tipo de Prazo</Label>
            <select
              id="deadline"
              value={deadlineId}
              onChange={(e) => setDeadlineId(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
              required
              disabled={availableDeadlines.length === 0}
            >
              {availableDeadlines.length > 0 ? (
                availableDeadlines.map(deadline => (
                  <option key={deadline.id} value={deadline.id}>
                    {deadline.title} - {mockSectors.find(s => s.id === deadline.sectorId)?.name}
                  </option>
                ))
              ) : (
                <option value="">Não há prazos disponíveis</option>
              )}
            </select>
            
            {selectedDeadline && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                <p className="font-medium text-blue-800">Detalhes do prazo selecionado:</p>
                <p className="mt-1">Setor: {mockSectors.find(s => s.id === selectedDeadline.sectorId)?.name}</p>
                <p>Prazo: {parseDuration(selectedDeadline.deadline)} dias (até {calculateDeadlineDate(selectedDeadline.deadline)})</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Chamado</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva seu problema ou solicitação detalhadamente (máximo 200 caracteres)"
              className="min-h-[150px]"
              maxLength={200}
              required
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/200 caracteres</p>
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/tickets')}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || !selectedDeadline}>
              {isSaving ? 'Salvando...' : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Chamado
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper to parse ISO duration to days
const parseDuration = (duration: string): string => {
  const dayMatch = duration.match(/P(\d+)D/);
  if (dayMatch) {
    return dayMatch[1];
  }
  return '1';
};

export default TicketForm;
